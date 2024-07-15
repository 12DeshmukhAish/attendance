// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;
const withPWA = require('next-pwa');

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development', // Corrected the comparison operator
  },
});
