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
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--background)",
          foreground: "var(--foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

        // Brand colors updated for dark theme vibrancy
        brand: {
          50:  "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
        },
        gold: {
          400: "var(--gold-400)",
          500: "var(--gold-500)",
          600: "var(--gold-600)",
        },
        // Old colors mapped to variables for theming
        forest: {
          950: "var(--forest-950)",
          900: "var(--forest-900)",
          800: "var(--forest-800)",
          700: "var(--forest-700)",
          600: "var(--forest-600)",
        },
        blue: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        ink: {
          DEFAULT: "var(--foreground)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
        canvas: "var(--background)",
        surface: "var(--card)",
        "surface-2": "var(--secondary)",
        line: {
          DEFAULT: "var(--border)",
          soft: "var(--line-soft)",
          strong: "var(--line-strong)",
        },
        status: {
          success: "var(--primary)",
          info:    "var(--accent)",
          warning: "#F59E0B",
          danger:  "var(--destructive)",
        },
      },
      fontFamily: {
        sans: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        xs:   '0 1px 2px rgba(0,0,0,0.1)',
        sm:   '0 2px 4px rgba(0,0,0,0.1)',
        card: '0 8px 32px rgba(0,0,0,0.1)',
        md:   '0 12px 40px rgba(0,0,0,0.15)',
        lg:   '0 24px 60px rgba(0,0,0,0.2)',
        pop:  '0 32px 80px rgba(0,0,0,0.2)',
        'focus-ring': '0 0 0 3px var(--ring)',
        glow: '0 0 20px var(--ring)',
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
        xl: "1rem",
        '2xl': "1.25rem",
        '3xl': "1.75rem",
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, var(--secondary) 0%, transparent 100%)',
        'glass-border': 'linear-gradient(135deg, var(--border) 0%, transparent 100%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in':    'fade-in 0.4s ease-out both',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':   'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
