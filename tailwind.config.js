import { colors } from "./src/styles/colors"

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			colors: colors,
			fontFamily: {
				regular: "Montserrat_400Regular",
				medium: "Montserrat_500Medium",
				semiBold: "Montserrat_600SemiBold",
				bold: "Montserrat_700Bold",
			},
		},
	},
	plugins: [],
}
