//import  { colors } from "./src/styles/colors"
//import  { fontFamily } from "./src/styles/fontFamily"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./<custom directory>/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: "#008DD0",
        purple: "#7e5bef",
        pink: "#ff49db",
        orange: "#ff7849",
        green: "##0DA63E",
        yellow: "#ffc82c",
        "gray-dark": "#273444",
        gray: "#8492a6",
        "gray-light": "#d3dce6",
      },
      fontFamily: {
        regular: "Roboto_400Regular",
        bold: "Roboto_700Bold",
        medium: "Roboto_500Medium",
      },
    },
  },
  plugins: [],
};
