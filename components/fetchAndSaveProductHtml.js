import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import fetchAndReturnHtmlByUrl from "../helpers/fetchAndReturnHtmlByUrl.js";

async function fetchAndSaveProductHtml(productData) {
  // Loop over each product
  for (const product of productData) {
    // Fetch the HTML for the product URL
    const html = await fetchAndReturnHtmlByUrl(product.productUrl);

    // Save the HTML to a file
    const productFilePath = `./data-products/${product.handle}.html`;
    await writeFile(productFilePath, html);

    // Update the product data with the product file path
    product.productFilePath = productFilePath;
  }

  // Update the extracted-data.json file
  await writeFile("./data-extract/extracted-data.json", JSON.stringify(productData, null, 2));

  console.log(chalk.green(`💾 ${productData.length} products have been updated and saved to ./data-extract/extracted-data.json!\n`));
}
