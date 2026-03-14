export default {
  theme: {
    screens: {
      'xs': '320px',   // Extra small phones
      'sm': '640px',   // Small devices
      'md': '768px',   // Tablets
      'lg': '1024px',  // Laptops
      'xl': '1280px',  // Desktops
      '2xl': '1536px', // Large screens
    },
    extend: {
      spacing: {
        'nav-height': '5rem', // Replaces hardcoded h-20
      },
      fontSize: {
        'hero-xs': ['2rem', { lineHeight: '1.2' }], // 32px for mobile
        'hero-sm': ['3rem', { lineHeight: '1.2' }], // 48px for tablets
        'hero-lg': ['5rem', { lineHeight: '1.2' }], // 80px for desktop
      },
    },
  },
};