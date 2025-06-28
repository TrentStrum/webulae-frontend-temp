/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer, dev }) => {
		if (isServer) {
			if (!Array.isArray(config.externals)) {
				config.externals = config.externals ? [config.externals] : [];
			}
			config.externals.push('@prisma/client');
		}

		// Add fallbacks for Node.js core modules
		config.resolve.fallback = {
			...config.resolve.fallback,
			_http_common: false,
			http: false,
			https: false,
			url: false,
			util: false,
			stream: false,
			crypto: false,
			zlib: false,
			path: false,
			fs: false,
			net: false,
			child_process: false,
		};

		if (dev) {
			config.watchOptions = {
				poll: 1000,
				aggregateTimeout: 300,
			};
		}

		return config;
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.pexels.com',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'assets.aceternity.com',
			},
			{
				protocol: 'https',
				hostname: 'img.clerk.com',
			},
		],
		formats: ['image/avif', 'image/webp'],
	},
	experimental: {
		optimizeCss: true,
		optimizePackageImports: [
			'lucide-react',
			'recharts',
			'@radix-ui/react-dialog',
			'@radix-ui/react-dropdown-menu',
		],
		serverComponentsExternalPackages: ['@prisma/client'],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
};

module.exports = nextConfig;
