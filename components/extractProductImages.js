import { parse } from "node-html-parser";

/**
 * Extracts all the image src and alt attributes from the HTML.
 *
 * @param {string} html - The HTML string.
 * @returns {Array<Object>} An array of objects, each containing an image src and alt.
 */
export async function extractProductImages(html, target) {
  // Parse the HTML
  const root = parse(html);

  // Find all the img elements
  const imgElements = root.querySelectorAll(target);

  // Map each img element to an object with src and alt properties
  const images = imgElements.map((img) => ({
    image: {
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt"),
    },
  }));

  return images;
}

/**
 * Extracts all the image src and alt attributes from the color swatch HTML.
 *
 * @param {string} html - The HTML string.
 * @returns {Array<Object>} An array of objects, each containing an image src and alt.
 */
export function extractColorSwatchImagesAndAlt(html, target) {
  // Parse the HTML
  const root = parse(html);

  // Find all the img elements
  const imgElements = root.querySelectorAll(target);

  // Map each img element to an object with src and alt properties
  const images = imgElements.map((img) => ({
    image: {
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") + " swatch",
    },
  }));

  return images;
}
