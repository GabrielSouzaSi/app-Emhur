import { colors } from "./src/styles/colors"

module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors,
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
