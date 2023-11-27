/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    keyframes: {
      textWave: {
        "0%, 100%": {
          clipPath:
            "polygon(0% 45%, 16% 44%, 33% 50%, 54% 60%, 70% 61%, 84% 59%, 100% 52%, 100% 100%, 0% 100%)",
        },
        "50%": {
          clipPath:
            "polygon(0% 60%, 15% 65%, 34% 66%, 51% 62%, 67% 50%, 84% 45%, 100% 46%, 100% 100%, 0% 100%)",
        },
      },
    },
    animation: {
      textWave: "textWave 4s ease-in-out infinite",
    },
    extend: {
      colors: {
        "w-green": "#00a884",
        "color-bg": "#0c2c34",
      },
      // backgroundColor: {

      // }
    },
  },
  plugins: [],
  important: true,
};
