import cleanAndFetchFiles from "./cleanAndFetchFiles.js";
import { readdir, readFile } from "fs/promises";
import chalk from "chalk";
import countdown from "./countdown.js";
import { parseHTML } from "./htmlTransform.js";
import { parse } from "node-html-parser";

const baseUrl = "https://www.express.com";

const collectionUrls = [
  "https://www.express.com/womens-clothing/tops/cat430028?ICID=TN_W_TOPS_CLOTHING",
  // "https://www.express.com/womens-clothing/dresses/cat550007?ICID=TN_W_DRESSES_CLOTHING",
  // "https://www.express.com/mens-clothing/shirts/cat410008",
  // "https://www.express.com/mens-clothing/jeans/cat400003?ICID=TN_M_JEANS_CLOTHING",
];

const productAnchorTarget = `.x1Y39`;

/**
 * Parses HTML files in the "data-collections" directory and extracts product URLs
 * @returns {Promise<string[]>} - A promise that resolves to an array of product URLs
 */
async function parseCollectionFiles() {
  const files = await readdir("data-collections");
  const productUrls = new Set(); // Use a Set to automatically remove duplicates
  for (const file of files) {
    const html = await readFile(`data-collections/${file}`, "utf-8");
    console.log(chalk.yellow(`🕵️‍♂️ Parsing file: ${file}\n`));
    try {
      const root = parse(html);
      // Extract product URLs and add them to the Set
      const urls = root.querySelectorAll(productAnchorTarget).map((element) => {
        const href = element.getAttribute("href");
        return `${baseUrl}${href}`;
      });
      urls.forEach((url) => productUrls.add(url));
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error}\n`));
      break;
    }
  }
  return Array.from(productUrls); // Convert the Set to an array before returning
}

/**
 * Scrapes collection and product data from the web
 */
async function scrapeAndTransformData() {
  // Fetch HTML for each collection URL and save it to the "data-collections" directory
  await cleanAndFetchFiles(collectionUrls, "data-collections");
  console.log(chalk.yellow(`✅ HTML Extraction Complete! Now running parsing operations`));
  countdown(5, async () => {
    // Parse the collection files to extract product URLs
    const productUrls = await parseCollectionFiles();
    // Fetch HTML for each product URL and save it to the "data-products" directory
    await cleanAndFetchFiles(productUrls, "data-products");
  });
}

scrapeAndTransformData();
