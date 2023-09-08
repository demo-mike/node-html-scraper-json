import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export default async function downloadImage(imageUrl, directory) {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(imageUrl, { waitUntil: "networkidle" });

    // Wait for the image to load
    const image = await page.waitForSelector("img");

    const filename = path.basename(new URL(imageUrl).pathname.replace(".jpg", "")) + ".png";
    const imagePath = path.join(directory, filename);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Take a screenshot of just the image
    await image.screenshot({ path: imagePath });

    console.log(`Image downloaded at ${imagePath}`);

    await browser.close();

    return imagePath;
  } catch (error) {
    console.error(`Failed to download image from ${imageUrl}: ${error}`);
  }
}
