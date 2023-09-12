/**
 * Creates a variant object with the given properties.
 *
 * @param {Object} props - The properties of the variant.
 * @param {string} props.color - The color of the variant.
 * @param {string} props.size - The size of the variant.
 * @param {string} props.sku - The SKU of the variant.
 * @param {string} props.imageSrc - The image source URL of the variant.
 * @returns {Object} The created variant object.
 */
export function createVariantProps({ color, size, sku, price = "45" }) {
  const quantity = Math.floor(Math.random() * 1001);
  return {
    option1: color,
    option2: size,
    price: price,
    sku: sku,
    compare_at_price: "",
    inventory_quantity: quantity,
    inventory_management: "shopify",
    inventory_policy: "deny",
  };
}
