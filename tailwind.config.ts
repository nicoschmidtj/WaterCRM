import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Glassmorphism theme colors
        ink: {
          DEFAULT: "rgba(255,255,255,0.92)",
          muted: "rgba(255,255,255,0.68)",
          700: "rgba(255,255,255,0.7)",
        },
        surface: {
          50: "rgba(255,255,255,0.04)",
          100: "rgba(255,255,255,0.08)",
          200: "rgba(255,255,255,0.12)",
          300: "rgba(255,255,255,0.18)",
        },
        // Light theme colors (legacy)
        'bg-base': '#F9FAFB',
        'panel': '#FFFFFF',
        'fg': '#0F172A',
        'muted': '#6B7280',
        'border': '#E5E7EB',
        'accent': '#2563EB',
        // Dark theme colors (legacy)
        'dark-bg-base': '#0B0E14',
        'dark-panel': '#0F131A',
        'dark-fg': '#E5E7EB',
        'dark-muted': '#B8BFC7',
        'dark-border': '#1C2330',
        'dark-accent': '#60A5FA',
      },
      borderRadius: {
        'pill': 'var(--radius-pill)',
        'card': 'var(--radius-card)',
        'panel': 'var(--radius-panel)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'elev': 'var(--shadow-elev)',
      },
      fontSize: {
        'h1': ['22px', { lineHeight: '28px' }],
        'h2': ['18px', { lineHeight: '26px' }],
        'h3': ['16px', { lineHeight: '24px' }],
        'body': ['14px', { lineHeight: '22px' }],
      },
    }
  },
  plugins: [],
};
export default config;
