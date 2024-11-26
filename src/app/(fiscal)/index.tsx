import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HeaderMenu } from "@/components/headerMenu";
import { MenuCard } from "@/components/menuCard";

export default function HomeFiscal() {
  const router = useRouter();
  return (
    <>
      <HeaderMenu />
      <View className="flex flex-row justify-between px-5 ">
        <MenuCard
          onPress={() => router.push("/menuFiscalizacao")}
          title="Fiscalização"
          icon="shield-account-outline"
          variant="primary"
        />
        <MenuCard
          onPress={() => router.push("/menuVistoria")}
          title="Vistoria"
          icon="checkbox-outline"
          variant="primary"
        />
        <MenuCard
          onPress={() => router.push("/veiculo")}
          title="Veículo"
          icon="car-outline"
          variant="primary"
        />
      </View>
    </>
  );
}
