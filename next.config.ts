const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true, // disable PWA temporarily
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
