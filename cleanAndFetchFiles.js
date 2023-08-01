import { writeFile, mkdir, rm } from "fs/promises";
import { URL } from "url";
import chalk from "chalk";
import { chromium } from "playwright";
import { minify } from "html-minifier";

const delay = 200;
let index = 1;

/**
 * Fetches HTML from a URL using Playwright and saves it to a file in a specific directory
 * @param {string} url - The URL to fetch HTML from
 * @param {string} directory - The directory to save the HTML file to
 */
async function fetchAndSaveUrl(url, directory) {
  try {
    console.log(chalk.blue(`🌐 Fetching HTML from ${url}\n`));
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const body = await page.content();
    await browser.close();
    body = minify(body, {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    const hostname = new URL(url).hostname;
    const domain = hostname.replace("www.", "");
    const filename = `${directory}/${directory}-${index}.html`;
    await writeFile(filename, body);
    console.log(chalk.green(`💾 HTML has been saved to ${filename}!\n`));
    index++;
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}

/**
 * Clears old data, creates a new directory, and fetches HTML from an array of URLs using Playwright with a delay between each fetch
 * @param {string[]} urls - The URLs to fetch HTML from
 * @param {string} directory - The directory to save the HTML files to
 */
async function cleanAndFetchFiles(urls, directory) {
  console.log(chalk.yellow("🗑️  Clearing old data\n"));
  await rm(directory, { recursive: true, force: true });

  console.log(chalk.yellow("📂 Creating data directory\n"));
  await mkdir(directory, { recursive: true });

  for (let i = 0; i < urls.length; i++) {
    await fetchAndSaveUrl(urls[i], directory);
    console.log(chalk.yellow(`⏱️  Waiting for ${delay}ms before next fetch\n`));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  index = 1;
}

export default cleanAndFetchFiles;
