import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image
} from "react-native";
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


export default function IdInspection() {
  const { id } = useLocalSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [img , setImg] = useState([]);
  // Condutor
  const [condutor, setCondutor] = useState<any>(false);
  const [advertising, setAdvertising] = useState("");
  const [description, setDescription] = useState("");

  async function getInspectionID() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/inspection/show/${id}`);
      setVehicle(data.inspection.permit.vehicle);
      setCondutor(data.inspection.permit.holder);
      setAdvertising(data.inspection.advertising);
      setDescription(data.inspection.final_observations);
      const arr = JSON.parse(data.inspection.attachments);            
      setImg(arr)
    } catch (error) {
      throw error;
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    getInspectionID();        
  }, []);
  return (
    <View>
      {/* Cabeçalho */}
      <HeaderBack title={`Vistoria Nº `} variant="primary" />
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

          {/* Condutor/Permissionário */}
          {condutor.attorney_id ? (
              <View className="flex">
                <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                  Condutor/Permissionário:
                </Text>
                <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        Nome:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.name}
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
                          {condutor.cpf}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                        VALIDADE CNH:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.validade_cnh}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex flex-row justify-between mb-4 gap-4">
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Categoria:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.categoria}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-regular text-2xl font-bold">
                      CNH:
                      </Text>
                      <View className="bg-gray-300 rounded-md p-3">
                        <Text className="font-semiBold text-lg">
                          {condutor.cnh}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              ""
            )}

          {/* Motivo da Vistoria */}
          <View className="">
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Motivo da Vistoria:
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">Renovação de Alvará</Text>
            </View>
          </View>

          {/* Local da Vistoria */}
          <View className="flex">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Local da Vistoria:
            </Text>

            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">Emhur</Text>
            </View>
          </View>

          {/* Anúncio/Propaganda */}
          <View className="flex mb-5">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
            Anúncio/Propaganda:
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{advertising}</Text>
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
            )) }
          </View>
        </View>
      </ScrollView>
      {isLoaded ? <Loading /> : ""}
    </View>
  );
}
