module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        // Hybrid Luxury Palette: Cinema Noir & Studio Alabaster
        'noir': '#0A0A0A',
        'noir-elevated': '#141414',
        'alabaster': '#F6F5F1',
        'stone-frame': '#EAE8E2',
        'stone-deep': '#DDDAD1',
        'ink': '#0D0D0D',
        'ink-muted': '#64625C',
        'bone': '#F4F2ED',
        'ash': '#8E8B84',
        // Legacy aliases kept safe
        'primary-bg': '#F6F5F1',
        'primary-text': '#0D0D0D',
        'secondary-text': '#64625C',
        'accent': '#0D0D0D',
        'button-bg': '#0D0D0D',
        'button-hover': '#262626',
      },
      fontFamily: {
        'display': ['var(--font-display)', '"Playfair Display"', 'Georgia', 'serif'],
        'body': ['var(--font-body)', '"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        'mono': ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
