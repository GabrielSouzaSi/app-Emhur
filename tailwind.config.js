//import  { colors } from "./src/styles/colors"
//import  { fontFamily } from "./src/styles/fontFamily"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: { 300: "#33beff", 400: "#00aeff", 500: "#008dd0" },
        green: { 300: "#2bee68", 400: "#11d44f", 500: "#0da63e" },
      },
      fontFamily: {
        regular: "Montserrat_400Regular",
        medium: "Montserrat_500Medium",
        semiBold: "Montserrat_600SemiBold",
        bold: "Montserrat_700Bold",
      },
    },
  },
  plugins: [],
};
