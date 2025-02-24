import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { useAuth } from "@/hooks/useAuth";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { server } from "@/server/api";
import { Field } from "@/components/input";
import { Loading } from "@/components/loading";
import { BlurView } from "expo-blur";
import colors from "tailwindcss/colors";

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
    <>
    <View>
      <HeaderBack title="Veículo" variant="primary" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex p-4">
          {/* Consultar veículo */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1">
              <Field
                variant="primary"
                placeholder="placa ou número"
                onChangeText={setNumero}
                onSubmitEditing={() => searchPlate(numero)}
                returnKeyType="send"
              />
            </View>
          </View>

          {/* Informações do veículo */}
          {vehicle?.id ? (
            <View>
              <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                Informações do Veículo:
              </Text>
              <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Placa:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.plate_number}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Marca:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.make}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Modelo:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.model}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Cor:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.color}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Ano:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.year}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Renavam:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {vehicle.renavam.slice(0, 3)}*****
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
          {/* Dados do Condutor/Infrator */}
          {permitHolder?.id ? (
            <View className="flex">
              <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                Dados do Permissionário:
              </Text>
              <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Nome:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {permitHolder.name}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      CPF:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {permitHolder.cpf.slice(0, 3)}*****
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      CNH:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {permitHolder.cnh.slice(0, 3)}*****
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
    </View>
      {isLoaded && <Loading /> }
    </>
  );
}
