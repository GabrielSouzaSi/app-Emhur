import { View } from "react-native";
import { HeaderMenu } from "@components/HeaderMenu";
import { MenuCard } from "@components/MenuCard";

export function HomePermissionario() {
  return (
    <View className="flex-1 bg-slate-50">
        <HeaderMenu />
        <View className="mt-4 flex flex-row justify-between px-2">
        <MenuCard title="Alvará" icon="UserCircle"/>
        <MenuCard title="Serviços" icon="CheckSquare"/>
        <MenuCard title="Credencial" icon="Car"/>
        </View>
        <View className="mt-4 flex flex-row justify-between px-2">
        <MenuCard title="Agendamento" icon="UserCircle"/>
        </View>
    </View>
  );
}
