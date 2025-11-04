/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./medios-de-pago.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./data.yml"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
}
