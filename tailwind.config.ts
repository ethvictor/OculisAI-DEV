
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4D3B99", // Oculis AI purple
          foreground: "#FFFFFF",
          100: "#EAE5F9",
          200: "#D5CCF4",
          300: "#BFB3EF",
          400: "#AA99E9",
          500: "#9580E4",
          600: "#7F66DF",
          700: "#6A4DD9",
          800: "#5533D4",
          900: "#4D3B99",
        },
        accent: {
          DEFAULT: "#FF6B6B",
          100: "#FFECEC",
          200: "#FFB3B3",
          300: "#FF8080",
          400: "#FF4D4D",
          500: "#FF1A1A",
          600: "#CC0000",
          700: "#990000",
          800: "#660000",
          900: "#330000",
        },
        metrics: {
          up: "#10B981",
          down: "#EF4444",
          neutral: "#6B7280",
        },
        apple: {
          gray: {
            50: "#F5F5F7",
            100: "#E8E8ED",
            200: "#D2D2D7",
            300: "#AEAEB2",
            400: "#8E8E93",
            500: "#6E6E73",
            600: "#3F3F41",
            700: "#2C2C2E",
            800: "#1D1D1F",
            900: "#000000",
          },
          blue: {
            DEFAULT: "#0066CC",
            light: "#5AC8FA",
            dark: "#007AFF",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "fade-in": "fade-in 0.7s ease-out forwards",
      },
      fontFamily: {
        sans: [
          "SF Pro Display", 
          "SF Pro", 
          "system-ui", 
          "-apple-system", 
          "BlinkMacSystemFont", 
          "Helvetica Neue", 
          "Helvetica", 
          "sans-serif"
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
