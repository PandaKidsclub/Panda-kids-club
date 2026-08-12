import type { NextConfig } from "next";
import { getConfiguredMediaOrigin } from "./src/lib/media/media-config";
import { getConfiguredShopifyStoreDomain } from "./src/lib/shopify/config";

const configuredMediaOrigin = getConfiguredMediaOrigin();
const configuredShopifyDomain = getConfiguredShopifyStoreDomain();
const trustedMediaSource = configuredMediaOrigin.origin ? ` ${configuredMediaOrigin.origin}` : "";
const trustedShopifyImageSources = configuredShopifyDomain ? ` https://${configuredShopifyDomain} https://cdn.shopify.com` : "";
const trustedShopifyConnectSource = configuredShopifyDomain ? ` https://${configuredShopifyDomain}` : "";
const developmentConnectSources = process.env.NODE_ENV === "development"
  ? " ws: http://127.0.0.1:* http://localhost:*"
  : "";
const contentSecurityPolicy = [
  "base-uri 'self'",
  "object-src 'none'",
  `img-src 'self' data: blob:${trustedMediaSource}${trustedShopifyImageSources}`,
  `media-src 'self' blob:${trustedMediaSource}`,
  `connect-src 'self'${trustedMediaSource}${trustedShopifyConnectSource}${developmentConnectSources}`,
].join("; ");

const nextConfig: NextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: configuredMediaOrigin.origin || configuredShopifyDomain ? {
    remotePatterns: [
      ...(configuredMediaOrigin.origin ? [{
        hostname: configuredMediaOrigin.hostname ?? "",
        pathname: "/programmes/**",
        port: configuredMediaOrigin.port ?? "",
        protocol: configuredMediaOrigin.protocol ?? "https" as const,
      }] : []),
      ...(configuredShopifyDomain ? [
        { hostname: configuredShopifyDomain, pathname: "/**", protocol: "https" as const },
        { hostname: "cdn.shopify.com", pathname: "/**", protocol: "https" as const },
      ] : []),
    ],
  } : undefined,
  reactStrictMode: true,
  async headers() {
    return [
      {
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
        ],
        source: "/:path*",
      },
    ];
  },
};

export default nextConfig;
