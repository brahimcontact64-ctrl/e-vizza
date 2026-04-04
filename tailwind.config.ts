import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2F7F6D',
          light: '#E8F5F2',
          dark: '#245F51',
        },
        secondary: {
          DEFAULT: '#3D9A88',
        },
        accent: {
          DEFAULT: '#22C55E',
        },
        background: {
          DEFAULT: '#F6F8F7',
          light: '#F6F8F7',
          dark: '#1F2937',
        },
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.1)',
        'primary': '0 4px 12px rgba(47, 127, 109, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
