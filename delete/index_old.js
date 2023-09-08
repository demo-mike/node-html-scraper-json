import cleanAndFetchFiles from "./cleanAndFetchFiles.js";
import { readdir, readFile } from "fs/promises";
import chalk from "chalk";
import countdown from "../helpers/countdown.js";
// import { parseHTML } from "./htmlTransform.js";
import { parseHTML } from "./htmlCustom.js";
import { parse } from "node-html-parser";

const baseUrl = "https://www.dunnesstores.com";
const scrapeCollections = false;
const scrapeProducts = false;

const collectionUrls = ["https://www.dunnesstores.com/c/women/clothing/dresses"];
// The target elemenent for product page linkes from collection pages
const productAnchorTarget = `.c-product-card__title-link`;

// The target elements on product pages
const targetElements = {
  tunnel_url: "",
  shopify_store: process.env.SHOPIFY_STORE,
  x_shopify_access_token: process.env.X_SHOPIFY_ACCESS_TOKEN,
  image_server: false,
  product_title: "h1.c-product-overview__heading",
  product_description: ".c-product-description > p",
  vendor: "",
  breadcrumbNames: ".breadcrumbs__desc",
  variant_list_container: "",
  variantImageElement: "",
  productImageListItems: ".slick-slide > a > img",
  varaint_compare_at_price: ".was-now-price",
  variant_price: ".price__offer > span",
  selectElement: "#field_sku",
};

// JS PATH TEMP: document.querySelector("#productGallery > div > div > div.swiper.swiper-initialized.swiper-horizontal.swiper-pointer-events.swiper-backface-hidden.gallery-main-image-container > div.swiper-wrapper > div.swiper-slide.gallery-main-image.swiper-slide-active > div > img")

/**
 * Parses HTML files in the "data-collections" directory and extracts product URLs
 * @returns {Promise<string[]>} - A promise that resolves to an array of product URLs
 */
async function parseCollectionFiles() {
  const files = await readdir("data-collections");
  const productUrls = new Set(); // Use a Set to automatically remove duplicates
  for (const file of files) {
    const html = await readFile(`data-collections/${file}`, "utf-8");
    console.log(chalk.yellow(`🕵️‍♂️ Parsing file: ${file}\n`));
    try {
      const root = parse(html);
      // Extract product URLs and add them to the Set
      const elements = root.querySelectorAll(productAnchorTarget);
      const urls = elements.map((element) => {
        const href = element.getAttribute("href");
        console.log("🚀 Href found:", href);
        return `${href}`;
      });

      urls.forEach((url, index) => {
        console.log("🚀 Adding URL to set:", url);
        productUrls.add(baseUrl + url);
      });
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error}\n`));
      break;
    }
  }
  return Array.from(productUrls); // Convert the Set to an array before returning
}

/**
 * Parses HTML files in the "data-products" directory and extracts product data
 */
async function parseProductFiles() {
  const files = await readdir("data-products");
  for (const file of files) {
    const html = await readFile(`data-products/${file}`, "utf-8");
    console.log(chalk.yellow(`\n\n🕵️‍♂️  Parsing file: ${file}\n`));
    try {
      await parseHTML(html, targetElements, baseUrl);
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error}\n`));
      break;
    }
  }
}

/**
 * Scrapes collection and product data from the web
 */
async function scrapeAndTransformData() {
  // Fetch HTML for each collection URL and save it to the "data-collections" directory
  if (scrapeCollections) {
    await cleanAndFetchFiles(collectionUrls, "data-collections");
  }
  console.log(chalk.yellow(`✅ HTML Extraction Complete! Now running parsing operations`));
  countdown(2, async () => {
    // Parse the collection files to extract product URLs
    const productUrls = await parseCollectionFiles();
    // Fetch HTML for each product URL and save it to the "data-products" directory
    if (scrapeProducts) {
      await cleanAndFetchFiles(productUrls, "data-products");
    }
    // Parse the product files to extract product data
    await parseProductFiles();
  });
}

scrapeAndTransformData();
