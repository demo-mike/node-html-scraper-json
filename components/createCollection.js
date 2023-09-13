import "dotenv/config";
import fetch from "node-fetch";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;

// GraphQL mutation to create a collection
const createCollectionMutation = `
  mutation createCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Creates a collection in the Shopify store.
 * @param {string} tag - The tag to create a collection for.
 * @returns {Promise<Object>} The response from the Shopify API.
 */
export async function createCollection(tag) {
  try {
    console.log(`👷 Creating collection: ${tag}\n`);

    const variables = {
      input: {
        descriptionHtml: "",
        handle: tag.toLowerCase().replace(/ /g, "_"),
        products: [],
        redirectNewHandle: true,
        ruleSet: {
          appliedDisjunctively: true,
          rules: [
            {
              column: "TAG",
              relation: "EQUALS",
              condition: tag,
            },
          ],
        },
        seo: {
          description: tag,
          title: tag,
        },
        title: tag,
      },
    };

    // Send a POST request to the Shopify API to create a new collection
    const response = await fetch(`${shopify_store}/admin/api/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": x_shopify_access_token,
      },
      body: JSON.stringify({ query: createCollectionMutation, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    console.log(`👷 Collection created successfully: ${tag}\n`);

    return response.json();
  } catch (error) {
    console.error(`❌ Error creating collection for tag "${tag}":`, error);
    throw error;
  }
}
