import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permitir imagens locais e do próprio domínio
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.up.railway.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
    // Para produção, desabilitar otimização se houver problemas
    ...(process.env.NODE_ENV === 'production' && {
      unoptimized: true,
    }),
  },
};

export default nextConfig;
