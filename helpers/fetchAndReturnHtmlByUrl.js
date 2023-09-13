import { chromium } from "playwright";
import chalk from "chalk";

/**
 * Fetches HTML from a URL using Playwright
 * @see {@link https://playwright.dev/docs/intro}
 * @param {string} url - The URL to fetch HTML from
 * @param {number} waitTime - The time to wait after page load before fetching HTML
 * @param {number} retries - The number of retries if fetching fails
 * @returns {Promise<string>} - The HTML content of the page
 */
export async function fetchAndReturnHtmlByUrl(url, waitTime = 5000, retries = 1) {
  // Launch a new browser instance
  const browser = await chromium.launch();
  try {
    console.log(chalk.cyan(`🌐 Fetching HTML from ${url}\n`));

    // Create a new browser context with specific settings
    const context = await browser.newContext({
      acceptDownloads: false,
      ignoreHTTPSErrors: true,
      viewport: null,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537",
      javaScriptEnabled: true,
      storageState: {
        cookies: [],
        origins: [
          {
            origin: url,
            localStorage: [],
            sessionStorage: [],
          },
        ],
      },
    });

    // Create a new page in the browser context
    const page = await context.newPage();

    // Navigate to the URL and wait for 5 seconds
    await page.goto(url);
    await page.waitForTimeout(waitTime);

    // Get the HTML content of the page
    const body = await page.content();

    console.log(chalk.green(`✅ Successfully fetched HTML from ${url}\n`));

    // Return the HTML content
    return body;
  } catch (error) {
    if (retries === 0) {
      console.log(chalk.red(`🚫 Failed to fetch HTML from ${url}: ${error}\n`));
      return null;
    } else {
      console.log(chalk.yellow(`⏳ Retrying... (${retries} retry left)\n`));
      // Wait seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await fetchAndReturnHtmlByUrl(url, waitTime, retries - 1);
    }
  } finally {
    // Close the browser
    await browser.close();
  }
}
