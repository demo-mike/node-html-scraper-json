/**
 * Handleizes a string by replacing spaces with dashes and removing special characters
 * @param {string} title - The string to handleize
 * @returns {string} - The handleized string
 */
export function handleize(title) {
  // Convert the title to lower case
  // Replace all non-alphanumeric characters with a dash
  // Remove leading and trailing dashes
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
