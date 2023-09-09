/**
 * Handleizes a string by replacing spaces with dashes and removing special characters
 * @param {string} title - The string to handleize
 * @returns {string} - The handleized string
 */
export function handleize(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
