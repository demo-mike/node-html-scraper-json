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

// The target elemenent for product page linkes from collection pages
const productAnchorTarget = `.x1Y39`;

// The target elements on product pages
const productTargetElements = {
  // Target the Category name of the collection page for example: Stollers, Cribs, Chairs
  category: `.cFdf0AQO`,

  // The parent container of a single product card on the collections page
  productCard: `[data-layout="default"]`,

  // Product Attributes
  title: `.header1`,
  description: `.bodySecondarySelector`,
  regularPrice: `.price__price`,
  salePrice: ".KFXFUhqz",
  strikethroughPrice: ".nQSW8PKD",

  // SKU container and target attribute
  skuTargetAttribute: `.CE8ioEON`,
  skuBeforeString: "Style ",
  skuAfterString: null,

  // Product Image
  image: ".RrzfP",

  // Vendor
  vendor: "Express",

  // Tag Elements
  tagElements: {
    badge: "",
  },

  // Variant Attributes
  variantContainer: `.colorSwatchGroup__Swatches`,
  variantOptionName: "Color",
  variantOptionValue: `.colorSwatchNameName`,
};

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
 * Parses HTML files in the "data-products" directory and extracts product data
 */
async function parseProductFiles() {
  const files = await readdir("data-products");
  for (const file of files) {
    const html = await readFile(`data-products/${file}`, "utf-8");
    console.log(chalk.yellow(`🕵️‍♂️ Parsing file: ${file}\n`));
    try {
      parseHTML(html, productTargetElements);
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error}\n`));
      break;
    }
  }
}

/**
 * Scrapes collection and product data from the web
 */
async function scrapeAndTransformData() {
  // Fetch HTML for each collection URL and save it to the "data-collections" directory
  // *** await cleanAndFetchFiles(collectionUrls, "data-collections");
  console.log(chalk.yellow(`✅ HTML Extraction Complete! Now running parsing operations`));
  countdown(5, async () => {
    // Parse the collection files to extract product URLs
    const productUrls = await parseCollectionFiles();
    // Fetch HTML for each product URL and save it to the "data-products" directory
    // *** await cleanAndFetchFiles(productUrls, "data-products");
    // Parse the product files to extract product data
    await parseProductFiles();
  });
}

scrapeAndTransformData();
