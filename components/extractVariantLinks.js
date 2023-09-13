import { parse } from "node-html-parser";
import chalk from "chalk";

/**
 * Extracts all URLs from the href attributes of <a> elements within a selected element
 *
 * @param {string} html - The HTML content to parse
 * @param {string} selector - The selector to match
 * @returns {Array<string>} An array of URLs
 */
export function extractVariantLinks(html, selector) {
  // Parse the HTML
  const root = parse(html);

  // Find the target element
  const element = root.querySelector(selector);

  // Find all the <a> elements within the target element
  const linkElements = element.querySelectorAll("a");

  // Map each <a> element to its href attribute
  const urls = Array.from(linkElements, (el) => el.getAttribute("href"));

  return urls;
}
