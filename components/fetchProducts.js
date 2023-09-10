import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import { fetchAndReturnHtmlByUrl } from "../helpers/fetchAndReturnHtmlByUrl.js";

export async function fetchProducts(baseUrl, productData, wait) {
  for (const product of productData) {
    // Fetch and save each product page HTML to directory
    const html = await fetchAndReturnHtmlByUrl(`${baseUrl}${product.productUrl}`, wait);
    if (html !== null) {
      const productFilePath = `./data-products/${product.handle}.html`;
      await writeFile(productFilePath, html);

      // Update the product data with the product file path
      product.productFilePath = productFilePath;
    } else {
      console.log(chalk.yellow(`⚠️ Skipping product due to fetch failure: ${product.productUrl}`));
    }
  }

  // Update the extracted-data.json file
  await writeFile("./data-extract/extracted-data.json", JSON.stringify(productData, null, 2));

  console.log(chalk.green(`💾 ${productData.length} products have been updated and saved to ./data-extract/extracted-data.json!\n`));
}
