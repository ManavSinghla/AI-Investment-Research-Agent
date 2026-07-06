/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "secondary-container": "#45464e",
          "on-secondary": "#2f3037",
          "primary-fixed": "#e2e2e2",
          "tertiary-fixed": "#e2e2e2",
          "on-tertiary-fixed": "#1a1c1c",
          "outline": "#8e9192",
          "surface-variant": "#353434",
          "on-surface": "#e5e2e1",
          "on-secondary-fixed-variant": "#45464e",
          "surface-container-high": "#2a2a2a",
          "surface-container-lowest": "#0e0e0e",
          "surface": "#141313",
          "on-tertiary-fixed-variant": "#454747",
          "surface-container": "#201f1f",
          "on-error": "#690005",
          "surface-bright": "#3a3939",
          "surface-tint": "#c6c6c7",
          "on-secondary-fixed": "#1a1b22",
          "secondary-fixed-dim": "#c6c6cf",
          "surface-dim": "#141313",
          "outline-variant": "#444748",
          "surface-container-low": "#1c1b1b",
          "on-primary-fixed-variant": "#454747",
          "on-surface-variant": "#c4c7c8",
          "inverse-on-surface": "#313030",
          "inverse-surface": "#e5e2e1",
          "tertiary-container": "#e2e2e2",
          "error": "#ffb4ab",
          "background": "#141313",
          "on-secondary-container": "#b4b4bd",
          "primary-container": "#e2e2e2",
          "primary": "#ffffff",
          "tertiary": "#ffffff",
          "error-container": "#93000a",
          "on-primary": "#2f3131",
          "on-background": "#e5e2e1",
          "on-primary-fixed": "#1a1c1c",
          "tertiary-fixed-dim": "#c6c6c7",
          "inverse-primary": "#5d5f5f",
          "on-error-container": "#ffdad6",
          "on-primary-container": "#636565",
          "primary-fixed-dim": "#c6c6c7",
          "surface-container-highest": "#353434",
          "on-tertiary-container": "#636565",
          "secondary": "#c6c6cf",
          "secondary-fixed": "#e2e1eb",
          "on-tertiary": "#2f3131"
      },
      "borderRadius": {
          "DEFAULT": "0.125rem",
          "lg": "0.25rem",
          "xl": "0.5rem",
          "full": "0.75rem"
      },
      "spacing": {
          "section-gap": "128px",
          "safe-area-mobile": "20px",
          "gutter": "24px",
          "unit": "8px",
          "container-padding": "64px"
      },
      "fontFamily": {
          "body-md": ["Geist", "sans-serif"],
          "body-lg": ["Geist", "sans-serif"],
          "display-lg-mobile": ["Newsreader", "serif"],
          "headline-md": ["Newsreader", "serif"],
          "display-lg": ["Newsreader", "serif"],
          "label-caps": ["Geist", "sans-serif"],
          "mono-data": ["Geist", "monospace"]
      },
      "fontSize": {
          "body-md": ["15px", { "lineHeight": "1.5", "fontWeight": "400" }],
          "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
          "display-lg-mobile": ["40px", { "lineHeight": "1.2", "fontWeight": "300" }],
          "headline-md": ["32px", { "lineHeight": "1.3", "fontWeight": "400" }],
          "display-lg": ["64px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "300" }],
          "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.1em", "fontWeight": "600" }],
          "mono-data": ["14px", { "lineHeight": "1", "letterSpacing": "-0.01em", "fontWeight": "500" }]
      },
      "animation": {
          'fade-in-up': 'fadeInUp 1s ease-out forwards',
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      "keyframes": {
          fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          }
      }
    }
  },
  plugins: [],
}
