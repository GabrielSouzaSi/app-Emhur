import { View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { MenuCardSmall } from "@/components/menuCard";

export default function MenuServicos() {
  return (
    <View>
      <HeaderBack
        title="Serviços"
      />
      <View className="flex p-4">
        <MenuCardSmall title="Devolução de Alvará" />
        <MenuCardSmall title="Processos" />
        <MenuCardSmall title="Transferência de Alvará" />
        <MenuCardSmall title="Agendamento" />
        <MenuCardSmall title="Histórico de Alvará Táxi/Lotação" />
      </View>
    </View>
  );
}
