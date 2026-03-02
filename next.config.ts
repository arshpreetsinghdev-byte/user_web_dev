/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-drivers.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-ride-data.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-drivers.s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-ride-data.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "s3-ap-southeast-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tablabar.s3.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jugnoo-autos-profile-images.s3.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://js.stripe.com https://web.squarecdn.com https://connect.squareup.com https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "font-src 'self' https://fonts.gstatic.com https://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://maps.googleapis.com https://api.stripe.com https://connect.squareup.com https://chat.hippochat.io wss://chat.hippochat.io https://hscriptscdnnew.ec2dashboard.com https://*.jugnoo.in",
              "frame-src https://js.stripe.com https://connect.squareup.com https://chat.hippochat.io https://widget.hippochat.io",
          ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
 