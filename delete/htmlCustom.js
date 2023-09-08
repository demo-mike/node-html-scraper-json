import "dotenv/config";
import { writeFile } from "fs/promises";
import { chromium } from "playwright";
import { minify } from "html-minifier";
import { parse } from "node-html-parser";
import downloadImage from "./downloadImage.js";
import fetch from "node-fetch";
import { fetchAndParseVariant } from "./fetchVariants.js";

async function fetchAndReturnUrl(url) {
  try {
    console.log(`🌐 Fetching Variant HTML from ${url}`);
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const body = minify(await page.content(), {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      removeComments: true,
    });
    await browser.close();
    console.log(`✅ Successfully fetched HTML from ${url}`);
    return body;
  } catch (error) {
    console.error(`❌ Error fetching HTML from ${url}: ${error}`);
  }
}

async function createProduct(target, product) {
  try {
    const response = await fetch(`${target.shopify_store}/admin/api/2023-07/products.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": target.x_shopify_access_token,
      },
      body: JSON.stringify({ product }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("🎉 Product created successfully");
      return data.product.id;
    } else {
      console.error("❌ Error creating product:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

async function updateProductImages(target, productId, images) {
  for (const image of images) {
    try {
      const body = JSON.stringify({
        image: {
          src: image.image.src,
        },
      });
      console.log("🔄 Updating image with body:", body);

      const response = await fetch(`${target.shopify_store}/admin/api/2023-07/products/${productId}/images.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": target.x_shopify_access_token,
        },
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("🎉 Image updated successfully");
      } else {
        console.error("❌ Error updating image:", data);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  }
}

export async function parseHTML(html, target, baseUrl) {
  const root = parse(html);

  // Find all the ".c-product-colours a" elements
  const colorLinks = Array.from(root.querySelectorAll(".c-product-colours > a"), (a) => a.getAttribute("href"));
  console.log("🚀 ~ file: htmlCustom.js:90 ~ parseHTML ~ colorLinks:", colorLinks);

  // Fetch and parse each page
  for (const link of colorLinks) {
    const url = new URL(link, baseUrl).href; // Create an absolute URL
    const pageHtml = await fetchAndReturnUrl(url);
    const pageRoot = parse(pageHtml);

    const product_title = pageRoot.querySelector(target.product_title)?.innerText.trim().replace(/&reg;/g, "");
    const product_description = pageRoot.querySelector(target.product_description)?.innerText;
    const descriptionText = product_description || "";
    const match = descriptionText.match(/Product ID: (\d+)/);
    const product_sku = match ? match[1] : "";
    const vendor_name = pageRoot.querySelector(target.vendor)?.innerText.trim() || "";
    const breadcrumbNames = Array.from(pageRoot.querySelectorAll(target.breadcrumbNames), (a) => a.innerText.trim().replace(/&amp;/g, "&")).slice(1, 4);
    const product_type = breadcrumbNames[1] ?? breadcrumbNames[0];
    const product_category = breadcrumbNames[0] || "";
    const product_images = [];
    const variants = [];

    console.log("🍞 breadcrumbNames:", breadcrumbNames);
    console.log("📦 product_type:", product_type);
    console.log("📦 product_category:", product_category);

    const variantImageElement = pageRoot.querySelector(target.variantImageElement);

    const colorElement = pageRoot.querySelector(".c-swatch-list__item.image");
    const variant_color = colorElement ? colorElement.getAttribute("alt") : "";

    const imageElements = pageRoot.querySelectorAll(target.productImageListItems);

    const imageUrls = Array.from(imageElements, (img) => img.getAttribute("src"));

    for (const imageUrl of imageUrls) {
      let finalImageUrl;
      if (target.image_server) {
        finalImageUrl = await downloadImage(imageUrl, "images");
        finalImageUrl = target.tunnel_url + finalImageUrl;
      } else {
        finalImageUrl = imageUrl;
      }

      if (finalImageUrl) {
        finalImageUrl = finalImageUrl.replace(/\/t\//g, "/p/");

        if (product_images.some((image) => image.image.src === finalImageUrl)) {
          continue;
        }

        product_images.push({
          image: {
            src: finalImageUrl,
          },
        });
      }
    }

    const priceDivText = pageRoot.querySelector(target.varaint_compare_at_price)?.innerText || "";
    const varaint_compare_at_price = priceDivText.match(/\$[0-9\.]+/)?.[0] || "";

    const priceSpanText = pageRoot.querySelector(target.variant_price)?.innerText || "";
    const variant_price = priceSpanText.match(/\$[0-9\.]+/)?.[0] || "";

    const sizeElements = pageRoot.querySelectorAll(target.selectElement);
    const optionValues = Array.from(sizeElements, (div) => div.innerText.trim());
    console.log("🚀 optionValues:", optionValues);

    optionValues.forEach((size) => {
      console.log("📏 SIZE:", `${size}`);
      variants.push({
        option1: variant_color,
        option2: size,
        price: variant_price,
        sku: product_sku,
        compare_at_price: varaint_compare_at_price,
        inventory_quantity: Math.floor(Math.random() * 1001),
        inventory_management: "shopify",
        inventory_policy: "deny",
      });
    });

    console.log("🖼️ product_images:", product_images);

    const product = {
      title: product_title,
      body_html: product_description,
      vendor: "Dunnes Stores",
      product_type: product_type,
      tags: breadcrumbNames.join(", "),
      variants: variants,
      options: [
        {
          name: "Colour",
        },
        {
          name: "Size",
        },
      ],
      images: product_images,
    };

    try {
      await writeFile("temp-graphVariable.json", JSON.stringify({ product }, null, 2));
      console.log("📁 Graph variable saved to graphVariable.json");

      const productId = await createProduct(target, product);
      if (productId) {
        await updateProductImages(target, productId, product.images);
        console.log("🎉 Product images updated successfully");
      }
    } catch (error) {
      console.error(`❌ Error saving graph variable: ${error}`);
    }
  }
}
