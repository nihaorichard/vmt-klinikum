import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The MCT stationboard link, overridden to point at the "Weimar, Klinikum" stop
// (station=155033) with the product/line filter cleared and headline blanked.
const URL =
  "https://vmt.hafas.cloud/mct/views/monitor/index.html" +
  "?cfgFile=Bb01FAozvVHK2oWN7hjA_1612186328552" +
  "&station=155033" +
  "&productOrder=%5B%5D" +
  "&monitorHeadline=";

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

    // Give the HAFAS widget generous time to load + fetch live departure data.
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 });

    // The board renders asynchronously after the network goes idle
    // (departure rows populate a moment later) — pad with a fixed wait.
    await page.waitForTimeout(6_000);

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
