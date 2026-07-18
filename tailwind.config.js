/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A', // Deep Navy
          foreground: '#F8FAFC',
        },
        secondary: {
          DEFAULT: '#334155', // Slate
          foreground: '#F1F5F9',
        },
        accent: {
          DEFAULT: '#2563EB', // Royal Blue
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#22C55E', // Green
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
          foreground: '#0F172A',
        },
        danger: {
          DEFAULT: '#EF4444', // Red
          foreground: '#FFFFFF',
        },
        enterprise: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          textPrimary: '#0F172A',
          textSecondary: '#64748B',
          textMuted: '#94A3B8',
        },
        // Dark Mode equivalents
        dark: {
          bg: '#0B0F19',
          card: '#151C2C',
          border: '#1E293B',
          textPrimary: '#F8FAFC',
          textSecondary: '#94A3B8',
          textMuted: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        enterprise: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        enterpriseHover: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
