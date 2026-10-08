import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = "C:/Users/abdul/.gemini/antigravity-ide/brain/bd21d739-3d2e-4736-a36d-4f9b36d22784/qa";

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const VIEWPORTS = [
  { width: 360, height: 740, label: "360px" },
  { width: 480, height: 800, label: "480px" },
  { width: 768, height: 1024, label: "768px" },
  { width: 1024, height: 768, label: "1024px" },
  { width: 1280, height: 800, label: "1280px" },
  { width: 1440, height: 900, label: "1440px" },
];

const ROUTES = [
  { id: "en-home", path: "/en", name: "English Home" },
  { id: "en-video", path: "/en/watch/why-your-name-gets-your-attention", name: "English Video" },
  { id: "en-article", path: "/en/read/why-your-name-stands-out-in-a-noisy-room", name: "English Article" },
  { id: "ps-home", path: "/ps", name: "Pashto Home" },
  { id: "ps-video", path: "/ps/watch/why-your-name-gets-your-attention", name: "Pashto Video" },
  { id: "ps-article", path: "/ps/read/why-your-name-stands-out-in-a-noisy-room", name: "Pashto Article" },
  { id: "fa-home", path: "/fa", name: "Dari Home" },
  { id: "fa-video", path: "/fa/watch/why-your-name-gets-your-attention", name: "Dari Video" },
  { id: "fa-article", path: "/fa/read/why-your-name-stands-out-in-a-noisy-room", name: "Dari Article" },
];

async function main() {
  console.log("Starting Comprehensive Visual QA Audit...");
  const browser = await chromium.launch({ headless: true });
  const results: any[] = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting viewport: ${vp.label} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    for (const route of ROUTES) {
      const url = `http://localhost:3000${route.path}`;
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
      } catch {
        await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(1000);
      }

      // 1. Check Horizontal Overflow
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        };
      });

      // 2. Video Player checks on video route
      let playerStats: any = null;
      if (route.id.includes("-video")) {
        playerStats = await page.evaluate(() => {
          const el = document.querySelector(".video-player-ratio");
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          const computed = window.getComputedStyle(el);
          return {
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            aspectRatio: (rect.width / rect.height).toFixed(2),
            aspectRatioCss: computed.aspectRatio,
            classes: Array.from(el.classList),
          };
        });
      }

      // 3. Skip Link checks on Home route
      let skipLinkStats: any = null;
      if (route.id === "en-home") {
        skipLinkStats = await page.evaluate(() => {
          const sl = document.querySelector(".skip-link");
          if (!sl) return null;
          const rectBefore = sl.getBoundingClientRect();
          return {
            widthBefore: rectBefore.width,
            heightBefore: rectBefore.height,
            visibleBefore: rectBefore.width > 10 && rectBefore.height > 10,
          };
        });
      }

      // Capture screenshot
      const shotName = `${route.id}_${vp.width}px.png`;
      const shotPath = path.join(ARTIFACTS_DIR, shotName);
      await page.screenshot({ path: shotPath, fullPage: false });

      results.push({
        route: route.name,
        path: route.path,
        viewport: vp.label,
        overflow: overflow.hasOverflow ? `FAIL: ${overflow.scrollWidth}px vs ${overflow.clientWidth}px` : "PASS",
        player: playerStats,
        skipLink: skipLinkStats,
        screenshot: shotName,
      });

      console.log(`  [${vp.label}] ${route.name}: Overflow=${overflow.hasOverflow ? "FAIL" : "PASS"}${playerStats ? ` | Player: ${playerStats.width}x${playerStats.height} (${playerStats.aspectRatio}:1)` : ""}`);
    }

    await context.close();
  }

  // Keyboard accessibility test for Skip Link
  console.log("\nTesting Keyboard Skip Link Focus Interaction...");
  const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const kbPage = await keyboardContext.newPage();
  await kbPage.goto("http://localhost:3000/en", { waitUntil: "domcontentloaded" });
  await kbPage.keyboard.press("Tab");
  await kbPage.waitForTimeout(300);
  const skipFocused = await kbPage.evaluate(() => {
    const active = document.activeElement;
    if (!active || !active.classList.contains("skip-link")) return null;
    const rect = active.getBoundingClientRect();
    return {
      tagName: active.tagName,
      text: active.textContent?.trim(),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      left: Math.round(rect.left),
    };
  });
  const skipShotPath = path.join(ARTIFACTS_DIR, "skip_link_focused_1280px.png");
  await kbPage.screenshot({ path: skipShotPath });
  console.log("Skip link focus stats:", skipFocused);
  await keyboardContext.close();

  await browser.close();
  console.log("\nVisual QA Run Complete! All screenshots saved to:", ARTIFACTS_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
