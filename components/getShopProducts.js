import "dotenv/config";
import fetch from "node-fetch";
import { readdir, readFile, writeFile } from "fs/promises";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;

// GraphQL query to fetch products
const productsQuery = (cursor) => {
  const afterCursor = cursor ? `after: "${cursor}"` : "";
  return `
    {
      products(first: 50, ${afterCursor}) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            tags
          }
        }
      }
    }
  `;
};

/**
 * Fetches products with pagination.
 *
 * @param {string} cursor - The cursor for pagination.
 * @returns {Promise<Object>} The response from the Shopify API.
 */
async function fetchProducts(cursor = null) {
  try {
    const response = await fetch(`${shopify_store}/admin/api/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": x_shopify_access_token,
      },
      body: JSON.stringify({ query: productsQuery(cursor) }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Fetches products and extracts tags.
 *
 * @param {Array<string>} keywords - The keywords to match.
 */
export async function getShopProducts(keywords) {
  console.log("Starting to fetch products and extract tags...");

  let hasNextPage = true;
  let cursor = null;
  const extractedTags = new Set();

  while (hasNextPage) {
    try {
      const response = await fetchProducts(cursor);

      if (!response.data || !response.data.products) {
        console.error("Unexpected response:", response);
        break;
      }

      const data = response.data;

      data.products.edges.forEach(({ node }) => {
        node.tags.forEach((tag) => {
          extractedTags.add(tag);
        });
      });

      hasNextPage = data.products.pageInfo.hasNextPage;
      cursor = data.products.edges[data.products.edges.length - 1].cursor;

      console.log(`Fetched ${data.products.edges.length} products. Has next page: ${hasNextPage}`);

      // Wait for 1 second before making the next paginated request
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error in main loop:", error);
      break;
    }
  }

  console.log("Finished fetching products and extracting tags.");
  console.log("Extracted tags:", Array.from(extractedTags));

  // Save extracted tags to a JSON file
  await writeFile("./data-shop/product-tags.json", JSON.stringify(Array.from(extractedTags), null, 2));
  console.log("Saved extracted tags to productTags.json");
}
