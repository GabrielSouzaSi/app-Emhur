import { View } from "react-native";
import { useRouter } from "expo-router";
import { HeaderBack } from "@/components/headerBack";
import { MenuCardSmall } from "@/components/menuCard";

export default function MenuFiscalizacao() {
  const router = useRouter();
  return (
    <View className="">
      <HeaderBack title="Fiscal" variant="primary" />
      <View className="flex p-4">
        <MenuCardSmall
          onPress={() => router.push("/fiscal/credencial")}
          title="Credencial"
          variant="primary"
        />
        <MenuCardSmall
          onPress={() => router.push("/fiscal/historicoAutuacoes")}
          title="Autuações"
          variant="primary"
        />
        <MenuCardSmall
          onPress={() => router.push("/fiscal/escala")}
          title="Escala"
          variant="primary"
        />
      </View>
    </View>
  );
}
