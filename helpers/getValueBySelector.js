import { parse } from "node-html-parser";
import chalk from "chalk";

/**
 * Gets the value of the first element that matches a selector in HTML content
 * @param {string} html - The HTML content to parse
 * @param {string} selector - The selector to match
 * @param {string} type - The type of value to return (defaults to "text")
 * @param {string} filter - The filter to apply on the value
 * @returns {Promise<string>} - The value of the first element that matches the selector
 */
export async function getValueBySelector(html, selector, type = "text", filter) {
  try {
    console.log(chalk.yellow(`🔍 Fetching ${type} value for selector: ${selector}\n`));

    // Parse the HTML content
    const root = parse(html);

    // Select the first element that matches the selector
    const element = root.querySelector(selector);

    // Return the appropriate value based on the type
    if (element) {
      let value;
      switch (type) {
        case "value":
          value = element.value;
          break;
        case "src":
          value = element.getAttribute("src");
          break;
        case "srcList":
          const imgListElements = element.querySelectorAll("img");
          value = Array.from(imgListElements, (el) => el.getAttribute("src"));
          break;
        case "alt":
          value = element.getAttribute("alt");
          break;
        case "altList":
          const imgElements = element.querySelectorAll("img");
          value = Array.from(imgElements, (el) => el.getAttribute("alt"));
          break;
        case "href":
          value = element.getAttribute("href");
          break;
        case "data":
          value = element.getAttribute("data");
          break;
        case "sku":
          value = element.text.trim();
          if (value.startsWith(filter)) {
            value = value.replace(filter, "");
          }
          break;
        case "breadcrumbs":
          const liElements = element.querySelectorAll("li");
          value = Array.from(liElements, (el) => {
            const span = el.querySelector("span");
            return (span ? span.textContent : el.textContent).trim();
          }).slice(1);
          break;
        case "allText":
          const textElements = element.querySelectorAll("div, p, li, span");
          value = textElements.map((el) => el.text.trim()).join("\n");
          break;
        case "select":
          const optionElements = element.querySelectorAll("option");
          value = Array.from(optionElements, (el) => {
            const text = el.textContent.trim();
            if (filter) {
              return text.split(filter)[0];
            }
            return text;
          });
          break;
        case "selectSlice":
          const optionSliceElements = element.querySelectorAll("option");
          value = Array.from(optionSliceElements, (el) => {
            const text = el.textContent.trim();
            if (filter) {
              return text.split(filter)[0];
            }
            return text;
          });

          value.shift();
          break;
        case "text":
        default:
          value = element.text.trim();
      }

      console.log(chalk.green(`✅ Found ${type} value: ${value}\n`));
      return value;
    } else {
      console.log(chalk.red(`❌ No element found for selector: ${selector}\n`));
      return "";
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error fetching ${type} value for selector: ${selector}\n`));
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}
