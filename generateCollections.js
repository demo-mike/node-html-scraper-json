import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import fetch from "node-fetch";
import { getShopProducts } from "./components/getShopProducts.js";
import { createCollection } from "./components/createCollection.js";

const get_products = true;
// Function to delay the execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main function to create products and collections in Shopify
 */
async function main() {
  if (get_products) {
    await getShopProducts();
  }
  // Read productTags.json
  const tagsJson = await fs.readFile("./data-products/product-tags.json", "utf-8");
  const extractedTags = JSON.parse(tagsJson);

  for (const tag of extractedTags) {
    try {
      const response = await createCollection(tag);
      const userErrors = response.data.collectionCreate.userErrors;

      if (userErrors.length > 0) {
        console.error(`Error creating collection for tag "${tag}":`, userErrors);
      } else {
        console.log(`Created collection for tag "${tag}" with ID: ${response.data.collectionCreate.collection.id}`);
      }

      // Wait for 1 second before making the next API call
      await delay(1000);
    } catch (error) {

    }

  console.log(chalk.green("\n🥳 Done!\n"));
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});
