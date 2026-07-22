import { DownloadIcon, RocketIcon, XIcon } from "phosphor-react-native"
import { ActivityIndicator, Linking, Modal, Pressable, Text, View } from "react-native"

type UpdateAppModalProps = {
	visible: boolean
	version?: string
	message?: string
	releaseNotes?: string[]
	storeUrl: string
	required?: boolean
	loading?: boolean
	onClose: () => void
}

export function UpdateAppModal({
	visible,
	version,
	message = "Uma nova versão do aplicativo está disponível.",
	releaseNotes,
	storeUrl,
	required = false,
	loading = false,
	onClose,
}: UpdateAppModalProps) {
	async function handleUpdate() {
		try {
			const supported = await Linking.canOpenURL(storeUrl)

			if (!supported) {
				console.warn("Não foi possível abrir a loja:", storeUrl)
				return
			}

			await Linking.openURL(storeUrl)
		} catch (error) {
			console.error("Erro ao abrir a Play Store:", error)
		}
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={() => {
				if (!required) {
					onClose()
				}
			}}
		>
			<View className="flex-1 items-center justify-center bg-black/60 px-6">
				<Pressable
					className="absolute inset-0"
					onPress={() => {
						if (!required) {
							onClose()
						}
					}}
				/>

				<View className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-lg">
					<View className="items-center bg-blue-600 px-6 pb-8 pt-7">
						{!required && (
							<Pressable
								onPress={onClose}
								className="absolute right-4 top-4 h-9 w-9 items-center justify-center rounded-full bg-white/20"
								hitSlop={10}
							>
								<XIcon size={20} color="#ffffff" />
							</Pressable>
						)}

						<View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-white/20">
							<RocketIcon size={42} color="#ffffff" />
						</View>

						<Text className="text-center text-2xl font-bold text-white">
							Nova versão disponível
						</Text>

						{version && (
							<View className="mt-2 rounded-full bg-white/20 px-4 py-1">
								<Text className="text-base font-semibold text-white">
									Versão {version}
								</Text>
							</View>
						)}
					</View>

					<View className="p-6">
						{/* <Text className="text-center text-base leading-6 text-zinc-600">
							{message}
						</Text> */}

						{required && (
							<View className="mt-4 rounded-xl bg-amber-50 px-4 py-3">
								<Text className="text-center text-sm font-medium text-amber-800">
									Esta atualização é obrigatória para continuar utilizando o
									aplicativo.
								</Text>
							</View>
						)}

						{releaseNotes && releaseNotes.length > 0 && (
							<View className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
								<Text className="text-xl font-semibold text-gray-800">
									Notas de atualização:
								</Text>
								{releaseNotes.map((note, index) => (
									<Text key={index} className="mt-1 text-lg text-gray-600">
										• {note}
									</Text>
								))}
							</View>
						)}

						<Pressable
							onPress={handleUpdate}
							disabled={loading}
							className={`mt-6 flex-row items-center justify-center rounded-2xl px-5 py-4 ${
								loading ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
							}`}
						>
							{loading ? (
								<ActivityIndicator color="#ffffff" />
							) : (
								<>
									<DownloadIcon size={21} color="#ffffff" />

									<Text className="ml-2 text-xl font-bold text-white">
										Atualizar agora
									</Text>
								</>
							)}
						</Pressable>

						{!required && (
							<Pressable
								onPress={onClose}
								className="mt-3 items-center justify-center rounded-2xl py-3"
							>
								<Text className="text-xl font-semibold text-zinc-500">
									Atualizar depois
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</View>
		</Modal>
	)
}
