module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Include paths for your components
  ],
  darkMode: 'class', // Enables dark mode via class
  theme: {
    extend: {
      colors: {
        'primary-bg': '#000000', // Black background for dark theme
        'primary-text': '#ffffff', // White text color
        'secondary-text': '#cccccc', // Light grey text color
        'accent': '#888888', // Accent color for buttons, borders, etc.
        'button-bg': '#444444', // Button background
        'button-hover': '#666666', // Button hover effect
      },
      fontFamily: {
        'fette-gotisch': ['"Fette Gotisch"', 'serif'],
      },
    },
  },
  plugins: [],
}
