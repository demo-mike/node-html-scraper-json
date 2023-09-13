import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import fetch from "node-fetch";
import { getShopProducts } from "./components/getShopProducts.js";
import { createCollection } from "./components/createCollection.js";

const get_products = true;
// This will create tags for the following keywords
// eg. before: [ 'Clothing', 'Men', 'Shirts' ]
// eg. after: [ 'Men Clothing', 'Men', 'Men Shirts' ]
//  ****** This feature needs to be moved to the scrapeProducts script and tags must be created on each product there ******
const collection_keywords = ["Men", "Women"];

/**
 * Main function to create products and collections in Shopify
 */
async function main() {
  if (get_products) {
    await getShopProducts();
  }

  const collectionTagsJson = await readFile("./data-shop/product-tags.json", "utf-8");
  const collectionTags = JSON.parse(collectionTagsJson);

  for (const tag of collectionTags) {
    await createCollection(tag);
  }
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});
