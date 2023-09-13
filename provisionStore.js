import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import fetch from "node-fetch";
import { createProduct } from "./components/createAndUpdateProduct.js";

const productData = JSON.parse(await readFile("./data-extract/extracted-data.json", "utf-8"));

/**
 * Main function to create products and collections in Shopify
 */
async function main() {
  for (const product in productData) {
    if (productData[product].title) {
      await createProduct(productData[product]);
      console.log(chalk.green(`\n⏳ Taking a breather before creating the next product...\n`));
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(chalk.green("\n🥳 Done!\n"));
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});
