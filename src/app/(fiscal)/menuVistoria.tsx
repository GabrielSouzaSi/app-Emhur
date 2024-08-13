import { View } from "react-native";
import { useRouter } from "expo-router";
import { HeaderBack } from "@/components/headerBack";
import { MenuCardSmall } from "@/components/menuCard";

export default function MenuVistoria() {
  const router = useRouter();
  return (
    <View className="">
      <HeaderBack
        title="Vistoria"
        variant="primary"
      />
      <View className="flex p-4">
        <MenuCardSmall onPress={() => router.push("/vistoria")} title="Cadastrar" variant="primary" />
        <MenuCardSmall onPress={() => router.push("/consultarVistoria")} title="Consultar" variant="primary" />
      </View>
    </View>
  );
}
