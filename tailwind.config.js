/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './vibes/**/*.{ts,tsx}',
    '!./node_modules/**', // Exclude everything in node_modules to speed up builds
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)'],
      heading: ['var(--font-family-heading)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      body: ['var(--font-family-body)', 'system-ui', 'sans-serif'],
      sriracha: ['Sriracha', 'cursive'],
    },
    extend: {
      colors: {
        // Base colors - using CSS variables for consistency
        white: 'var(--white)',
        black: 'var(--black)',
        transparent: 'transparent',
        current: 'currentColor',

        // Text colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          disabled: 'var(--text-disabled)',
          placeholder: 'var(--text-placeholder)',
          'placeholder-subtle': 'var(--text-placeholder-subtle)',
          white: 'var(--text-white)',
        },

        // Brand colors - using CSS variables for dynamic theming
        brand: {
          DEFAULT: 'hsl(var(--brand) / <alpha-value>)',
          foreground: 'hsl(var(--brand-foreground) / <alpha-value>)',
          25: 'hsl(var(--brand-25) / <alpha-value>)',
          50: 'hsl(var(--brand-50) / <alpha-value>)',
          100: 'hsl(var(--brand-100) / <alpha-value>)',
          200: 'hsl(var(--brand-200) / <alpha-value>)',
          300: 'hsl(var(--brand-300) / <alpha-value>)',
          400: 'hsl(var(--brand-400) / <alpha-value>)',
          500: 'hsl(var(--brand-500) / <alpha-value>)',
          600: 'hsl(var(--brand-600) / <alpha-value>)',
          700: 'hsl(var(--brand-700) / <alpha-value>)',
          800: 'hsl(var(--brand-800) / <alpha-value>)',
          900: 'hsl(var(--brand-900) / <alpha-value>)',
          950: 'hsl(var(--brand-950) / <alpha-value>)',
          1000: 'hsl(var(--brand-1000) / <alpha-value>)',
        },

        // Accent (VPG red) - added for this project's CTA buttons and offers
        accent: {
          500: 'hsl(var(--accent-500) / <alpha-value>)',
          600: 'hsl(var(--accent-600) / <alpha-value>)',
        },

        // Gray scale
        gray: {
          25: 'var(--gray-25)',
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
          950: 'var(--gray-950)',
        },

        // Error colors
        error: {
          25: 'var(--error-25)',
          50: 'var(--error-50)',
          100: 'var(--error-100)',
          200: 'var(--error-200)',
          300: 'var(--error-300)',
          400: 'var(--error-400)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
          800: 'var(--error-800)',
          900: 'var(--error-900)',
          950: 'var(--error-950)',
        },

        // Warning colors
        warning: {
          25: 'var(--warning-25)',
          50: 'var(--warning-50)',
          100: 'var(--warning-100)',
          200: 'var(--warning-200)',
          300: 'var(--warning-300)',
          400: 'var(--warning-400)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
          800: 'var(--warning-800)',
          900: 'var(--warning-900)',
          950: 'var(--warning-950)',
        },

        // Success colors
        success: {
          25: 'var(--success-25)',
          50: 'var(--success-50)',
          100: 'var(--success-100)',
          200: 'var(--success-200)',
          300: 'var(--success-300)',
          400: 'var(--success-400)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
          800: 'var(--success-800)',
          900: 'var(--success-900)',
          950: 'var(--success-950)',
        },

        // Utility colors
        utility: {
          blue: {
            200: 'var(--utility-blue-200)',
            500: 'var(--utility-blue-500)',
            600: 'var(--utility-blue-600)',
            700: 'var(--utility-blue-700)',
          },
          purple: {
            200: 'var(--utility-purple-200)',
            500: 'var(--utility-purple-500)',
            600: 'var(--utility-purple-600)',
            700: 'var(--utility-purple-700)',
          },
        },

        // Component specific colors
        component: {
          button: {
            primary: 'var(--button-primary)',
            secondary: 'var(--button-secondary)',
            disabled: 'var(--button-disabled)',
          },
          header: {
            abstract: {
              50: 'var(--header-abstract-50-bg)',
              100: 'var(--header-abstract-100-bg)',
              200: 'var(--header-abstract-200-bg)',
              300: 'var(--header-abstract-300-bg)',
            },
          },
          tooltip: {
            text: 'var(--tooltip-supporting-text)',
          },
          badge: {
            bg: 'var(--badge-bg)',
            fg: 'var(--badge-fg)',
            border: 'var(--badge-border)',
            borderHover: 'var(--badge-border-Hover)',
            borderIcon: 'var(--badge-border-Icon)',
          },
          footer: {
            button: {
              fg: 'var(--footer-button-fg)',
              fgHover: 'var(--footer-button-fg_hover)',
            },
            badge: {
              fg: 'var(--footer-badge-fg)',
              border: 'var(--footer-badge-border)',
              bg: 'var(--footer-badge-bg)',
            },
          },
        },

        // Alpha colors
        alpha: {
          white: {
            90: 'var(--alpha-white-90)',
            80: 'var(--alpha-white-80)',
            70: 'var(--alpha-white-70)',
            60: 'var(--alpha-white-60)',
            50: 'var(--alpha-white-50)',
            40: 'var(--alpha-white-40)',
            30: 'var(--alpha-white-30)',
            20: 'var(--alpha-white-20)',
            10: 'var(--alpha-white-10)',
          },
          black: {
            10: 'var(--alpha-black-10)',
            20: 'var(--alpha-black-20)',
            30: 'var(--alpha-black-30)',
            40: 'var(--alpha-black-40)',
          },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-body': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-headings': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-lead': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-links': 'hsl(var(--primary) / <alpha-value>)',
            '--tw-prose-bold': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-counters': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-bullets': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-hr': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-quotes': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-quote-borders': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-captions': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-code': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-pre-code': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-pre-bg': 'hsl(var(--muted) / <alpha-value>)',
            '--tw-prose-th-borders': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-td-borders': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-invert-body': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-headings': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-lead': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-invert-links': 'hsl(var(--primary) / <alpha-value>)',
            '--tw-prose-invert-bold': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-counters': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-invert-bullets': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-invert-hr': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-invert-quotes': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-quote-borders': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-invert-captions': 'hsl(var(--muted-foreground) / <alpha-value>)',
            '--tw-prose-invert-code': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-pre-code': 'hsl(var(--foreground) / <alpha-value>)',
            '--tw-prose-invert-pre-bg': 'hsl(var(--muted) / <alpha-value>)',
            '--tw-prose-invert-th-borders': 'hsl(var(--border) / <alpha-value>)',
            '--tw-prose-invert-td-borders': 'hsl(var(--border) / <alpha-value>)',
            // Custom heading styles
            h1: {
              color: 'hsl(var(--foreground) / <alpha-value>)',
              fontFamily: 'var(--font-family-heading)',
            },
            h2: {
              color: 'hsl(var(--foreground) / <alpha-value>)',
              fontFamily: 'var(--font-family-heading)',
            },
            h3: {
              color: 'hsl(var(--foreground) / <alpha-value>)',
              fontFamily: 'var(--font-family-heading)',
            },
            h4: {
              color: 'hsl(var(--foreground) / <alpha-value>)',
              fontFamily: 'var(--font-family-heading)',
            },
            h5: {
              color: 'hsl(var(--foreground) / <alpha-value>)',
              fontFamily: 'var(--font-family-heading)',
            },
            h6: {
              color: 'hsl(var(--foreground))',
              fontFamily: 'var(--font-family-heading)',
            },
            p: {
              color: 'hsl(var(--foreground))',
              fontFamily: 'var(--font-family-body)',
            },
            a: {
              color: 'color-mix(in oklab, hsl(var(--primary)), black 15%)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            ul: {
              color: 'hsl(var(--contrast-500))',
              fontFamily: 'var(--font-family-body)',
            },
            ol: {
              color: 'hsl(var(--contrast-500))',
              fontFamily: 'var(--font-family-body)',
            },
            strong: {
              fontWeight: '600',
            },
            blockquote: {
              borderLeftColor: 'hsl(var(--contrast-300))',
              p: {
                color: 'hsl(var(--contrast-500))',
                fontStyle: 'normal',
                fontWeight: '400',
              },
            },
            code: {
              color: 'hsl(var(--contrast-500))',
              fontFamily: 'var(--font-family-mono)',
            },
            pre: {
              color: 'hsl(var(--background))',
              backgroundColor: 'hsl(var(--foreground))',
              fontFamily: 'var(--font-family-mono)',
            },
          },
        },
      },

      fontFamily: {
        heading: [
          'var(--font-family-heading)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-heading)',
            fontVariationSettings: 'var(--font-variation-settings-heading)',
          },
        ],
        body: [
          'var(--font-family-body)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-body)',
            fontVariationSettings: 'var(--font-variation-settings-body)',
          },
        ],
        mono: [
          'var(--font-family-mono)',
          {
            fontFeatureSettings: 'var(--font-feature-settings-mono)',
            fontVariationSettings: 'var(--font-variation-settings-mono)',
          },
        ],
        inter: ['Inter'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: 'var(--font-size-xl, 1.25rem)',
        '2xl': 'var(--font-size-2xl, 1.5rem)',
        '3xl': 'var(--font-size-3xl, 1.875rem)',
        '4xl': 'var(--font-size-4xl, 2.25rem)',
        '5xl': 'var(--font-size-5xl, 3rem)',
        '6xl': 'var(--font-size-6xl, 3.75rem)',
        '7xl': 'var(--font-size-7xl, 4.5rem)',
        '8xl': 'var(--font-size-8xl, 6rem)',
        '9xl': 'var(--font-size-9xl, 8rem)',
      },
      shadows: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      keyframes: {
        collapse: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        expand: {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'marching-ants': {
          to: {
            'background-position':
              '0 0, 0 -1px, calc(100% + 1px) 0, 100% calc(100% + 1px), -1px 100%',
          },
        },
        rotateFade: {
          from: { opacity: '1', transform: 'rotateZ(0deg) translate3d(-50%,-50%,0)' },
          '35%': { opacity: '0' },
          '70%': { opacity: '0' },
          to: { opacity: '1', transform: 'rotateZ(360deg) translate3d(-50%,-50%,0)' },
        },
        rotate: {
          from: {
            transform: 'rotateZ(0deg) translate3d(-50%,-50%,0)',
          },
          to: {
            transform: 'rotateZ(360deg) translate3d(-50%,-50%,0)',
          },
        },
        scroll: {
          to: { backgroundPosition: '5px 0' },
        },
        dotScrollSmall: {
          to: { backgroundPosition: '-6px -6px, -12px -12px' },
        },
        dotScrollLarge: {
          to: { backgroundPosition: '-8px -8px, -16px -16px' },
        },
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(1px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-2px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(2px, 0, 0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        collapse: 'collapse 400ms cubic-bezier(1, 0, 0.25, 1)',
        expand: 'expand 400ms cubic-bezier(1, 0, 0.25, 1)',
        marching: 'marching-ants 10s linear infinite',
        rotate: 'rotate 2000ms linear infinite',
        scroll: 'scroll 200ms infinite linear both',
        scrollLeft: 'scrollLeft var(--marquee-duration) linear infinite',
        shake: 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        slideIn: 'slideIn 800ms cubic-bezier(0.25, 1, 0, 1)',
      },
    },
  },
  plugins: [
    // @ts-ignore
    require('tailwindcss-radix')(),
    require('tailwindcss-animate'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
  ],
};

module.exports = config;
