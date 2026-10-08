export interface TranslationRequest {
  sourceText: string;
  sourceLocale: "en" | "ps" | "fa";
  targetLocale: "en" | "ps" | "fa";
  contentType: "title" | "summary" | "body" | "description" | "transcript";
  glossary?: Array<{
    termEn: string;
    termPs?: string;
    termFa?: string;
    doNotTranslate?: boolean;
  }>;
}

export interface TranslationResult {
  translatedText: string;
  provider: "anthropic";
  inputTokens: number;
  outputTokens: number;
  targetLocale: "en" | "ps" | "fa";
  characterCount: number;
  estimatedCostUsd: number;
  safeguardWarnings: string[];
}

// PRD Section 11.3 System Prompt Rules
export function buildSystemPrompt(targetLocale: "ps" | "fa" | "en"): string {
  const targetScriptRules =
    targetLocale === "ps"
      ? "- Translate strictly into Pashto using native Arabic script (never Roman Pashto). Respect Pashto typography (ټ ډ ړ ږ ښ ڼ ګ ې ۍ)."
      : targetLocale === "fa"
        ? "- Translate strictly into Dari (Afghan Persian usage, NOT Iranian Persian where vocabulary differs). Display label is دری."
        : "- Translate into clear, high-readability editorial English.";

  return `You are the lead scientific translator for Beyond Rasooli, a premium editorial publication on psychology, human behaviour, and cognitive science.

Rules:
1. Preserve meaning exactly; do not add, remove, or exaggerate any empirical claim.
2. Keep scientific hedging words intact ("may", "suggests", "in some studies", "preliminary evidence").
3. Keep all numbers, statistical percentages, citation years, study author names, and URLs identical.
4. ${targetScriptRules}
5. If the input is JSON, return only valid JSON with exactly the same keys and array lengths; translate prose string values and leave empty values empty.
6. Tone: Calm, evidence-led, accessible, academic yet engaging. No sensationalist clickbait.`;
}

// Safeguard checks (PRD Section 11.3)
export function runTranslationSafeguards(
  source: string,
  translated: string,
  targetLocale: string,
): string[] {
  const warnings: string[] = [];

  // 1. Check for untranslated Latin Pashto/Dari
  if (targetLocale === "ps" || targetLocale === "fa") {
    const latinWords = translated.match(/[a-zA-Z]{4,}/g) || [];
    // Allow URLs, brand names
    const filtered = latinWords.filter(
      (w) => !["Beyond", "Rasooli", "https", "http", "doi", "org"].includes(w),
    );
    if (filtered.length > 5) {
      warnings.push(
        `Potential untranslated Latin words detected: ${filtered.slice(0, 3).join(", ")}...`,
      );
    }
  }

  // 2. Check for empty translation
  if (!translated.trim()) {
    warnings.push("Translation output is empty.");
  }

  return warnings;
}

// Provider Adapter Implementation
export async function translateText(
  req: TranslationRequest,
): Promise<TranslationResult> {
  const charCount = req.sourceText.length;
  const estimatedCost = 0; // The protected endpoint records actual usage and enforces the CMS monthly cap.

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;
  if (!model) throw new Error("translation_provider_unavailable");

  if (anthropicApiKey) {
    try {
      const response = await fetch(process.env.BEYOND_QA === "true" && process.env.DATABASE_URI?.startsWith("file:") && process.env.QA_TRANSLATION_URL === "http://localhost:3199/translate" ? process.env.QA_TRANSLATION_URL : "https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          system:
            buildSystemPrompt(req.targetLocale) +
            "\nScientific glossary: " +
            JSON.stringify(req.glossary || []),
          messages: [
            {
              role: "user",
              content: `Translate the following text into ${req.targetLocale}:\n\n${req.sourceText}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        const data = await response.json();
        const text =
          data.content
            ?.filter(
              (part: { type: string; text?: string }) => part.type === "text",
            )
            .map((part: { text: string }) => part.text)
            .join("\n") || "";
        if (!text.trim()) throw new Error("translation_provider_unavailable");
        const warnings = runTranslationSafeguards(
          req.sourceText,
          text,
          req.targetLocale,
        );
        return {
          translatedText: text,
          provider: "anthropic",
          inputTokens: Number(data.usage?.input_tokens || 0),
          outputTokens: Number(data.usage?.output_tokens || 0),
          targetLocale: req.targetLocale,
          characterCount: charCount,
          estimatedCostUsd: estimatedCost,
          safeguardWarnings: warnings,
        };
      }
    } catch {
      console.error("Translation provider request failed.");
    }
  }

  throw new Error("translation_provider_unavailable");
}
