import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	images: {
		domains: [
			'images.unsplash.com',
			'i.pravatar.cc',
			'cdn-icons-png.flaticon.com',
			'localhost',
			'blackholejs.art',
			'cdn.intra.42.fr',
			'lh3.googleusercontent.com',
		],
	},
	env: {
		NEXT_PUBLIC_GATEWAY_URL: 'https://blackholejs.art',
		NEXT_PUBLIC_GATEWAY_SOCKET_URL: 'https://blackholejs.art',
		NEXT_PUBLIC_GATEWAY_SOCKET_PATH: '/gateway.socket'
	},
	typescript: {
		ignoreBuildErrors: true
	},
	// Client-side rendering configuration
	experimental: {
		appDir: true,
	}
};

export default nextConfig;