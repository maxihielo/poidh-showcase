/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Bounty claim images are served from poidh's CDN + IPFS gateways. We only
  // render them for the (optional) claim previews.
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

module.exports = nextConfig;
