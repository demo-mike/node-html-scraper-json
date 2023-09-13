import { parse } from "node-html-parser";

/**
 * Extracts both the URLs and the colors from the HTML content
 *
 * @param {string} html - The HTML content to parse
 * @param {string} selector - The selector to match
 * @returns {Array<Object>} An array of objects with link and color properties
 */
export async function extractVariantLinksAndColors(html, selector) {
  // Parse the HTML
  const root = parse(html);

  // Find all the target elements
  const linkElements = root.querySelectorAll(selector);

  // Map each element to an object with link and color properties
  const variants = Array.from(linkElements, (el) => {
    const link = el.getAttribute("href");
    const color = el.getAttribute("alt");
    return { link, color };
  });

  // Filter out any objects with undefined or null link or color
  return variants.filter((variant) => variant.link && variant.color);
}
