import { readdir, readFile, writeFile } from "fs/promises";
import chalk from "chalk";
import { getValueBySelector } from "../helpers/getValueBySelector.js";
import { handleize } from "../helpers/handleize.js";
import { fetchAndReturnHtmlByUrl } from "../helpers/fetchAndReturnHtmlByUrl.js";
import { returnOptionsArray } from "./returnOptionsArray.js";
import { createVariantProps } from "./createVariantProps.js";
import { extractProductImages, extractColorSwatchImagesAndAlt } from "./extractProductImages.js";
import { extractVariantLinks } from "./extractVariantLinks.js";

/**
 * Extracts product data from HTML files in a specific directory and saves it to a JSON file
 * @param {Object} productData - The product data to extract
 * @param {Object} productPageElements - The target elements on product pages
 * @param {Object} variantOptions - The variant options
 * @param {Object} variantPageElements - The target elements on variant pages
 * @param {string} baseUrl - The base URL for the online store
 * @param {number} pageLoadWaitTimeMS - The time to wait for the page to load before saving the HTML file
 */
export async function extractProductData(productData, productPageElements, variantOptions, variantPageElements, metaFieldMap, baseUrl, pageLoadWaitTimeMS) {
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
    const sku = await getValueBySelector(html, productPageElements.product_sku, "sku", productPageElements.product_sku_filter);
    const price = await getValueBySelector(html, productPageElements.product_price);

    // Get color and image from the current HTML content
    let color = await getValueBySelector(html, variantPageElements.variant_color);
    let variantImage = await getValueBySelector(html, variantPageElements.variant_image, "src");

    const productImages = await extractProductImages(
      html,
      productPageElements.product_gallery_images,
      productPageElements.product_gallery_skip_first_img,
      productPageElements.product_gallery_skip_filter,
      color
    );
    images.push(...productImages);
    const colorSwatchImages = await extractColorSwatchImagesAndAlt(html, productPageElements.product_color_swatch_images, color);
    images.push(...colorSwatchImages);

    // Build variants array
    const variantLinks = extractVariantLinks(html, variantOptions.product_option1_selector);
    const variantSizes = await getValueBySelector(html, variantOptions.product_option2_selector, "selectSlice", " ");

    // Build metafields array
    const metafields = await buildMetaFields(metaFieldMap, html);

    // Current Product
    for (const size of variantSizes) {
      const variant = createVariantProps({ color, size, sku, imageSrc: variantImage, price });
      variants.push(variant);
    }

    for (const variantLink of variantLinks) {
      // Get props from the variant HTML content
      const variantHtml = await fetchAndReturnHtmlByUrl(`${baseUrl}${variantLink}`, pageLoadWaitTimeMS);

      // If variantHtml is null, skip to the next iteration
      if (variantHtml === null) {
        console.log(chalk.yellow(`⚠️ Skipping variant due to fetch failure: ${variantLink}`));
        continue;
      }

      const variantSku = await getValueBySelector(variantHtml, productPageElements.product_sku, "sku", productPageElements.product_sku_filter);
      color = await getValueBySelector(variantHtml, variantPageElements.variant_color);
      variantImage = await getValueBySelector(variantHtml, variantPageElements.variant_image, "src");
      const variantProductImages = await extractProductImages(
        variantHtml,
        productPageElements.product_gallery_images,
        productPageElements.product_gallery_skip_first_img,
        productPageElements.product_gallery_skip_filter,
        color
      );
      images.push(...variantProductImages);

      for (const size of variantSizes) {
        const variant = createVariantProps({ color, size, sku: variantSku, imageSrc: variantImage, price });
        variants.push(variant);
      }
    }

    await updateExtractedData(handle, title, description, sku, price, productPageElements.product_vendor, variants, options, images, metafields);
  }
}

async function updateExtractedData(handle, title, description, sku, price, vendor, variants, options, images, metafields) {
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
    item.metafields = metafields;

    // Write the updated JSON back to the file
    await writeFile("./data-extract/extracted-data.json", JSON.stringify(items, null, 2));
    console.log(`Updated item with handle: ${handle}`);
  } else {
    console.error(`No item found with handle: ${handle}`);
  }
}

async function buildMetaFields(metaFieldMap, html) {
  const metafields = [];

  for (const metaField of metaFieldMap) {
    const value = await getValueBySelector(html, metaField.selector, metaField.selector_type);
    metafields.push({
      namespace: metaField.key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      key: metaField.key,
      value: value,
      type: metaField.type,
    });
  }

  return metafields;
}
