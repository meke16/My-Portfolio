
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // If you are using non-standard utility classes (like bg-linear-to-r)
      // you might need a custom plugin or to configure them here.
    },
  },
  plugins: [],
}
