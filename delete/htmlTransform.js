import { parse } from "node-html-parser";

export async function parseHTML(html, target) {
  const root = parse(html);

  // Initialize a Set to store the unique titles
  const titleSet = new Set();

  const products = root.querySelectorAll(target.productCard).map((product) => {
    // *** Category ***
    const product_category = root.querySelector(target.category)?.innerText.trim().toLowerCase() ?? "";
    // console.log("CATEGORY:", product_category);

    // *** Title ***
    const product_title = product.querySelector(target.title)?.innerText.trim().replace(/&reg;/g, "");
    // If the product_title already exists, skip this product else add it to the titleSet Set list
    if (titleSet.has(product_title)) return;
    titleSet.add(product_title);
    // console.log("TITLE:", product_title);

    // *** Description ***
    const product_description = product.querySelector(target.description)?.innerText;
    // console.log("DESCRIPTION:", product_description);

    // *** Price ***
    const salePriceElement = product.querySelector(target.salePrice);
    const priceElement = product.querySelector(target.regularPrice);
    const strikethroughPriceElement = product.querySelector(target.strikethroughPrice);
    const price = salePriceElement ? strikethroughPriceElement?.innerText.trim() : priceElement?.innerText.trim();
    const compareAtPrice = salePriceElement ? salePriceElement.innerText.trim() : "";

    // *** Handle ***
    const handle = product_title
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]+/g, "") // Remove all special characters except hyphens
      .replace(/_+/g, "-"); // Convert underscores to hyphens
    // console.log("HANDLE:", handle);

    // *** SKU ***
    function extractSKU(selector, before, after) {
      let element = product.querySelector(selector);
      if (!element) return "";
      // Get the value based on the type of the selector
      let sku = selector.startsWith(".") ? element.textContent : element.getAttribute(selector.replace(/[\[\]]/g, ""));
      // If there is a before string, split and return the second part
      if (before && sku.includes(before)) {
        sku = sku.split(before)[1];
      }
      // If there is an after string, split and return the first part
      if (after && sku.includes(after)) {
        sku = sku.split(after)[0];
      }
      return sku;
    }

    const productSku = extractSKU(target.skuTargetAttribute, target.skuBeforeString, target.skuAfterString);
    // console.log("SKU:", productSku);

    // *** Product Image ***
    const imageUrl = product.querySelector(target.image)?.getAttribute("src")?.split("?")[0];
    // console.log("IMAGE:", imageUrl);

    // *** Tags ***
    const tagSet = new Set();
    tagSet.add(
      `type:${product_category
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .toLowerCase()}`
    );
    Object.entries(target.tagElements).forEach(([key, selector]) => {
      product.querySelectorAll(selector).forEach((element) => {
        const tagValue = element.innerText
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .toLowerCase();
        tagSet.add(`${key}:${tagValue}`);
      });
    });
    // console.log("TAGS:", Array.from(tagSet).join(", "));

    // *** Variants ***
    const variantOption1 = product.querySelectorAll(target.variantOption1Container).map((variant) => {
      // *** Variants ***
      const productOptions = [];

      // Extract color options
      // const colorElements = product.querySelectorAll(target.variantOption1Container);
      // console.log("colorElements:", colorElements); // Add console log here
      // if (colorElements.length) {
      //   colorElements.forEach((element) => {
      //     const colorElement = element.querySelector(target.variantOption1Value);
      //     console.log("colorElement:", colorElement); // Add console log here
      //     const color = {
      //       [target.variantOption1Name]: colorElement ? colorElement.textContent.trim() : "",
      //       Size: "",
      //     };
      //     productOptions.push(color);
      //   });
      // }

      // Extract size options
      // console.log("target.variantOption2Container:", target.variantOption2Container); // Add console log here
      // const sizeElements = product.querySelectorAll(target.variantOption2Container);
      // console.log("sizeElements:", sizeElements); // Add console log here
      // if (sizeElements.length) {
      //   sizeElements.forEach((element) => {
      //     const sizeElement = element.querySelector(target.variantOption2Value);
      //     console.log("sizeElement:", sizeElement); // Add console log here
      //     const size = {
      //       Color: "",
      //       [target.variantOption2Name]: sizeElement ? sizeElement.textContent.trim() : "",
      //     };
      //     productOptions.push(size);
      //   });
      // }

      console.log({
        handle: handle,
        title: product_title,
        description: product_description,
        vendor: target.vendor,
        category: product_category,
        tags: Array.from(tagSet).join(", "),
        productSku,
        salePriceElement,
        priceElement,
        strikethroughPriceElement,
        price,
      });
    });
  });
}
