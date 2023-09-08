import { chromium } from "playwright";
import { minify } from "html-minifier";
import { parse } from "node-html-parser";

export async function fetchAndParseVariant(url) {
  try {
    console.log(`🌐 Fetching Variant HTML from ${url}`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const body = minify(await page.content(), {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await browser.close();
    console.log(`✅ Successfully fetched HTML from ${url}`);
    return parse(body);
  } catch (error) {
    console.error(`❌ Error fetching HTML from ${url}: ${error}`);
  }
}
