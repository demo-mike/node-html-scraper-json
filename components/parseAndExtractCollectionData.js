import { readdir, readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import chalk from "chalk";
import { handleize } from "../helpers/handleize.js";
import { fetchAndReturnHtmlByUrl } from "../helpers/fetchAndReturnHtmlByUrl.js";
import { getValueBySelector } from "../helpers/getValueBySelector.js";

/**
 * Fetches HTML content of each URL, saves it to a file in the data-collections directory,
 * and extracts product data from the saved HTML files.
 * @param {Array} collections - The array of collection URLs to fetch
 * @param {Object} targetElements - The target elements on product pages
 * @returns {Promise<void>}
 */
export async function parseCollections(collections, targetElements) {
  for (const url of collections) {
    console.log(chalk.yellow(`🌐 Fetching HTML content for ${url}\n`));

    // Fetch the HTML content of the URL
    const html = await fetchAndReturnHtmlByUrl(url);
    const root = parse(html);

    // Save the HTML content to a file in the data-collections directory
    const categoryElement = root.querySelector(targetElements.collection_category);
    const category = categoryElement ? categoryElement.text : "";
    const fileName = handleize(category);
    const filePath = `./data-collections/${fileName}.html`;
    await writeFile(filePath, html);

    console.log(chalk.green(`💾 Saved HTML content to ${filePath}\n`));

    // Extract product data
    await extractProductData(
      targetElements.collection_category,
      targetElements.collection_breadcrumbs,
      targetElements.collection_product_link,
      targetElements.collection_product_title,
      "./data-collections"
    );
  }
}

/**
 * Extracts product data from HTML files in a specific directory and saves it to a JSON file
 * @param {string} categorySelector - The JS selector for the product category
 * @param {string} tagSelector - The JS selector for the product tags
 * @param {string} productLinksSelector - The JS selector for the product links
 * @param {string} productLinkHandle - The product title to handleize
 * @param {string} directory - The directory to parse files from
 * @returns {Promise<void>}
 */
async function extractProductData(categorySelector, tagSelector, productLinksSelector, productLinkHandle, directory) {
  try {
    console.log(chalk.yellow(`🔍 Extracting product data from HTML files in ${directory}\n`));

    // Read the names of all files in the directory
    const files = await readdir(directory);

    // Initialize an array to store product data
    const productData = [];

    // Loop over each file
    for (const file of files) {
      // Read the content of the file
      const html = await readFile(`${directory}/${file}`, "utf-8");

      // Parse the HTML content
      const root = parse(html);

      // Select the product category element
      // We need this because it's usually not on the product page
      const categoryElement = root.querySelector(categorySelector);
      const category = categoryElement ? categoryElement.text : "";
      const tags = await getValueBySelector(html, tagSelector, "breadcrumbs");

      // Select all elements that match the productLinksSelector
      // These will be all the urls to the product pages for each collection page item
      const productLinkElements = root.querySelectorAll(productLinksSelector);

      // Extract product data from each product link
      productLinkElements.forEach((element) => {
        const productUrl = element.getAttribute("href");
        const productTitle = element.innerText.trim();
        const collectionFilePath = `${directory}/${file}`;
        const handle = handleize(productTitle);

        // Add the product data to the array
        productData.push({
          productUrl,
          collectionFilePath,
          handle,
          product_type: category,
          tags,
        });
      });
    }

    // Write the product data to a JSON file
    await writeFile("./data-extract/extracted-data.json", JSON.stringify(productData, null, 2));

    console.log(chalk.green(`💾 ${productData.length} products have been extracted and saved to ./data-extract/extracted-data.json!\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}
