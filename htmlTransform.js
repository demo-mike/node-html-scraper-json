import { parse } from "node-html-parser";

export async function parseHTML(html) {
  const root = parse(html);

  // Target HTML elements
  const type = "h1.category-page-title";
  const productCard = ""; // Please fill this
  const title = ".pdp-link a";
  const description = ""; // Please fill this
  const regularPrice = ".sales .value";
  const salePrice = ".sales.promotion-price .value";
  const strikethroughPrice = ".strike-through.list .value";
  const sku = "[data-product-id]";
  const image = ".tile-image";
  const tagElements = {
    type: ".refinement-series",
    badge: ".values.content",
  };
  const variantContainer = ".color-swatches__lists a";

  // Check the existence of the targeted HTML elements
  const selectors = [
    type,
    productCard,
    title,
    description,
    regularPrice,
    salePrice,
    strikethroughPrice,
    sku,
    image,
    ...Object.values(tagElements),
    variantContainer,
  ];
  selectors.forEach((selector) => {
    if (selector && root.querySelector(selector) === null) {
      throw new Error(`No elements match the selector "${selector}"`);
    }
  });

  // Initialize a Set to store the unique titles
  const titleSet = new Set();

  const products = root.querySelectorAll(productCard).map((product) => {
    // *** Title ***
    const product_title = product.querySelector(title)?.innerText.trim();
    // If the product_title already exists, skip this product else add it to the titleSet Set list
    if (titleSet.has(product_title)) return;
    titleSet.add(product_title);

    // *** Description ***
    // Fill this part

    // *** Price ***
    const salePriceElement = product.querySelector(salePrice);
    const priceElement = product.querySelector(regularPrice);
    const strikethroughPriceElement = product.querySelector(strikethroughPrice);
    const price = salePriceElement ? strikethroughPriceElement?.innerText.trim() : priceElement?.innerText.trim();
    const compareAtPrice = salePriceElement ? salePriceElement.innerText.trim() : "";

    // *** SKU ***
    const product_sku = product.querySelector(sku)?.getAttribute("data-product-id");

    // *** Product Image ***
    const imageUrl = product.querySelector(image)?.getAttribute("src")?.split("?")[0];

    // *** Tags ***
    const tagSet = new Set();
    Object.entries(tagElements).forEach(([key, selector]) => {
      product.querySelectorAll(selector).forEach((element) => {
        const tagValue = element.innerText
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
          .toLowerCase();
        tagSet.add(`${key}:${tagValue}`);
      });
    });

    // *** Variants ***
    const variants = product.querySelectorAll(variantContainer).map((variant) => ({
      title: variant.getAttribute("data-product-color"),
      imageUrl: variant.getAttribute("data-product-image"),
    }));

    console.log("Tags:", Array.from(tagSet).join(", "));
  });
}
