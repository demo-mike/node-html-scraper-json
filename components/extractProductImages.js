import { parse } from "node-html-parser";

/**
 * Extracts all the image src and alt attributes from the HTML.
 *
 * @param {string} html - The HTML string.
 * @returns {Array<Object>} An array of objects, each containing an image src and alt.
 */
export async function extractProductImages(html, target, skipFirst = false, filter = "", color) {
  // Parse the HTML
  const root = parse(html);

  // Find all the img elements
  const imgElements = root.querySelectorAll(target);

  // Use a Set to store unique image src values
  const uniqueImages = new Set();

  // Map each img element to an object with src and alt properties
  const images = imgElements.reduce((acc, img, index) => {
    const src = img.getAttribute("src");
    if (!uniqueImages.has(src) && !(skipFirst && index === 0) && !src.includes(filter)) {
      uniqueImages.add(src);
      acc.push({
        image: {
          src: src,
          alt: img.getAttribute("alt"),
          color: color,
        },
      });
    }
    return acc;
  }, []);

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
