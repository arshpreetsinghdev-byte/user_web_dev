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
};

export default nextConfig;
