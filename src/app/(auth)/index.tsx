import Constants from "expo-constants"
import { useRouter } from "expo-router"
import { FlatList, Text, View } from "react-native"

import { HeaderMenu } from "@/components/headerMenu"
import { MenuCard } from "@/components/menuCard"
import { update } from "@/utils/configDataApp"

type ViolationCode = {
	id: number
	code: string
	description: string
}

type MenuItemBase = {
	title: string
	icon: string
	route: string
	empty?: false
}

type MenuItemEmpty = {
	empty: true
}

type MenuItem = MenuItemBase | MenuItemEmpty

export default function HomeFiscal() {
	const versao = Constants.expoConfig?.version || "Desconhecida"

	const router = useRouter()

	const menuItems: MenuItem[] = [
		{
			title: "Autuações",
			icon: "shield-account-outline",
			route: "/(auth)/historicoAutuacoes",
		},
		{
			title: "Vistorias",
			icon: "checkbox-outline",
			route: "/(auth)/menuVistoria",
		},
		{
			title: "Veículo",
			icon: "car-outline",
			route: "/(auth)/veiculo",
		},
		{
			title: "Fisc. Fundiária",
			icon: "home-outline",
			route: "/(auth)/fiscalizacaoFundiaria",
		},
		{
			title: "Frequência",
			icon: "calendar-outline",
			route: "/(auth)/frequency",
		},
	]

	function isMenuItemBase(item: MenuItem): item is MenuItemBase {
		return !("empty" in item)
	}

	// Preenche a lista com espaços em branco
	const COLUMNS = 2

	const fillMenu = (): MenuItem[] => {
		const remainder = menuItems.length % COLUMNS
		if (remainder === 0) return menuItems

		const fillers: MenuItem[] = Array.from({ length: COLUMNS - remainder }, () => ({
			empty: true,
		}))

		return [...menuItems, ...fillers]
	}

	return (
		<View className="flex-1">
			<HeaderMenu onUpdate={update} />

			<FlatList
				data={fillMenu()}
				numColumns={COLUMNS}
				keyExtractor={(_, index) => index.toString()}
				contentContainerStyle={{ paddingHorizontal: 20 }}
				columnWrapperStyle={{
					justifyContent: "space-between",
					marginBottom: 16,
				}}
				renderItem={({ item }) =>
					isMenuItemBase(item) ? (
						<MenuCard
							onPress={() => router.push(item.route as any)}
							title={item.title}
							icon={item.icon as any}
							variant="primary"
						/>
					) : (
						<View className="flex-1 bg-transparent py-5 m-2" />
					)
				}
			/>
			<Text className="absolute bottom-2 left-4 text-sm text-gray-500">{`V.: ${versao}`}</Text>
		</View>
	)
}
