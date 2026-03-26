import Constants from "expo-constants"
import { useRouter } from "expo-router"
import { FlatList, Text, View } from "react-native"

import { HeaderMenu } from "@/components/headerMenu"
import { MenuCard } from "@/components/menuCard"
import { useAuth } from "@/hooks/useAuth"
import { update } from "@/utils/configDataApp"

type MenuItemBase = {
	title: string
	icon: string
	route: string
	allow?: boolean
	empty?: false
}

type MenuItemEmpty = {
	empty: true
}

type MenuItem = MenuItemBase | MenuItemEmpty

export default function HomeFiscal() {
	const { can } = useAuth()
	const versao = Constants.expoConfig?.version || "Desconhecida"

	const router = useRouter()

	const COLUMNS = 2

	// 1) define o menu (com allow)
	const menuItems: MenuItemBase[] = [
		{
			title: "Autuações",
			icon: "shield-account-outline",
			route: "/(auth)/historicoAutuacoes",
			allow: can.hasTeam("DFT"),
		},
		{
			title: "Vistorias",
			icon: "checkbox-outline",
			route: "/(auth)/menuVistoria",
			allow: can.hasTeam("DFT"),
		},
		{
			title: "Veículo",
			icon: "car-outline",
			route: "/(auth)/veiculo",
			allow: can.hasTeam("DFT"),
		},
		{
			title: "Fisc. Fundiária",
			icon: "home-outline",
			route: "/(auth)/fiscalizacaoFundiaria",
			allow: can.hasTeam("GFF"),
		},
		{
			title: "Frequência",
			icon: "calendar-outline",
			route: "/(auth)/frequency",
			allow: can.hasTeam("DFT"),
		},
		// {
		// 	title: "Create Form",
		// 	icon: "pencil-ruler",
		// 	route: "/(auth)/formBuilder",
		// 	allow: can.hasAnyTeam(["DFT", "GFF"]),
		// },
	]

	// 2) filtra só o que pode ver
	const allowedMenu = menuItems.filter((item) => item.allow !== false)

	function isMenuItemBase(item: MenuItem): item is MenuItemBase {
		return !("empty" in item)
	}

	// 3) preenche o grid com espaços depois do filtro
	const fillMenu = (items: MenuItemBase[]): MenuItem[] => {
		const remainder = items.length % COLUMNS
		if (remainder === 0) return items

		const fillers: MenuItem[] = Array.from({ length: COLUMNS - remainder }, () => ({
			empty: true,
		}))

		return [...items, ...fillers]
	}

	return (
		<View className="flex-1">
			<HeaderMenu onUpdate={update} />

			<FlatList
				data={fillMenu(allowedMenu)}
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
