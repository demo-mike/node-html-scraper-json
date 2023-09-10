import "dotenv/config";

const shopify_store = process.env.SHOPIFY_STORE;
const x_shopify_access_token = process.env.X_SHOPIFY_ACCESS_TOKEN;
const storeLocationID = process.env.STORE_LOCATION_ID;

/**
 * Creates a product in the Shopify store.
 * @param {Object} product - The product to create.
 * @returns {Promise<string>} The ID of the created product.
 */
export async function createProduct(productData) {
  try {
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
      console.log("👷 Product created successfully");
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
 */
async function updateProductImages(productId, images, variants) {
  if (images.length === 0) {
    console.log("No images to update.");
    return;
  }

  // Find the correct variant image src to associate with the image
  // sort the image array by image.color and by ending filename eg. "teal.jpg", "teal-1.jpg"
  // Look at the variants.option1 for the color value eg. "teal"
  // Look at the images.color for the image color value eg. "teal"
  // If they match, associate the image with the variant
  // If the image.alt contains swatch then look for the next image match with the same color

  const variantImage = images[0];
  const variantIds = variants.map((variant) => variant.id);
  console.log("🚀 ~ VARIANTS:", variants);

  for (const image of images) {
    try {
      const body = JSON.stringify({
        image: {
          src: image.image.src,
          // Only associate the first image with the variants
          variant_ids: image === variantImage ? variantIds : [],
        },
      });
      console.log("🔄 Updating image:", {
        productId: productId,
        image: image.image.src,
        variantImage: image === variantImage,
      });

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
        console.log("🖼️ Image updated successfully\n");
      } else {
        console.error("❌ Error updating image:", data);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
}
