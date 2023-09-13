import "dotenv/config";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;
const storeLocationID = process.env.STORE_LOCATION_ID;

/**
 * Creates a product in the Shopify store.
 * @param {Object} productData - The product to create.
 * @returns {Promise<string>} The ID of the created product.
 */
export async function createProduct(productData) {
  try {
    console.log(`👷 Creating product: ${productData.title}\n`);

    // Send a POST request to the Shopify API to create a new product
    const response = await fetch(`${shopify_store}/admin/api/2023-07/products.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": x_shopify_access_token,
      },
      body: JSON.stringify({
        product: {
          title: productData.title,
          body_html: productData.body_html,
          handle: productData.handle,
          vendor: productData.vendor,
          product_type: productData.product_type,
          tags: productData.tags,
          variants: productData.variants,
          options: productData.options,
          metafields: productData.metafields,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("👷 Product created successfully\n");
      await updateProductImages(data.product.id, productData.images, data.product.variants);
      return data.product.id;
    } else {
      console.error(`❌ Error creating ${productData.handle}:`, data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Updates the images of a product in the Shopify store.
 * @param {string} productId - The ID of the product to update.
 * @param {Array} images - The new images for the product.
 * @param {Array} variants - The variants of the product.
 * @returns {Promise<void>}
 */
async function updateProductImages(productId, images, variants) {
  console.log(`🖼️  Updating product ${productId} images...\n`);
  if (images.length === 0) {
    console.log("No images to update.\n");
    return;
  }

  for (const image of images) {
    try {
      const matchingVariants = variants.filter((variant) => variant.option1 === image.image.color);
      const variantIds = matchingVariants.map((variant) => variant.id);

      const body = JSON.stringify({
        image: {
          src: image.image.src,
          alt: image.image.alt,
          variant_ids: variantIds,
        },
      });
      console.log("🔄 Updating image:", image.image.src);

      const response = await fetch(`${shopify_store}/admin/api/2023-07/products/${productId}/images.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": x_shopify_access_token,
        },
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("🖼️  Image updated successfully\n");
      } else {
        console.error("❌ Error updating image:", data);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
}
