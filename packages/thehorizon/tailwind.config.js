import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
module.exports = {
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
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        loading: {
          "0%": {
            opacity: ".2",
          },
          "20%": {
            opacity: "1",
          },
          "100%": {
            opacity: ".2",
          },
        },
        "fluid-pulse": {
          "0%, 100%": {
            transform: "scale(0.95)",
            opacity: "0.5",
          },
          "50%": {
            transform: "scale(1)",
            opacity: "0.8",
          },
        },
        "energy-trail": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(0.8)",
            opacity: "0.8",
          },
        },
        "electric-spark": {
          "0%": {
            transform: "rotate(0deg)",
            opacity: "0",
          },
          "25%": {
            opacity: "0.8",
          },
          "50%": {
            transform: "rotate(180deg)",
            opacity: "0",
          },
          "75%": {
            opacity: "0.8",
          },
          "100%": {
            transform: "rotate(360deg)",
            opacity: "0",
          },
        },
        "slow-glow": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
            borderColor: "rgba(234, 179, 8, 0.2)",
          },
          "50%": {
            opacity: "0.9", 
            transform: "scale(1.01)",
            borderColor: "rgba(234, 179, 8, 0.4)",
          },
        },
        "zen-breathe": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1) translateY(0px)",
          },
          "50%": {
            opacity: "0.85",
            transform: "scale(1.002) translateY(-1px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fluid-pulse": "fluid-pulse 1.5s ease-in-out infinite",
        "energy-trail": "energy-trail 2s ease-in-out infinite",
        "electric-spark": "electric-spark 3s linear infinite",
        "slow-glow": "slow-glow 20s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "zen-breathe": "zen-breathe 3s cubic-bezier(0.4, 0.15, 0.6, 0.85) infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
