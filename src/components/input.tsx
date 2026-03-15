// src/components/input.tsx
import clsx from "clsx"
import { forwardRef } from "react"
import { Text, TextInput, TextInputProps } from "react-native"

type Variants = "primary" | "secundary"

type InputProps = TextInputProps & {
	variant?: Variants
	errorMessage?: string
}

const Field = forwardRef<TextInput, InputProps>(
	({ className, variant = "secundary", errorMessage, multiline, ...rest }, ref) => {
		return (
			<>
				<TextInput
					ref={ref}
					placeholderTextColor="#2D2D2D"
					autoCorrect={false}
					spellCheck={false}
					autoCapitalize="none"
					keyboardType="default"
					underlineColorAndroid="transparent"
					multiline={multiline}
					textAlignVertical={multiline ? "top" : "center"}
					className={clsx(
						"border-2 bg-white text-gray-600 font-semiBold text-lg rounded-md px-4 focus:border-blue-500",
						multiline ? "min-h-[120px] py-3" : "h-16",
						{ "border-gray-400": !errorMessage },
						{ "border-red-400": errorMessage },
						className,
					)}
					{...rest}
				/>
				{errorMessage && <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>}
			</>
		)
	},
)

Field.displayName = "Field"

export { Field }
