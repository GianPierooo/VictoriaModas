/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rosa empolvado, cálido y elegante (no saturado)
        rose: {
          DEFAULT: '#E8B4B8',
          light: '#F5E3E0',
          dark: '#D89A9E',
          50: '#FBF3F1',
          100: '#F5E3E0',
          200: '#EFD0CC',
          300: '#E8B4B8',
          400: '#D89A9E',
          500: '#C77F84',
        },
        // Terracota / nude para detalles.
        // DEFAULT y dark oscurecidos para cumplir contraste AA (4.5:1) sobre
        // cream en texto pequeño (eyebrows, badges). light se mantiene: solo
        // se usa como texto claro sobre fondos oscuros (footer).
        clay: {
          DEFAULT: '#9C5F4E', // 4.74:1 sobre cream (antes #C08B7D = 2.73)
          light: '#D7B3A8',
          dark: '#8A5340',    // 5.81:1 sobre cream (antes #A06E60 = 4.03)
        },
        // Crema cálida de fondo
        cream: {
          DEFAULT: '#FBF7F4',
          dark: '#F4EDE7',
        },
        // Tinta cálida (no negro puro)
        ink: {
          DEFAULT: '#2B2424',
          soft: '#5B5150',
          muted: '#756967',   // 4.96:1 sobre cream (antes #8A7E7C = 3.68)
        },
      },
      fontFamily: {
        sans: ['Roboto Flex', 'sans-serif'],
        serif: ['Bodoni Moda', 'serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '5rem',
        },
      },
      boxShadow: {
        'rose': '0 10px 30px -12px rgba(192, 139, 125, 0.25)',
        'rose-md': '0 18px 40px -16px rgba(192, 139, 125, 0.30)',
        'rose-lg': '0 24px 60px -20px rgba(192, 139, 125, 0.35)',
        'rose-xl': '0 30px 70px -24px rgba(192, 139, 125, 0.40)',
        'soft': '0 4px 24px -8px rgba(43, 36, 36, 0.10)',
      },
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #E8B4B8 0%, #F5E3E0 100%)',
        'gradient-rose-light': 'linear-gradient(180deg, #FBF7F4 0%, #F5E3E0 100%)',
        'gradient-radial-rose': 'radial-gradient(circle, rgba(232, 180, 184, 0.12) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in-out',
        'fadeIn': 'fadeIn 0.8s ease-out',
        'fadeInUp': 'fadeInUp 0.8s ease-out',
        'fadeInDown': 'fadeInDown 0.8s ease-out',
        'fadeInLeft': 'fadeInLeft 0.8s ease-out',
        'fadeInRight': 'fadeInRight 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slideDown': 'slideDown 0.5s ease-out',
        'scaleIn': 'scaleIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

