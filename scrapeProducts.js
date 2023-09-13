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
import { extractVariantLinksAndColors } from "./components/extractVariantLinksAndColors.js";
import { processProductData } from "./components/processProductData.js";
import { returnOptionsArray } from "./components/returnOptionsArray.js";
import { createVariantProps } from "./components/createVariantProps.js";
import { extractProductImages, extractColorSwatchImagesAndAlt } from "./components/extractProductImages.js";
import { extractProductData } from "./components/extractProductData.js";

const mode = "manual"; // 'auto' or 'manual'
const getCollections = true;
const getProducts = true;

// The time to wait for the page to load before saving the HTML file
// This could be 5000 (5 seconds) or more depending on the site and up to 29000 max.
const pageLoadWaitTimeMS = 2000;

// The base URL for the online store
const baseUrl = "https://www.dunnesstores.com";

// The array of collection URLs to fetch
const collectionUrls = ["https://www.dunnesstores.com/c/men/clothing/shirts"];

// The target page element selectors on collection pages
const collectionPageElements = {
  collection_category: "#plp-banner h1",
  collection_breadcrumbs: ".breadcrumbs__list",
  collection_product_link: ".c-product-card__title-link",
  collection_product_title: ".c-product-card__title-link",
};

const variantOptions = {
  product_option1: "Colour",
  product_option1_selector: ".c-product-colours__swatch",
  product_option2: "Size",
  product_option2_selector: "#field_sku",
};

// The target page element selectors on product pages
const productPageElements = {
  product_title: `h1.c-product-overview__heading`,
  product_description: `[data-test="pdp-description"] > p:first-child`,
  product_sku: `[itemprop="sku"]`,
  product_sku_filter: "Style #",
  product_price: `.price__offer > span`,
  product_vendor: `Dunnes Stores`,
  product_gallery_images: `img.u-img-responsive`,
  product_gallery_skip_first_img: true,
  product_gallery_skip_filter: "/600/",
  product_color_swatch_images: `.c-product-colours__swatch img`,
};

const variantPageElements = {
  variant_color: `.c-product-colours__heading > span`,
  variant_image: `.product-images__list-item .mz-figure img`,
};

// Structure each object in the array to include the key, selector, and value_type
// This will be unique to each site
const metaFieldMap = [
  {
    key: "size_and_fit",
    selector: `[data-test="pdp-accordion-content-size_fit"]`,
    selector_type: "text",
    type: "string",
  },
  {
    key: "details_and_care",
    selector: `[data-test="pdp-accordion-content-details_care"]`,
    selector_type: "allText",
    type: "string",
  },
];

/**
 * Main function to fetch and save HTML for each collection and product page
 */
async function main() {
  let fullUrls;

  if (mode === "auto") {
    // Read the navigation-links.json file
    const navigationLinks = JSON.parse(await readFile("./data-navigation/navigation-links.json", "utf-8"));

    // Filter the navigation links to only include those with a value
    const validLinks = navigationLinks.filter((link) => link.value);

    // Map the valid links to full URLs
    fullUrls = validLinks.map((link) => `${baseUrl}${link.value}`);
  } else if (mode === "manual") {
    fullUrls = collectionUrls;
  }

  // From the array of collection URLs, fetch and save the HTML for each collection
  if (getCollections) {
    await clearDirectory("./data-extract");
    await clearDirectory("./data-collections");
    await parseCollections(fullUrls, collectionPageElements);
  }

  // Read the extracted-data.json file
  const productData = JSON.parse(await readFile("./data-extract/extracted-data.json", "utf-8"));

  // For each product page, fetch and save the HTML
  if (getProducts) {
    await clearDirectory("./data-products");
    // Fetch and save the HTML for each product
    await fetchProducts(baseUrl, productData, pageLoadWaitTimeMS);
  }

  await extractProductData(productData, productPageElements, variantOptions, variantPageElements, metaFieldMap, baseUrl, pageLoadWaitTimeMS);

  console.log(chalk.green("\n🥳 Done!\n"));
}

main().catch((error) => {
  console.error(chalk.red(`❌ Error: ${error}\n`));
});
