import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { cssInterop } from "nativewind";

import { useLocalSearchParams } from "expo-router";

import { HeaderBack } from "@/components/headerBack";
import { Loading } from "@/components/loading";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { server } from "@/server/api";

// Definimos um componente "Image" estilizado
const StyledImage = cssInterop(Image, {
  className: "style",
});

export default function IdAutuacao() {
  const { id } = useLocalSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [img , setImg] = useState([]);
  const [approach, setApproach] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>();


  async function getViolationCode() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/violation/show/${id}`);
      const { vehicle_id, violation } = data;

      const arr = JSON.parse(violation.attachments);
      setImg(arr)

      setApproach(data.violation.approach.name);
      setCode(
        `${data.violation.violation_code.code}:${data.violation.violation_code.description}`
      );
      setDescription(data.violation.description);
      setVehicle(vehicle_id);
      setPermitHolder(data.violation.permit_holder);
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    getViolationCode();
  }, []);
  return (
    <View>
      {/* Cabeçalho */}
      <HeaderBack title={`Autuação Nº `} variant="primary" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex p-4">
          {/* Numero da infração */}
          <View className="flex-row items-center mb-5"></View>

          {/* Veiculo */}
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
                      {vehicle?.plate_number}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Marca:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {vehicle?.make}
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
                      {vehicle?.model}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Cor:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {vehicle?.color}
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
                      {vehicle?.year}
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Renavam:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {vehicle?.renavam.slice(0, 3)}*****
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Dados do Condutor/Infrator */}
          <View className="flex">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
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
                      {permitHolder?.name}
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
                      {permitHolder?.cpf.slice(0, 3)}*****
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    CNH:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {permitHolder?.cnh.slice(0, 3)}*****
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Modo de abordagem */}
          <View className="">
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Modo de abordagem:
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{approach}</Text>
            </View>
          </View>

          {/* Dados da Infração */}
          <View className="flex">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Dados da Infração:
            </Text>

            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{code}</Text>
            </View>
          </View>

          {/* Observação */}
          <View className="flex mb-5">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Observação:
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{description}</Text>
            </View>
          </View>
          <View className="flex-1 justify-center items-center gap-4">
            <Text className="text-gray-500 font-regular text-2xl font-bold">
              Imagens:
            </Text>
            {img.map((item) => (
              <StyledImage
              key={item}
              source={{
                uri: `https://emhur.conexo.solutions/storage/${item}`,
              }} // URL da imagem
              className="w-3/4 h-40 md:w-full md:h-64" // Altura ajustada pela proporção desejada
              resizeMode="contain" // Ajusta o modo de redimensionamento para conter a imagem
            />
            ))}
          </View>
        </View>
      </ScrollView>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
