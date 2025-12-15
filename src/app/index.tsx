import { useRouter } from "expo-router"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"

import { useAuth } from "@/hooks/useAuth"

import { Button } from "@/components/button"
import { Field } from "@/components/input"
import { Loading } from "@/components/loading"
import Toast from "react-native-toast-message"

type FormData = {
	email: string
	password: string
}

export default function Login() {
	const router = useRouter()
	const { signIn } = useAuth()

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>()

	const [isLoading, setIsLoading] = useState(false)

	async function handleSignIn({ email, password }: FormData) {
		setIsLoading(true)
		try {
			await signIn(email.toLowerCase(), password)
			Toast.show({
				type: "success",
				text1: "Login realizado!",
				text2: "Bem-vindo ao AppFiscal!",
			})
		} catch (error) {
			console.log("Error =>", error)
			Toast.show({
				type: "error",
				text1: "Não foi possível fazer login",
				text2: "Verifique seus dados e tente novamente.",
			})
		} finally {
			Keyboard.dismiss()
			setIsLoading(false)
		}
	}

	return (
		<>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View className="px-8">
						<View className="items-center mb-4">
							<Image
								className="w-48 h-48"
								source={require("@/assets/adaptive-icon.png")}
							/>
						</View>

						<View>
							<Controller
								control={control}
								name="email"
								rules={{
									required: "Informe o e-mail, matrícula ou código!",
									// pattern: {
									//   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									//   message: "E-mail inválido",
									// },
								}}
								render={({ field: { onChange } }) => (
									<Field
										className={`${!!errors.email ? "border-red-500" : ""}`}
										placeholder="E-mail"
										onChangeText={onChange}
									/>
								)}
							/>

							{errors.email?.message && (
								<Text className="font-regular font-bold text-lg text-red-500">
									{errors.email.message}
								</Text>
							)}

							<Controller
								control={control}
								name="password"
								rules={{ required: "Informe a senha!" }}
								render={({ field: { onChange } }) => (
									<Field
										className={`mt-5 ${
											!!errors.password ? "border-red-500" : ""
										}`}
										placeholder="Senha"
										secureTextEntry
										textContentType="password"
										onChangeText={onChange}
										onSubmitEditing={() => handleSubmit(handleSignIn)}
										returnKeyType="send"
									/>
								)}
							/>
							{errors.password?.message && (
								<Text className="font-regular font-bold text-lg text-red-500">
									{errors.password.message}
								</Text>
							)}
						</View>

						<Pressable className="my-7 items-end">
							<Text className="font-regular font-bold text-base text-blue-500">
								Esqueceu a senha?
							</Text>
						</Pressable>

						<Button variant="primary" onPress={handleSubmit(handleSignIn)}>
							<Button.TextButton title="Entrar" />
						</Button>
					</View>
				</ScrollView>
				{isLoading && <Loading />}
			</KeyboardAvoidingView>
		</>
	)
}
