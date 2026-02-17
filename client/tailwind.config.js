/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['"Plus Jakarta Sans"', 'sans-serif'],
                body: ['"DM Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['"DM Sans"', 'sans-serif'], // Set default sans to body font
            },
            colors: {
                primary: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    500: '#3B82F6',
                    600: '#2563EB',
                    700: '#1D4ED8',
                    DEFAULT: '#3B82F6',
                },
                neutral: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    700: '#334155',
                    900: '#0F172A',
                },
                sidebar: {
                    DEFAULT: '#1E293B',
                    hover: '#334155',
                    active: '#2563EB',
                    text: '#94A3B8',
                    'active-text': '#FFFFFF',
                },
                surface: {
                    DEFAULT: '#FFFFFF', // Card bg
                    page: '#F8FAFC',    // Page bg
                    raised: '#FFFFFF',
                    sunken: '#F1F5F9',
                },
                accent: {
                    DEFAULT: '#14B8A6',
                    50: '#F0FDFA',
                    100: '#CCFBF1',
                    500: '#14B8A6',
                },
                success: {
                    50: '#F0FDF4',
                    500: '#22C55E',
                    700: '#15803D',
                },
                warning: {
                    50: '#FFFBEB',
                    500: '#F59E0B',
                    700: '#B45309',
                },
                danger: {
                    50: '#FFF1F2',
                    500: '#EF4444',
                    700: '#B91C1C',
                },
            },
            borderRadius: {
                DEFAULT: '10px',
                sm: '6px',
                lg: '14px',
                xl: '20px',
            },
            boxShadow: {
                card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                'card-hover': '0 8px 24px rgba(37,99,235,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                modal: '0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-out',
                'slide-up': 'slideUp 0.2s ease-out',
                'shimmer': 'shimmer 1.5s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
        },
    },
    plugins: [],
}
