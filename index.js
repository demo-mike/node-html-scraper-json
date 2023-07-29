// index.js
import fetchHTML from "./fetchHTML.js";
import { readdir, readFile } from "fs/promises";
import chalk from "chalk";
import countdown from "./countdown.js";
import { parseHTML } from "./htmlTransform.js";

const urls = [
  "https://www.fender.com/en-US/electric-guitars/?start=0&sz=500",
  "https://www.fender.com/en-US/acoustic-guitars/?start=0&sz=500",
  "https://www.fender.com/en-US/electric-basses/?start=0&sz=500",
];

async function parseHTMLFiles() {
  const files = await readdir("data");
  for (const file of files) {
    const html = await readFile(`data/${file}`, "utf-8");
    console.log(chalk.yellow(`🕵️‍♂️ Parsing file: ${file}\n`));
    try {
      // You can parse the HTML here
      await parseHTML(html);
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error}\n`));
      break;
    }
  }
}

async function scrapeAndTransformData() {
  await fetchHTML(urls);
  countdown(5, parseHTMLFiles);
}

scrapeAndTransformData();
