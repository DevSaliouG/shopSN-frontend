/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EDF5F3',
          100: '#D4E8E3',
          200: '#A8D1C7',
          300: '#7AACBF',
          400: '#4D8E7E',
          500: '#3D7A6A',
          600: '#2D5A4C',
          700: '#2D5A4C',
          800: '#1E3D33',
          900: '#1E3D33',
          950: '#0F2219',
        },
        secondary: {
          50: '#FDFBF0',
          100: '#FAF4DB',
          200: '#F4E8B5',
          300: '#EBD58E',
          400: '#E0C06E',
          500: '#D4A84E',
          600: '#C9964B',
          700: '#A87D40',
          800: '#8C6435',
          900: '#6B4B2A',
          950: '#4A3520',
        },
        accent: {
          50: '#FEF7F4',
          100: '#FCEDE6',
          200: '#F7D5C5',
          300: '#F0B49E',
          400: '#E5947A',
          500: '#D97756',
          600: '#C75232',
          700: '#AF4129',
          800: '#8D3320',
          900: '#6B2517',
          950: '#4A1A10',
        },
        surface: {
          50: '#FFFFFF',
          100: '#F8FAFB',
          200: '#F0F4F8',
          300: '#E8EDF2',
          400: '#D8E0E8',
          500: '#C4CED8',
          600: '#A8B5C2',
          700: '#8896A6',
          800: '#6B7A8A',
          900: '#4A5568',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
          600: '#16A34A',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
        },
        whatsapp: '#25D366',
        'whatsapp-dark': '#128C7E',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0, 0, 0, 0.04)',
        'medium': '0 8px 24px rgba(0, 0, 0, 0.06)',
        'elevated': '0 12px 40px rgba(0, 0, 0, 0.08)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
    },
  },
  plugins: [],
}
