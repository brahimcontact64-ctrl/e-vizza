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
          DEFAULT: '#00D474',
          light: '#E8FFF4',
          dark: '#00B863',
        },
        secondary: {
          DEFAULT: '#0B3948',
        },
        accent: {
          DEFAULT: '#FED488',
        },
        background: {
          DEFAULT: '#F7FBFA',
          light: '#FFFFFF',
          dark: '#0B3948',
        },
        text: {
          primary: '#0B3948',
          secondary: '#5F7B84',
        },
        border: {
          DEFAULT: '#DDEAE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '10px',
        'md': '14px',
        'lg': '18px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 8px 30px rgba(11, 57, 72, 0.08)',
        'card-hover': '0 16px 42px rgba(11, 57, 72, 0.14)',
        'primary': '0 12px 30px rgba(0, 212, 116, 0.25)',
      },
    },
  },
  plugins: [],
} satisfies Config;
