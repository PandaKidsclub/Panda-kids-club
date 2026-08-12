export const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  descriptionHtml
  availableForSale
  featuredImage { url altText width height }
  images(first: 8) { nodes { url altText width height } }
  options { name values }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  variants(first: 50) {
    nodes {
      id
      title
      availableForSale
      selectedOptions { name value }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      image { url altText width height }
    }
  }
`;

export const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
    totalTaxAmount { amount currencyCode }
  }
  lines(first: 50) {
    nodes {
      id
      quantity
      cost { totalAmount { amount currencyCode } }
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          image { url altText width height }
          product { handle title }
        }
      }
    }
  }
`;

export const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes { ${PRODUCT_FIELDS} }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query Collections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        handle
        title
        description
        image { url altText width height }
        products(first: 8) { nodes { ${PRODUCT_FIELDS} } }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText width height }
      products(first: 12) { nodes { ${PRODUCT_FIELDS} } }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${PRODUCT_FIELDS} }
  }
`;

export const CART_QUERY = `
  query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }
`;

export const CART_CREATE = `
  mutation CartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ${CART_FIELDS} }
      userErrors { field message code }
      warnings { code message target }
    }
  }
`;

export const CART_LINES_ADD = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message code }
      warnings { code message target }
    }
  }
`;

export const CART_LINES_UPDATE = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ${CART_FIELDS} }
      userErrors { field message code }
      warnings { code message target }
    }
  }
`;

export const CART_LINES_REMOVE = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ${CART_FIELDS} }
      userErrors { field message code }
      warnings { code message target }
    }
  }
`;

export const SHOPIFY_HEALTH_QUERY = `
  query ShopifyHealth { shop { name primaryDomain { url } paymentSettings { currencyCode } } products(first: 1) { nodes { id } } }
`;
