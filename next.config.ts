const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // ⬅️ disable PWA in dev
  register: true,
  skipWaiting: true,
})

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
]

const swHeaders = [
  {
    key: 'Content-Type',
    value: 'application/javascript; charset=utf-8',
  },
  {
    key: 'Cache-Control',
    value: 'no-cache, no-store, must-revalidate',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'",
  },
]

module.exports = withPWA({
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/sw.js',
        headers: swHeaders,
      },
    ]
  },
})
