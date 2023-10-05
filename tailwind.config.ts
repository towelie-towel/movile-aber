import type { Config } from "tailwindcss";

export default {
  // Define your purge configuration to remove unused styles in production.
  // purge: [
  //   './src/**/*.js',
  //   './src/**/*.jsx',
  //   './src/**/*.ts',
  //   './src/**/*.tsx',
  // ],

  // Add any plugins or additional configurations specific to "nativewind".
  plugins: [],

  // Other Tailwind CSS configurations can go here.
  // For example, you can configure your colors, fonts, etc.
  theme: {
    extend: {},
  },
  variants: {},

  content: [],
} satisfies Config;
