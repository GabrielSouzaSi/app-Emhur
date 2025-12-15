import { Button } from "@/components/button"
import { HeaderBack } from "@/components/headerBack"
import { Field } from "@/components/input"
import { number } from "@/number"
import { useState } from "react"
import { FlatList, Pressable, Text, View } from "react-native"

const sorted = [...number].sort((a, b) => Number(a) - Number(b))

const data = sorted.map((item) => ({
	vehicle: item,
	status: false,
}))

const today = new Date()
const formattedDate = today.toLocaleDateString("pt-BR")

export default function VehicleChecklist() {
	const [vehicles, setVehicles] = useState(data)
	const [search, setSearch] = useState("")

	const filteredVehicles = vehicles.filter((v) =>
		v.vehicle.toLowerCase().includes(search.toLowerCase())
	)

	// Define o número de colunas dinamicamente com base no número de veículos ou largura da tela
	const numColumns = Math.min(3, vehicles.length) // até 3 colunas (ou você pode calcular com base na largura da tela)

	const toggleStatus = (index: number) => {
		const updated = [...vehicles]
		updated[index].status = !updated[index].status
		setVehicles(updated)
	}

	const handleSubmit = () => {
		const selected = vehicles.filter((v) => v.status)

		if (selected.length === 0) {
			alert("Nenhum veículo selecionado!")
			return
		}

		// Exibe no alerta
		alert(`Selecionados (${selected.length}):\n` + selected.map((v) => v.vehicle).join(", "))

		// 👉 Se quiser enviar para API, salvar local, ou navegar, faça aqui
		console.log("Selecionados:", selected)
	}

	return (
		<View className="flex-1 bg-white">
			<HeaderBack title={`Frequência ${formattedDate}`} variant="primary" />

			{/* Campo de busca */}
			<View className="p-4">
				<Field
					placeholder="Buscar veículo..."
					value={search}
					onChangeText={setSearch}
					keyboardType="number-pad"
				/>
			</View>

			<FlatList
				data={filteredVehicles}
				key={numColumns}
				numColumns={numColumns}
				keyExtractor={(_, index) => index.toString()}
				renderItem={({ item, index }) => (
					<Pressable
						onPress={() => toggleStatus(vehicles.indexOf(item))}
						style={{
							flex: 1,
							margin: 6,
							height: 60,
							borderRadius: 8,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: item.status ? "#2563eb" : "#e5e7eb",
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
				showsVerticalScrollIndicator={false}
			/>

			<View className="m-4">
				<Button variant="primary" onPress={handleSubmit}>
					<Button.TextButton title="Enviar" />
				</Button>
			</View>
		</View>
	)
}
