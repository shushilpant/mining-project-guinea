/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── shadcn token bridge (kept so existing usage never breaks) ──
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ── Government design system (single source of truth) ──
        // Forest — brand dark / sidebar / authority
        forest: {
          950: "#011A12",
          900: "#011F14",
          800: "#012C1D",
          700: "#013A27",
          600: "#024B33",
        },
        // Brand green — primary action
        brand: {
          50:  "#ECF5F0",
          100: "#D3E8DD",
          200: "#A7D1BB",
          300: "#6FB494",
          500: "#019059",
          600: "#016940", // primary
          700: "#015534",
          800: "#01432A",
        },
        // Gold — accent only, used sparingly
        gold: {
          400: "#E0B84A",
          500: "#C8991E", // accent
          600: "#A87E14",
        },
        // Ink — text ramp tuned toward forest
        ink: {
          DEFAULT: "#072B1E", // primary text
          2: "#2D5240",       // secondary
          3: "#5A7567",       // muted
          4: "#8AA396",       // placeholder / faint
        },
        // Surfaces & lines
        canvas: "#EDF1EA",      // page background (sage-white)
        surface: "#FFFFFF",     // cards
        "surface-2": "#F6F9F3", // subtle raised / hover rows
        line: {
          DEFAULT: "#DCE5D6", // borders
          soft: "#E9EFE3",    // dividers
          strong: "#C7D3BE",  // emphasised borders
        },
        // Status — calm, accessible
        status: {
          success: "#047857",
          info:    "#1D6FB8",
          warning: "#B45309",
          danger:  "#B91C1C",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        xs:   '0 1px 2px rgba(2,28,18,0.04)',
        sm:   '0 1px 3px rgba(2,28,18,0.05), 0 1px 2px rgba(2,28,18,0.04)',
        card: '0 1px 2px rgba(2,28,18,0.04), 0 6px 16px rgba(2,28,18,0.05)',
        md:   '0 4px 18px rgba(2,28,18,0.08)',
        lg:   '0 14px 36px rgba(2,28,18,0.10)',
        pop:  '0 18px 50px rgba(2,28,18,0.16)',
        'focus-ring': '0 0 0 3px rgba(1,105,64,0.22)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        '2xl': "1rem",
      },
      letterSpacing: {
        tightest: '-0.03em',
        snugger: '-0.015em',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.98)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.3s ease-out both',
        'fade-in-up': 'fade-in-up 0.35s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in':   'scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
