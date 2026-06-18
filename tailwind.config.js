/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Advercase", "Inter", "serif"],
        advercase: ["Advercase", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#FF5000",
          deep: "#D14B1E",
          tint: "#FFF6EB",
        },
        pebbo: {
          purple: "#8264FF",
          pink: "#FF64A0",
          mint: "#02CDD2",
          "mint-tint": "#E4FEFF",
          gold: "#B78316",
          yellow: "#FFDA27",
        },
        success: {
          DEFAULT: "#00BE2A",
          tint: "#DEF9D0",
        },
        error: {
          DEFAULT: "#D41C02",
          loud: "#FC2C29",
        },
        surface: {
          0: "#FFFFFF",
          1: "#FAFAF8",
          2: "#F4F2EF",
        },
        border: {
          subtle: "#EAEAEA",
          DEFAULT: "#D9D9D9",
        },
        ink: {
          strong: "#1A1815",
          DEFAULT: "#565656",
          muted: "#8D8D8D",
        },
      },
      animation: {
        "coin-jump": "coin-jump 450ms ease-out 0s 3",
        "streak-wiggle": "streak-wiggle 600ms ease-in-out both",
        "restore-color": "restore-color 0.5s ease-in forwards",
        "metal-sheen": "metal-sheen 0.7s ease-in-out",
        "card-pop": "card-pop 0.5s ease-out",
        "card-glow": "card-glow 1s ease-in-out forwards",
        "number-pop-effect": "number-pop-effect 300ms ease-out",
        "final-pop": "final-pop 400ms ease-out",
        "break-bend": "break-bend 0.6s ease-in-out infinite",
        "break-arm-left": "break-arm-left 0.6s ease-in-out infinite",
        "break-arm-right": "break-arm-right 0.6s ease-in-out infinite",
        "break-leg-left": "break-leg-left 0.6s ease-in-out infinite",
        "break-leg-right": "break-leg-right 0.6s ease-in-out infinite",
      },
      keyframes: {
        "coin-jump": {
          "0%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-12px)" },
          "40%": { transform: "translateY(0)" },
          "60%": { transform: "translateY(-8px)" },
          "80%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(0)" },
        },
        "streak-wiggle": {
          "0%": { transform: "translateZ(0) scale(1) rotate(0deg)" },
          "20%": { transform: "translateZ(0) scale(1.05) rotate(-4deg)" },
          "50%": { transform: "translateZ(0) scale(1.05) rotate(4deg)" },
          "80%": { transform: "translateZ(0) scale(1.03) rotate(-2deg)" },
          "100%": { transform: "translateZ(0) scale(1) rotate(0deg)" },
        },
        "restore-color": {
          from: { filter: "grayscale(100%)" },
          to: { filter: "grayscale(0%)" },
        },
        "metal-sheen": {
          "0%": { transform: "translateX(-100%) skewX(-20deg)" },
          "100%": { transform: "translateX(200%) skewX(-20deg)" },
        },
        "card-pop": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.07)" },
        },
        "card-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0,0,0,0)" },
          "50%": {
            boxShadow: "0 0 20px 8px var(--glow-color, rgba(255,193,7,0.7))",
          },
        },
        "number-pop-effect": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
        "final-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.4)" },
          "100%": { transform: "scale(1)" },
        },
        "break-bend": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-2px) rotate(-1deg)" },
          "50%": { transform: "translateY(0) rotate(0deg)" },
          "75%": { transform: "translateY(-1px) rotate(1deg)" },
        },
        "break-arm-left": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(-2deg)" },
        },
        "break-arm-right": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(5deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(2deg)" },
        },
        "break-leg-left": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(-1deg)" },
        },
        "break-leg-right": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(3deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(1deg)" },
        },
      },
    },
  },
  plugins: [],
};
