/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				border: 'var(--color-border)',
				input: 'var(--color-input)',
				ring: 'var(--color-ring)',
				background: 'var(--color-background)',
				foreground: 'var(--color-foreground)',
				primary: {
					DEFAULT: 'var(--color-primary)',
					foreground: 'var(--color-primary-foreground)',
					100: 'var(--primary-100)',
					200: 'var(--primary-200)',
					300: 'var(--primary-300)',
					400: 'var(--primary-400)',
					500: 'var(--primary-500)',
					600: 'var(--primary-600)',
					700: 'var(--primary-700)',
					800: 'var(--primary-800)',
					900: 'var(--primary-900)',
				},
				secondary: {
					DEFAULT: 'var(--color-secondary)',
					foreground: 'var(--color-secondary-foreground)',
					100: 'var(--secondary-100)',
					200: 'var(--secondary-200)',
					300: 'var(--secondary-300)',
					400: 'var(--secondary-400)',
					500: 'var(--secondary-500)',
					600: 'var(--secondary-600)',
					700: 'var(--secondary-700)',
					800: 'var(--secondary-800)',
					900: 'var(--secondary-900)',
				},
				destructive: {
					DEFAULT: 'var(--color-destructive)',
					foreground: 'var(--color-destructive-foreground)',
				},
				muted: {
					DEFAULT: 'var(--color-muted)',
					foreground: 'var(--color-muted-foreground)',
				},
				accent: {
					DEFAULT: 'var(--color-accent)',
					foreground: 'var(--color-accent-foreground)',
					100: 'var(--accent-100)',
					200: 'var(--accent-200)',
					300: 'var(--accent-300)',
					400: 'var(--accent-400)',
					500: 'var(--accent-500)',
					600: 'var(--accent-600)',
					700: 'var(--accent-700)',
					800: 'var(--accent-800)',
					900: 'var(--accent-900)',
				},
				popover: {
					DEFAULT: 'var(--color-popover)',
					foreground: 'var(--color-popover-foreground)',
				},
				card: {
					DEFAULT: 'var(--color-card)',
					foreground: 'var(--color-card-foreground)',
				},
				success: {
					100: 'var(--success-100)',
					500: 'var(--success-500)',
					900: 'var(--success-900)',
				},
				warning: {
					100: 'var(--warning-100)',
					500: 'var(--warning-500)',
					900: 'var(--warning-900)',
				},
				error: {
					100: 'var(--error-100)',
					500: 'var(--error-500)',
					900: 'var(--error-900)',
				},
				info: {
					100: 'var(--info-100)',
					500: 'var(--info-500)',
					900: 'var(--info-900)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				primary: ['var(--font-primary)', 'sans-serif'],
				secondary: ['var(--font-secondary)', 'sans-serif'],
				mono: ['var(--font-mono)', 'monospace'],
			},
			boxShadow: {
				'space-sm': '0 2px 8px rgba(0, 27, 61, 0.05)',
				'space-md': '0 4px 16px rgba(0, 27, 61, 0.1)',
				'space-lg': '0 8px 32px rgba(0, 27, 61, 0.15)',
				'space-xl': '0 16px 48px rgba(0, 27, 61, 0.2)',
				'nebula-glow': '0 0 15px rgba(173, 51, 255, 0.35)',
				'cosmic-glow': '0 0 20px rgba(51, 255, 204, 0.4)',
			},
			animation: {
				'space-float': 'space-float 6s ease-in-out infinite',
				'nebula-pulse': 'nebula-pulse 3s ease-in-out infinite',
				'star-twinkle': 'star-twinkle 4s ease-in-out infinite',
				'fade-in': 'fadeIn 0.3s ease-in-out forwards',
				'fade-out': 'fadeOut 0.3s ease-in-out forwards',
				'slide-in-right': 'slideInRight 0.3s ease-out forwards',
				'slide-in-left': 'slideInLeft 0.3s ease-out forwards',
				'slide-in-up': 'slideInUp 0.3s ease-out forwards',
				'slide-in-down': 'slideInDown 0.3s ease-out forwards',
				'scale-in': 'scaleIn 0.2s ease-out forwards',
				'scale-out': 'scaleOut 0.2s ease-in forwards',
				'bounce-slow': 'bounce 3s ease-in-out infinite',
				'pulse-slow': 'pulse 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite',
				'progress-fill': 'progressFill 1s ease-out forwards',
				'checkmark': 'checkmark 0.6s ease-in-out forwards',
				'notification-in': 'notificationSlideIn 0.3s ease-out forwards',
				'modal-fade-in': 'modalFadeIn 0.3s ease-out forwards',
				'modal-backdrop-fade-in': 'modalBackdropFadeIn 0.3s ease-out forwards',
				'shake': 'shake 0.5s ease-in-out',
				'gradient-flow': 'gradientFlow 5s ease infinite',
			},
			keyframes: {
				'space-float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'nebula-pulse': {
					'0%, 100%': { opacity: 1, transform: 'scale(1)' },
					'50%': { opacity: 0.7, transform: 'scale(1.05)' },
				},
				'star-twinkle': {
					'0%, 100%': { opacity: 1 },
					'50%': { opacity: 0.5 },
				},
			},
			backgroundImage: {
				'space-gradient': 'linear-gradient(to bottom right, var(--primary-900), var(--secondary-800), var(--primary-700))',
				'nebula-gradient': 'linear-gradient(135deg, var(--secondary-900), var(--secondary-700), var(--primary-800), var(--accent-700), var(--secondary-800))',
				'cosmic-gradient': 'linear-gradient(to right, var(--accent-700), var(--primary-600))',
			},
			transitionTimingFunction: {
				'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'warp': 'cubic-bezier(0.19, 1, 0.22, 1)',
			},
		},
	},
	plugins: [
		require('tailwindcss-animate')
	],
};