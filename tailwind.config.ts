import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: '#ceff00',
        obsidian: '#0c0c0c',
        gunmetal: '#414141',
        charcoal: '#5a5a5a',
        ash: '#8d8d8d',
        silver: '#b3b3b3',
        alabaster: '#d9d9d9',
        platinum: '#ececec',
        porcelain: '#f5f4f2',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'Fragment Mono', 'monospace'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'technical-grid': 'linear-gradient(to right, rgba(245, 244, 242, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(245, 244, 242, 0.08) 1px, transparent 1px)',
        'technical-grid-dark': 'linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
        'technical-grid-light': 'linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-unit': '114px 114px',
      },
      animation: {
        'slideDown': 'slideDown 0.3s ease-out forwards',
        'slideUp': 'slideUp 0.3s ease-in forwards',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'var(--radix-content-height, auto)', opacity: '1' }
        },
        slideUp: {
          '0%': { height: 'var(--radix-content-height, auto)', opacity: '1' },
          '100%': { height: '0', opacity: '0' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      }
    },
  },
  plugins: [],
};

export default config;
