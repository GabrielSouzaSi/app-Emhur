import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { server } from "@/server/api";
import { Field } from "@/components/input";
import { Loading } from "@/components/loading";
import { Button } from "@/components/button";

export default function Veiculo() {
  const [isLoaded, setIsLoaded] = useState(false);

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [numero, setNumero] = useState("");
  // Dados do Condutor/Infrator
  const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>();

  // Buscar recurso
  async function searchPlate(req: any) {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/${req}`);
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
    <View className="flex-1">
      <HeaderBack title="Cadastrar Recurso" variant="secundary" />
      <View className="p-5 gap-4">
        <Text className="text-gray-500 font-regular text-lg font-bold">
          N° da Autuação:
        </Text>
        <Field
          variant="secundary"
          placeholder="número"
          onChangeText={setNumero}
          onSubmitEditing={() => searchPlate(numero)}
          returnKeyType="send"
        />
        <Text className="text-gray-500 font-regular text-lg font-bold">
          N° do Carro:
        </Text>
        <Field
          variant="secundary"
          placeholder="número"
          onChangeText={setNumero}
          returnKeyType="send"
        />
        <Text className="text-gray-500 font-regular text-lg font-bold">
          Data:
        </Text>
        <Field
          className="w-1/2"
          variant="secundary"
          placeholder="Data da infração"
          onChangeText={setNumero}
          returnKeyType="send"
        />
        <Text className="text-gray-500 font-regular text-lg font-bold">
          Descrição:
        </Text>
        <Field
          variant="secundary"
          placeholder="Descrição"
          onChangeText={setNumero}
          returnKeyType="send"
        />
        <Button variant="secundary">
          <Button.TextButton title="Anexar arquivos" />
        </Button>
        <Button variant="secundary">
          <Button.TextButton title="Cadastrar" />
        </Button>
      </View>
      {isLoaded && <Loading />}
    </View>
  );
}
