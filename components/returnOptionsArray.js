/**
 * Creates an array of options from individual parameters
 *
 * @param {string} option1 - The first option
 * @param {string} option2 - The second option
 * @returns {Array<Object>} An array of option objects
 */
export function returnOptionsArray(option1, option2) {
  const options = [];

  if (option1) {
    options.push({ name: option1 });
  }

  if (option2) {
    options.push({ name: option2 });
  }

  return options;
}
