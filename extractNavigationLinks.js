import { parse } from "node-html-parser";
import { writeFile } from "fs/promises";
import fetchAndReturnHtmlByUrl from "./helpers/fetchAndReturnHtmlByUrl.js";

const url = `https://www.dunnesstores.com/`;
const navUlSelector = `.c-nav a`;

async function extractHrefsAndSaveToFile() {
  const html = await fetchAndReturnHtmlByUrl(url);
  const root = parse(html);

  let links = root.querySelectorAll(navUlSelector);
  let result = [];

  links.forEach((link) => {
    result.push({
      name: link.text,
      value: link.getAttribute("href"),
    });
  });

  await writeFile("./data-navigation/navigation-links.json", JSON.stringify(result, null, 2));
  console.log("Navigation links saved to ./data-navigation/navigation-links.json");
}

// Call the function
extractHrefsAndSaveToFile().catch(console.error);
