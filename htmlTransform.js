import { parse } from "node-html-parser";

export async function parseHTML(html) {
  const root = parse(html);

  // Target HTML elements
  // Target the Category name of the collection page for example: Stollers, Cribs, Chairs
  const category = `.f4-Jp`;
  // The parent container of a single product card on the collections page
  const productCard = `[unbxdattr="product"]`;
  // Product Attributes
  const title = `.x1Y39`;
  const description = "";
  const regularPrice = `.price__price`;
  const salePrice = ".KFXFUhqz";
  const strikethroughPrice = ".nQSW8PKD";
  const skuContainer = `.Q6uWS label`;
  const skuTargetAttribute = `for`;
  const image = ".UCV5Q-63";
  const vendor = "Express";
  const tagElements = {
    badge: ".bob",
  };
  // Variant Attributes
  const variantContainer = `.Q6uWS`;
  // Static Name for variant Option 1 name
  const variantOptionName = "Color";
  const variantOptionValue = `label.srOnly`;

  // Check the existence of the targeted HTML elements
  const selectors = [
    category,
    productCard,
    title,
    description,
    regularPrice,
    salePrice,
    strikethroughPrice,
    skuContainer,
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
    // *** Category ***
    const product_category = root.querySelector(category)?.innerText.trim().toLowerCase() ?? "";

    // *** Title ***
    const product_title = product.querySelector(title)?.innerText.trim().replace(/&reg;/g, "");
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
    const product_sku = product.querySelector(skuContainer)?.getAttribute(skuTargetAttribute);

    // *** Product Image ***
    const imageUrl = product.querySelector(image)?.getAttribute("src")?.split("?")[0];

    // *** Tags ***
    const tagSet = new Set();
    tagSet.add(
      `type:${product_category
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .toLowerCase()}`
    );
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
    const variants = product.querySelectorAll(variantContainer).map((variant) => {
      // *** Handle ***
      const handle = product_title
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9-]+/g, "") // Remove all special characters except hyphens
        .replace(/_+/g, "-"); // Convert underscores to hyphens

      console.log({
        handle: handle,
        title: product_title,
        description: description,
        vendor: vendor,
        category: product_category,
        tags: Array.from(tagSet).join(", "),
        optionName: variantOptionName,
        optionValue: variant.querySelector(variantOptionValue)?.textContent,
        product_sku: product_sku,
      });
    });
  });
}
