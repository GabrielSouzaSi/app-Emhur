import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { HeaderBack } from "@/components/headerBack";
import { MenuCardSmall, SubMenuCardSmall } from "@/components/menuCard";
import MenuItem from "@/components/subMenu";

export default function Alvara() {
  const router = useRouter();
  return (
    <View>
      <HeaderBack title="Alvará" />
      <View className="flex p-4">
        <MenuItem item={3} title="Notificações e Prazos">
          <SubMenuCardSmall
            onPress={() => router.push("/permissionario/historicoAutuacoes")}
            title="Autuações"
          />
          <SubMenuCardSmall
            onPress={() => router.push("/permissionario/consultarRecurso")}
            title="Consultar Recurso"
          />
          <SubMenuCardSmall
            onPress={() => router.push("/permissionario/cadastrarRecurso")}
            title="Cadastrar Recurso"
          />
        </MenuItem>
      </View>
    </View>
  );
}
