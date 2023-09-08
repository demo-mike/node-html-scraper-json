import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import { parse } from "node-html-parser";
import clearDirectory from "./helpers/clearDirectory.js";
import { fetchAndReturnHtmlByUrl } from "./helpers/fetchAndReturnHtmlByUrl.js";
import { parseCollections } from "./components/parseAndExtractCollectionData.js";
import { fetchProducts } from "./components/fetchProducts.js";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;
const getCollections = false;
const getProducts = false;

// The time to wait for the page to load before saving the HTML file
// This could be 5000 or more depending on the site and up to 29000 max.
const pageLoadWaitTimeMS = 200;

// The base URL for the online store
const baseUrl = "https://www.dunnesstores.com";

// The array of collection URLs to fetch
const collectionUrls = ["https://www.dunnesstores.com/c/women/clothing/dresses", "https://www.dunnesstores.com/c/men/clothing/shirts"];

// The target page element selectors on collection pages
const collectionPageElements = {
  collection_category: "#plp-banner h1",
  collection_product_link: ".c-product-card__title-link",
  collection_product_title: ".c-product-card__title-link",
};

/**
 * Main function to fetch and save HTML for each collection and product page
 */
async function main() {
  // From the array of collection URLs, fetch and save the HTML for each collection
  if (getCollections) {
    await clearDirectory("./data-collections");
    await parseCollections(collectionUrls, collectionPageElements);
  }

  // For each product page, fetch and save the HTML
  if (getProducts) {
    await clearDirectory("./data-products");
    // Read the extracted-data.json file
    const productData = JSON.parse(await readFile("./data-extract/extracted-data.json", "utf-8"));

    // Fetch and save the HTML for each product
    await fetchProducts(baseUrl, productData, pageLoadWaitTimeMS);
  }

  // A function to for each product html page to extract the product data
  const extractProductData = async (productHtml) => {
    // This will be multiple steps and each step will update the objects in the productData array by identifier handle
    // Each step should be a separate function imported from the components folder
    // 1. parse and extract the parent product data (title, description, price, compare at price, sku etc.)
    // 2. parse and extract the product variants (Color, Size, etc.)
    // 3. parse and extract the product images (Gallery Images)
    // 4. parse and extract the product description
    // 5. parse and extract the product metafields
    //
    // Considerations:
    // If the product has variants that route to another page, we need to fetch that page and extract the data from there
    // If the product does not have variants that route to another page, we need to extract the data from the product page
  };
  console.log(chalk.green("\n🥳 Done!\n"));
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});
