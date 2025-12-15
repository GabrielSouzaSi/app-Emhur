import clsx from "clsx"
import { Text, TextInput, TextInputProps } from "react-native"

type Variants = "primary" | "secundary"

type InputProps = TextInputProps & {
	variant?: Variants
	errorMessage?: string
}

function Field({ className, variant = "secundary", errorMessage, ...rest }: InputProps) {
	return (
		<>
			<TextInput
				placeholderTextColor="#2D2D2D" // gray-400
				autoCorrect={false}
				spellCheck={false}
				autoCapitalize="none"
				keyboardType="default"
				underlineColorAndroid="transparent"
				className={clsx(
					"h-16 border-2 bg-white text-gray-600 font-semiBold text-lg rounded-md px-4 focus:border-blue-500",
					{ "border-gray-400": !errorMessage },
					{ "border-red-400": errorMessage },
					className
				)}
				{...rest}
			/>
			{errorMessage && <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>}
		</>
	)
}

export { Field }
