import { Button } from "@/components/button"
import { HeaderBack } from "@/components/headerBack"
import { Field } from "@/components/input"
import { number } from "@/number"
import * as Haptics from "expo-haptics"
import { useMemo, useState } from "react"
import { FlatList, Keyboard, Modal, Pressable, Text, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import colors from "tailwindcss/colors"

type VehicleItem = { vehicle: string; status: boolean }

const sorted = [...number].sort((a, b) => Number(a) - Number(b))

const initialData: VehicleItem[] = sorted.map((item) => ({
	vehicle: String(item),
	status: false,
}))

const today = new Date()
const formattedDate = today.toLocaleDateString("pt-BR")

type TabKey = "pending" | "selected"

export default function VehicleChecklist() {
	const [vehicles, setVehicles] = useState<VehicleItem[]>(initialData)
	const [search, setSearch] = useState("")
	const [tab, setTab] = useState<TabKey>("pending")
	const [observations, setObservations] = useState("")
	const [modal, setModal] = useState(false)

	const toggleStatusByVehicle = (vehicleId: string) => {
		setVehicles((prev) =>
			prev.map((v) => (v.vehicle === vehicleId ? { ...v, status: !v.status } : v)),
		)
	}

	const { pendingCount, selectedCount } = useMemo(() => {
		let pending = 0
		let selected = 0
		for (const v of vehicles) {
			if (v.status) selected++
			else pending++
		}
		return { pendingCount: pending, selectedCount: selected }
	}, [vehicles])

	const filteredVehicles = useMemo(() => {
		const q = search.trim().toLowerCase()

		return vehicles
			.filter((v) => (tab === "selected" ? v.status : !v.status))
			.filter((v) => (q ? v.vehicle.toLowerCase().includes(q) : true))
	}, [vehicles, tab, search])

	const numColumns = Math.min(4, Math.max(1, filteredVehicles.length))

	const handleSubmit = () => {
		const selected = vehicles.filter((v) => v.status)

		if (selected.length === 0) {
			alert("Nenhum veículo selecionado!")
			return
		}

		alert(`Selecionados (${selected.length}):\n` + selected.map((v) => v.vehicle).join(", "))

		console.log("Selecionados:", selected)
	}

	return (
		<>
			<View className="flex-1 bg-white">
				<HeaderBack title={`Frequência ${formattedDate}`} variant="primary" />

				{/* Busca */}
				<View className="p-4">
					<Field
						placeholder="Buscar veículo..."
						value={search}
						onChangeText={setSearch}
						keyboardType="number-pad"
					/>
				</View>

				{/* Tabs */}
				<View className="px-4 pb-2">
					<View className="flex-row bg-slate-300 rounded-xl p-2">
						<Pressable
							onPress={() => setTab("pending")}
							style={{
								flex: 1,
								paddingVertical: 10,
								borderRadius: 10,
								alignItems: "center",
								backgroundColor:
									tab === "pending" ? colors.blue[600] : "transparent",
							}}
						>
							<Text
								style={{
									fontWeight: "700",
									color: tab === "pending" ? "#fff" : "#111827",
									fontSize: 16,
								}}
							>
								Pendentes ({pendingCount})
							</Text>
						</Pressable>

						<Pressable
							onPress={() => setTab("selected")}
							style={{
								flex: 1,
								paddingVertical: 10,
								borderRadius: 10,
								alignItems: "center",
								backgroundColor: tab === "selected" ? "#2563eb" : "transparent",
							}}
						>
							<Text
								style={{
									fontWeight: "700",
									color: tab === "selected" ? "#fff" : "#111827",
									fontSize: 16,
								}}
							>
								Selecionados ({selectedCount})
							</Text>
						</Pressable>
					</View>

					<Text style={{ marginTop: 8, color: "#6b7280" }}>
						Toque e segure para marcar/desmarcar.
					</Text>
				</View>

				<FlatList
					data={filteredVehicles}
					key={numColumns}
					numColumns={numColumns}
					keyExtractor={(item) => item.vehicle}
					renderItem={({ item }) => (
						<Pressable
							onLongPress={() => {
								toggleStatusByVehicle(item.vehicle)
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
							}}
							style={{
								flex: 1,
								margin: 6,
								height: 60,
								borderRadius: 8,
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: item.status ? "#2563eb" : "#cbd5e1",
							}}
						>
							<Text
								style={{
									fontWeight: "bold",
									color: item.status ? "#fff" : "#1f2937",
									fontSize: 16,
								}}
							>
								{item.vehicle}
							</Text>
						</Pressable>
					)}
					ListEmptyComponent={() => (
						<View style={{ padding: 24, alignItems: "center" }}>
							<Text style={{ color: "#6b7280" }}>Nenhum veículo nessa aba.</Text>
						</View>
					)}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 12 }}
				/>

				<View className="m-4 gap-3">
					<Button variant="primary" onPress={() => setModal(true)}>
						<Button.TextButton title="Observações" />
					</Button>
					<Button variant="primary" onPress={handleSubmit}>
						<Button.TextButton title="Enviar" />
					</Button>
				</View>
			</View>
			<Modal visible={modal} animationType="slide" transparent statusBarTranslucent>
				<View className="flex-1 bg-black/10 dark:bg-black/70">
					<Pressable
						className="flex-1"
						onPress={() => {
							Keyboard.dismiss()
							setModal(false)
						}}
					/>

					<KeyboardAwareScrollView
						enableOnAndroid
						keyboardOpeningTime={0}
						keyboardShouldPersistTaps="handled"
						extraScrollHeight={24}
						contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
					>
						{/* captura toque pra não “vazar” */}
						<Pressable onPress={() => {}}>
							<View className="flex-1 bg-gray-100 rounded-lg p-6 gap-4">
								<Field
									placeholder="Observações"
									value={observations}
									onChangeText={setObservations}
									multiline
								/>

								<View className="flex flex-row justify-between">
									<View className="flex-1 mr-2">
										<Button
											variant="primary"
											onPress={() => {
												Keyboard.dismiss()
												setModal(false)
											}}
										>
											<Button.TextButton title="Fechar" />
										</Button>
									</View>

									<View className="flex-1 ml-2">
										<Button
											variant="primary"
											onPress={() => {
												setObservations("")
											}}
										>
											<Button.TextButton title="Limpar" />
										</Button>
									</View>
								</View>
							</View>
						</Pressable>
					</KeyboardAwareScrollView>
				</View>
			</Modal>
		</>
	)
}
