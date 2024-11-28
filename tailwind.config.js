import { colors } from "./src/styles/colors"

module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {
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
    },
    plugins: [],
  }