/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['images.unsplash.com'], // add more if needed
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // If you truly want no indexing (optional):
          { key: 'x-robots-tag', value: 'noindex' },

          // Security headers (must be HTTP headers, not <meta>)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              // ✅ fixes your data:image + canvas fetch issue
              "connect-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              // allow self-embedding; tighten later if you want
              "frame-ancestors 'self'",
              'upgrade-insecure-requests',
            ].join('; '),
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
