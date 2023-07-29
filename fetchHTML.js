import fetch from "node-fetch";
import { writeFile, mkdir, rm } from "fs/promises";
import { URL } from "url";
import chalk from "chalk";

/**
 * Delay between fetches in milliseconds
 * @type {number}
 */
const delay = 200;

/**
 * Fetches HTML from a URL and saves it to a file
 * @param {string} url - The URL to fetch HTML from
 * @param {number} index - The index number for the filename
 */
async function fetchAndSave(url, index) {
  try {
    console.log(chalk.blue(`🌐 Fetching HTML from ${url}\n`));
    const response = await fetch(url);
    const body = await response.text();
    const hostname = new URL(url).hostname;
    const domain = hostname.replace("www.", "");
    const filename = `data/${domain}-${index}.html`;
    await writeFile(filename, body);
    console.log(chalk.green(`💾 HTML has been saved to ${filename}!\n`));
  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error}\n`));
  }
}

/**
 * Fetches HTML from an array of URLs with a delay between each fetch
 * @param {string[]} urls - The URLs to fetch HTML from
 */
async function fetchHTML(urls) {
  console.log(chalk.yellow("🗑️ Clearing old data\n"));
  // Delete the data directory and all its contents
  await rm("data", { recursive: true });

  console.log(chalk.yellow("📂 Creating data directory\n"));
  // Create the data directory
  await mkdir("data", { recursive: true });

  for (let i = 0; i < urls.length; i++) {
    await fetchAndSave(urls[i], i + 1);
    console.log(chalk.yellow(`⏱️  Waiting for ${delay}ms before next fetch\n`));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export default fetchHTML;
