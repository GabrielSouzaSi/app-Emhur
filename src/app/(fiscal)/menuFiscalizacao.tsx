import { View } from "react-native";
import { useRouter } from "expo-router";
import { HeaderBack } from "@/components/headerBack";
import { MenuCardSmall } from "@/components/menuCard";

export default function Fiscalizacao() {
  const router = useRouter();
  return (
    <View className="">
      <HeaderBack
        title="Fiscal"
        variant="primary"
      />
      <View className="flex p-4">
        <MenuCardSmall title="Credencial" variant="primary" />
        <MenuCardSmall
          onPress={() => router.push("/(fiscal)/autuacoes")}
          title="Autuações"
          variant="primary"
        />
        <MenuCardSmall title="Consultar" variant="primary" />
        <MenuCardSmall title="Escala" variant="primary" />
      </View>
    </View>
  );
}
