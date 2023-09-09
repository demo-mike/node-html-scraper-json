import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import { parse } from "node-html-parser";
import { clearDirectory } from "./helpers/clearDirectory.js";
import { fetchAndReturnHtmlByUrl } from "./helpers/fetchAndReturnHtmlByUrl.js";
import { getValueBySelector } from "./helpers/getValueBySelector.js";
import { handleize } from "./helpers/handleize.js";
import { parseCollections } from "./components/parseAndExtractCollectionData.js";
import { fetchProducts } from "./components/fetchProducts.js";
import { extractVariantLinks } from "./components/extractVariantLinks.js";
import { processProductData } from "./components/processProductData.js";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;
const getCollections = true;
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
  collection_breadcrumbs: ".breadcrumbs__list",
  collection_product_link: ".c-product-card__title-link",
  collection_product_title: ".c-product-card__title-link",
};

// The target page element selectors on product pages
const productPageElements = {
  product_variant_parent_selector: `.c-product-colours__body`,
  product_title: `h1.c-product-overview__heading`,
  product_description: `[data-test="pdp-description"] > p:first-child`,
  product_sku: `[itemprop="sku"]`,
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

  // Read the extracted-data.json file
  const productData = JSON.parse(await readFile("./data-extract/extracted-data.json", "utf-8"));
  // For each product page, fetch and save the HTML
  if (getProducts) {
    await clearDirectory("./data-products");
    // Fetch and save the HTML for each product
    await fetchProducts(baseUrl, productData, pageLoadWaitTimeMS);
  }

  await extractProductData(productData);

  console.log(chalk.green("\n🥳 Done!\n"));
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});

// A function to for each product html page to extract the product data
const extractProductData = async (productData) => {
  const productFiles = await readdir("data-products");

  for (const product of productFiles) {
    const html = await readFile(`data-products/${product}`, "utf-8");
    console.log(chalk.yellow(`🕵️‍♂️ Reading product file: ${product}\n`));

    const variantLinks = extractVariantLinks(html, productPageElements.product_variant_parent_selector);
    console.log("variantLinks:", variantLinks);
    if (variantLinks > 0) {
      for (const link of variantLinks) {
        const variantHtml = await fetchAndReturnHtmlByUrl(link, pageLoadWaitTimeMS);
        // What do I do with this data?
      }
    }

    const title = await getValueBySelector(html, productPageElements.product_title);
    const description = await getValueBySelector(html, productPageElements.product_description);
    const handle = handleize(title);
    const sku = await getValueBySelector(html, productPageElements.product_sku, "sku", "Style #");

    // Variants Sizes
    const variantSizes = await getValueBySelector(html, `#field_sku`, "selectSlice", " ");

    // Meta Data (Custom for each store)
    const metafields = [
      {
        key: "size_and_fit",
        value: await getValueBySelector(html, `[data-test="pdp-accordion-content-size_fit"]`),
      },
      {
        key: "details_and_care",
        value: await getValueBySelector(html, '[data-test="pdp-accordion-content-details_care"]', "allText"),
      },
    ];

    //console.log("🚀 :", { title, description, handle, sku, variantSizes, metafields });
  }
};
