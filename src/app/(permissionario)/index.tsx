import { View } from "react-native";
import { HeaderMenu } from "@components/headerMenu";
import { MenuCard } from "@components/menuCard";
import { useRouter } from "expo-router";

export default function Permissionario() {
  const router = useRouter();

  return (
    <>
        <HeaderMenu/>
        <View className="mt-4 flex flex-row justify-between px-5">
        <MenuCard onPress={() => router.push("/(permissionario)/alvara")} title="Alvará" icon="file-check-outline"/>
        <MenuCard onPress={() => router.push("/(permissionario)/menuServicos")} title="Serviços" icon="view-grid-outline"/>
        <MenuCard onPress={() => router.push("/(permissionario)/credencial")} title="Credencial" icon="card-account-details-outline"/>
        </View>
    </>
  );
}
