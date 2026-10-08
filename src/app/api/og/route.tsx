import sharp from "sharp";
import path from "node:path";
import { NextRequest } from "next/server";
import { getSettings } from "@/lib/data/cms";
import { getMergedMessages } from "@/lib/ui-strings";
export const runtime = "nodejs";
const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export async function GET(req: NextRequest) {
  try {
    const locale = ["ps", "fa"].includes(
      req.nextUrl.searchParams.get("locale") || "",
    )
      ? (req.nextUrl.searchParams.get("locale") as "ps" | "fa")
      : "en";
    const settings = await getSettings(locale);
    const messages = await getMergedMessages(locale);
    const title = (
      req.nextUrl.searchParams.get("title") || messages.home.hero_headline
    ).slice(0, 180);
    const arabic = locale !== "en";
    const render = async (
      text: string,
      size: number,
      maxHeight: number,
      native: boolean,
    ) => {
      const font = native ? "Noto Naskh Arabic" : "Newsreader";
      const fontfile = path.join(
        process.cwd(),
        "public/fonts",
        native ? "NotoNaskhArabic.ttf" : "Newsreader.ttf",
      );
      return sharp({
        text: {
          text: `<span foreground="#1B1B18">${escape(text)}</span>`,
          font: `${font} ${size}`,
          fontfile,
          width: 1040,
          dpi: 72,
          align: arabic ? "right" : "left",
          rgba: true,
          wrap: "word",
        },
      })
        .resize({
          width: 1040,
          height: maxHeight,
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();
    };
    const layers = await Promise.all([
      render(settings.siteName, 28, 64, false),
      render(title, 54, 280, arabic),
      render(settings.tagline || messages.home.hero_subheading, 24, 90, arabic),
    ]);
    const positions = [60, 170, 500];
    const composites = await Promise.all(
      layers.map(async (input, index) => {
        const dimensions = await sharp(input).metadata();
        return {
          input,
          left: arabic ? 1120 - (dimensions.width || 1040) : 80,
          top: positions[index],
        };
      }),
    );
    const output = await sharp({
      create: { width: 1200, height: 630, channels: 4, background: "#FAF7F0" },
    })
      .composite(composites)
      .png()
      .toBuffer();
    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
