import { parse } from "node-html-parser";
import chalk from "chalk";

/**
 * Extracts all URLs from the href attributes of <a> elements within a selected element
 * @param {string} html - The HTML content to parse
 * @param {string} selector - The selector to match
 * @returns {Array<string>} - An array of URLs
 */
export function extractVariantLinks(html, selector) {
  const root = parse(html);
  const element = root.querySelector(selector);
  const linkElements = element.querySelectorAll("a");
  const urls = Array.from(linkElements, (el) => el.getAttribute("href"));
  return urls;
}
