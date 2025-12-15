import { colors } from "@/styles/colors"
import clsx from "clsx"
import { MagnifyingGlassIcon } from "phosphor-react-native"
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native"

type InputProps = TextInputProps & {
	errorMessage?: string
	onSearch?: () => void
}

function Search({ className, errorMessage, onSearch, ...rest }: InputProps) {
	return (
		<>
			<View
				className={clsx(
					"flex flex-row items-center h-16 border-2 bg-white rounded-md px-4 focus:border-blue-500",
					{ "border-gray-400": !errorMessage },
					{ "border-red-400": errorMessage },
					className
				)}
			>
				<TextInput
					placeholderTextColor="#2D2D2D"
					autoCorrect={false}
					spellCheck={false}
					autoCapitalize="none"
					textBreakStrategy="simple"
					importantForAutofill="no"
					keyboardType="default"
					underlineColorAndroid="transparent"
					className="flex-1 font-semiBold text-lg"
					{...rest}
				/>
				<TouchableOpacity onPress={onSearch}>
					<MagnifyingGlassIcon size={30} color={colors.blue[700]} weight="bold" />
				</TouchableOpacity>
			</View>
			{errorMessage && <Text className="text-red-500 mt-1 ml-1">{errorMessage}</Text>}
		</>
	)
}

export { Search }
