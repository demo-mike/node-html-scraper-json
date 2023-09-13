/**
 * Creates a variant object with the given properties.
 *
 * @param {Object} props - The properties of the variant.
 * @param {string} props.color - The color of the variant.
 * @param {string} props.size - The size of the variant.
 * @param {string} props.sku - The SKU of the variant.
 * @param {string} props.price - The price of the variant. Defaults to "45".
 * @returns {Object} The created variant object.
 */
export function createVariantProps({ color, size, sku, price = "45" }) {
  // Generate a random quantity between 0 and 1000
  const quantity = Math.floor(Math.random() * 1001);

  // Return the variant object
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
