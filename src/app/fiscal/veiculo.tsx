import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  View,
} from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { useAuth } from "@/hooks/useAuth";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { server } from "@/server/api";
import { Field } from "@/components/input";
import { Loading } from "@/components/loading";
import { BlurView } from "expo-blur";
import colors from "tailwindcss/colors";
import { Search } from "@/components/search";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Holder } from "@/components/Holder";

export default function Veiculo() {
  const [isLoaded, setIsLoaded] = useState(false);

  const { user } = useAuth();

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [numero, setNumero] = useState("");
  // Dados do Condutor/Infrator
  const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>();

  // Buscar veículo
  async function searchPlate(req: any) {
    Keyboard.dismiss();
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/${req}`);
      console.log(data);

      const { permit_holder_id, vehicle_id } = data;
      setVehicle(vehicle_id);
      setPermitHolder(permit_holder_id);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  return (
    <>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={40}
        keyboardOpeningTime={0}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeaderBack title="Veículo" variant="primary" />

        <View className="flex p-4">
          {/* Consultar veículo */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Search
                placeholder="placa ou número"
                onChangeText={setNumero}
                onSubmitEditing={() => searchPlate(numero)}
                value={numero}
                returnKeyType="send"
                keyboardType="numeric"
                onSearch={() => searchPlate(numero)}
              />
            </View>
          </View>

          {/* Permissionário */}
          <Holder permitHolder={permitHolder} vehicle={vehicle} />
        </View>

        {isLoaded && <Loading />}
      </KeyboardAwareScrollView>
    </>
  );
}
