import Constants from "expo-constants"
import { useRouter } from "expo-router"
import { FlatList, Text, View } from "react-native"

import { HeaderMenu } from "@/components/headerMenu"
import { MenuCard } from "@/components/menuCard"
import { UpdateAppModal } from "@/components/UpdateAppModal"
import { useAuth } from "@/hooks/useAuth"
import { checkUpdate, UpdateInfo } from "@/utils/checkUpdate"
import { update } from "@/utils/configDataApp"
import { useState } from "react"
import Toast from "react-native-toast-message"

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
			allow: can.hasAnyTeam(["GFF", "FF"]),
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

	const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
	const [modalVisible, setModalVisible] = useState(false)
	const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)

	async function handleCheckUpdate() {
		if (isCheckingUpdate) return

		try {
			setIsCheckingUpdate(true)

			Toast.show({
				type: "info",
				text1: "Verificando atualizações...",
			})

			const result = await checkUpdate()

			if (!result) {
				Toast.show({
					type: "error",
					text1: "Não foi possível verificar atualizações.",
					text2: "Verifique sua conexão e tente novamente.",
				})
				return
			}

			if (result.hasUpdate) {
				setUpdateInfo(result)
				setModalVisible(true)
				return
			}

			Toast.show({
				type: "success",
				text1: "Seu aplicativo está atualizado.",
				text2: `Versão instalada: ${result.currentVersion}`,
			})
		} catch (error) {
			console.error("Erro ao verificar atualização:", error)

			Toast.show({
				type: "error",
				text1: "Erro ao verificar atualização.",
			})
		} finally {
			setIsCheckingUpdate(false)
		}
	}

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
			<HeaderMenu onUpdate={update} onCheckUpdate={handleCheckUpdate} />

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

			<Text className="absolute bottom-2 left-4 text-base text-gray-500">{`V.: ${versao}`}</Text>

			{updateInfo && (
				<UpdateAppModal
					visible={modalVisible}
					version={updateInfo.latestVersion}
					message={updateInfo.message}
					releaseNotes={updateInfo.releaseNotes}
					storeUrl={updateInfo.storeUrl}
					required={updateInfo.required}
					onClose={() => setModalVisible(false)}
				/>
			)}
		</View>
	)
}
