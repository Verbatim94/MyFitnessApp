import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-2": "hsl(var(--card-2))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        ring: "hsl(var(--ring))"
      },
      boxShadow: {
        soft: "0 14px 48px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(255,255,255,0.05), 0 18px 50px rgba(38, 70, 83, 0.35)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at top, rgba(171, 201, 187, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(198, 183, 151, 0.12), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
