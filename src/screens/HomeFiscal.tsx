import { View } from "react-native";
import { HeaderMenu } from "@components/HeaderMenu";
import { MenuCard } from "@components/MenuCard";

export function HomeFiscal() {
  return (
    <View className="flex-1 bg-slate-50">
        <HeaderMenu />
        <View className="mt-4 flex flex-row justify-between px-2 ">
        <MenuCard title="Fiscalização" icon="UserCircle"/>
        <MenuCard title="Vistoria" icon="CheckSquare"/>
        <MenuCard title="Veículo" icon="Car"/>
        </View>
    </View>
  );
}
