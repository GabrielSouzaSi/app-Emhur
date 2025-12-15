import { MaterialCommunityIcons } from "@expo/vector-icons"
import clsx from "clsx"
import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native"

type Variants = "primary" | "secundary"

type Props = TouchableOpacityProps & {
	title: string
	icon?: keyof typeof MaterialCommunityIcons.glyphMap
	variant?: Variants
}

const MenuCard = ({ title, icon, variant = "secundary", className, ...rest }: Props) => {
	return (
		<TouchableOpacity
			className={clsx(
				"bg-white py-5 border-l-4 shadow-slate-800 rounded-md items-center justify-center flex-1 m-2",
				{ "border-blue-500": variant === "primary" },
				{ "border-green-500": variant === "secundary" },
				className
			)}
			style={{ elevation: 2 }}
			{...rest}
		>
			<MaterialCommunityIcons
				name={icon}
				size={30}
				color={variant === "primary" ? "#3b82f6" : "#0da63e"}
			/>
			<Text
				className={clsx(
					"font-regular font-bold text-base",
					{ "text-blue-500": variant == "primary" },
					{ "text-green-500": variant == "secundary" }
				)}
			>
				{title}
			</Text>
		</TouchableOpacity>
	)
}

export { MenuCard }
