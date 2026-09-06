import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Screenshot our own page (which shows the "Bus Stop „KLINIKUM"" header and
// embeds the HAFAS widget below it) rather than the raw vmt.hafas.cloud
// widget URL directly — the header only exists on our page, not the widget.
const URL = "https://nihaorichard.github.io/vmt-klinikum/";

const WIDTH = 1600;
const HEIGHT = 960;

// Where the screenshot ends up in the repo. Since this repo is served at
// nihaorichard.github.io/vmt-klinikum/, saving to the repo root as latest.png
// makes it reachable at .../vmt-klinikum/latest.png
const OUTPUT_PATH = path.resolve(__dirname, "..", "latest.png");

async function main() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    });

    // Give our page + its embedded HAFAS widget (iframe) generous time to
    // load and fetch live departure data.
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

    // The board renders asynchronously after the network goes idle
    // (departure rows populate a moment later, and there's an extra
    // iframe hop now) — pad with a fixed wait.
    await page.waitForTimeout(8_000);

    await page.screenshot({ path: OUTPUT_PATH });
    console.log(`Saved screenshot to ${OUTPUT_PATH}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
