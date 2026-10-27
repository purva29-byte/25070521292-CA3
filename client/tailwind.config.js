/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F3EC',
        paper: '#FFFDF8',
        ink: '#17201B',
        muted: '#6F756F',
        line: '#E3DED2',
        forest: {
          50: '#EEF5F0',
          100: '#DCEBE1',
          200: '#BCD7C6',
          300: '#8DBAA3',
          400: '#5D977C',
          500: '#36785E',
          600: '#1F5A43',
          700: '#184734',
          800: '#153A2C',
          900: '#112F24',
        },
        ochre: {
          50: '#FAF4E6',
          100: '#F3E7C8',
          500: '#9A7424',
          700: '#715219',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 32, 27, 0.04), 0 8px 24px rgba(23, 32, 27, 0.04)',
        lift: '0 18px 48px rgba(23, 32, 27, 0.10)',
        focus: '0 0 0 4px rgba(31, 90, 67, 0.16)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.6rem',
      },
      animation: {
        'fade-up': 'fadeUp 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 300ms ease both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
