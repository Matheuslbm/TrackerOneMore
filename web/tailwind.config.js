/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Já vamos deixar as cores do seu design preparadas
        background: '#121212',
        card: '#1E1E1E',
        primary: '#FF5722', // O laranja do foguinho
        success: '#4CAF50', // O verde dos hábitos feitos
        grace: '#9C27B0',   // O roxo do grace day
      }
    },
  },
  plugins: [],
}