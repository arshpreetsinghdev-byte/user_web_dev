/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://prod-autos-api.jugnoo.in/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://maps.gstatic.com https://js.stripe.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://connect.squareup.com https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://sandbox.web.squarecdn.com https://web.squarecdn.com https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "font-src 'self' https://fonts.gstatic.com https://maps.gstatic.com https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://maps.googleapis.com https://maps.gstatic.com https://api.stripe.com https://connect.squareup.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com https://chat.hippochat.io wss://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com https://*.jugnoo.in https://*.ingest.sentry.io",
              "frame-src https://js.stripe.com https://connect.squareup.com https://web.squarecdn.com https://sandbox.web.squarecdn.com https://chat.hippochat.io https://widget.hippochat.io",
          ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
 