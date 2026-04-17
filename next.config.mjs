/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // CSP managed by middleware.ts (nonce-based)
];

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/app/ios', destination: 'https://apps.apple.com/ru/app/happ-proxy-utility-plus/id6746188973', permanent: false },
      { source: '/app/android', destination: 'https://play.google.com/store/apps/details?id=com.happproxy', permanent: false },
      { source: '/app/hiddify-ios', destination: 'https://apps.apple.com/app/hiddify/id6596777532', permanent: false },
      { source: '/app/hiddify-android', destination: 'https://github.com/hiddify/hiddify-app/releases/latest', permanent: false },
      { source: '/app/windows', destination: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe', permanent: false },
      { source: '/app/macos', destination: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg', permanent: false },
    ];
  },
};

export default nextConfig;
