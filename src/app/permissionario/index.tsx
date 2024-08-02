import { View } from "react-native";
import { HeaderMenu } from "@components/headerMenu";
import { MenuCard } from "@components/menuCard";

export default function Permissionario() {

  return (
    <>
        <HeaderMenu />
        <View className="mt-4 flex flex-row justify-between px-5">
        <MenuCard title="Alvará" icon="file-check-outline"/>
        <MenuCard title="Serviços" icon="view-grid-outline"/>
        <MenuCard title="Credencial" icon="card-account-details-outline"/>
        </View>
        <View className="mt-4 flex flex-row justify-between px-5">
        <MenuCard title="Agendamento" icon="calendar-outline"/>
        </View>
    </>
  );
}
