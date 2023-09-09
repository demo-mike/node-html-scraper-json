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

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;
const getCollections = true;
const getProducts = true;

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
  product_price: `.price__offer > span`,
  product_vendor: `Dunnes Stores`,
  product_gallery_images: `img.u-img-responsive`,
  product_color_swatch_images: `.c-product-colours__swatch img`,
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

    const variants = [];
    const options = returnOptionsArray(variantOptions.product_option1, variantOptions.product_option2);
    const images = [];

    // Main attributes
    const title = await getValueBySelector(html, productPageElements.product_title);
    const description = await getValueBySelector(html, productPageElements.product_description);
    const handle = handleize(title);
    const sku = await getValueBySelector(html, productPageElements.product_sku, "sku", "Style #");
    const price = await getValueBySelector(html, productPageElements.product_price);
    const productImages = await extractProductImages(html, productPageElements.product_gallery_images);
    images.push(...productImages);
    const colorSwatchImages = await extractColorSwatchImagesAndAlt(html, productPageElements.product_color_swatch_images);
    images.push(...colorSwatchImages);

    // Build variants array
    const variantLinks = extractVariantLinks(html, variantOptions.product_option1_selector);
    const variantSizes = await getValueBySelector(html, variantOptions.product_option2_selector, "selectSlice", " ");

    // Get color and image from the current HTML content
    let color = await getValueBySelector(html, ".c-product-colours__heading > span");
    let variantImage = await getValueBySelector(html, ".product-images__list-item .mz-figure img", "src");

    // Current Product
    for (const size of variantSizes) {
      const variant = createVariantProps({ color, size, sku, imageSrc: variantImage, price });
      variants.push(variant);
    }

    // Loop through each variantLink, fetch the HTML content for the link
    // and extract the color, SKU, and image from it
    for (const variantLink of variantLinks) {
      // Get props from the variant HTML content
      const variantHtml = await fetchAndReturnHtmlByUrl(`${baseUrl}${variantLink}`, pageLoadWaitTimeMS);

      // If variantHtml is null, skip to the next iteration
      if (variantHtml === null) {
        continue;
      }

      const variantSku = await getValueBySelector(variantHtml, productPageElements.product_sku, "sku", "Style #");
      color = await getValueBySelector(variantHtml, ".c-product-colours__heading > span");
      variantImage = await getValueBySelector(variantHtml, ".product-images__list-item .mz-figure img", "src");
      const variantProductImages = await extractProductImages(variantHtml, productPageElements.product_gallery_images);
      images.push(...variantProductImages);

      for (const size of variantSizes) {
        const variant = createVariantProps({ color, size, sku: variantSku, imageSrc: variantImage, price });
        variants.push(variant);
      }
    }

    await updateExtractedData(handle, title, description, sku, price, productPageElements.product_vendor, variants, options, images).catch(console.error);
  }
};

async function updateExtractedData(handle, title, description, sku, price, vendor, variants, options, images) {
  // Read the file
  const data = await readFile("./data-extract/extracted-data.json", "utf-8");

  // Parse the JSON
  const items = JSON.parse(data);

  // Find the item with the matching handle
  const item = items.find((item) => item.handle === handle);

  if (item) {
    // Update the item
    item.title = title;
    item.body_html = description;
    item.sku = sku;
    item.vendor = vendor;
    item.price = price;
    item.variants = variants;
    item.options = options;
    item.images = images;

    // Write the updated JSON back to the file
    await writeFile("./data-extract/extracted-data.json", JSON.stringify(items, null, 2));
    console.log(`Updated item with handle: ${handle}`);
  } else {
    console.error(`No item found with handle: ${handle}`);
  }
}
