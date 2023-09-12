import "dotenv/config";
import fetch from "node-fetch";
import fs from "fs/promises";

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

// Function to fetch products with pagination
async function fetchProducts(cursor = null) {
  try {
    const response = await fetch(`https://${shopify_store}.myshopify.com/admin/api//graphql.json`, {
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

// Function to delay the execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Main function to fetch products and extract tags
export async function getShopProducts() {
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
      await delay(1000);
    } catch (error) {
      console.error("Error in main loop:", error);
      break;
    }
  }

  console.log("Finished fetching products and extracting tags.");
  console.log("Extracted tags:", Array.from(extractedTags));

  // Save extracted tags to a JSON file
  await fs.writeFile("./data-products/product-tags.json", JSON.stringify(Array.from(extractedTags), null, 2));
  console.log("Saved extracted tags to productTags.json");
}
