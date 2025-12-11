import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";

import { useLocalSearchParams } from "expo-router";

import { HeaderBack } from "@/components/headerBack";
import { LoadingLight, LoadingTop } from "@/components/loading";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { server } from "@/server/api";

type ViolationCode = {
  code: string;
  description: string;
};

export default function IdAutuacao() {
  const { id } = useLocalSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [img, setImg] = useState([]);
  const [approach, setApproach] = useState<any>();
  const [description, setDescription] = useState("");
  const [signatureBase64, setSignatureBase64] = useState("");
  const [code, setCode] = useState<ViolationCode[]>([]);
  const [permitHolder, setPermitHolder] = useState<any>();
  const [loading, setLoading] = useState({}); // controla loading individual

  function handleLoadStart(uri) {
    setLoading((prev) => ({ ...prev, [uri]: true }));
  }

  function handleLoadEnd(uri) {
    setLoading((prev) => ({ ...prev, [uri]: false }));
  }

  async function getViolationCode() {
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/violation/show/${id}`);
      const { vehicle_id, violation, violationCodes } = data;

      setPermitHolder(violation);
      setVehicle(vehicle_id);

      const arr = JSON.parse(violation.attachments);
      setImg(arr);

      setApproach(violation.approach);
      setCode(violationCodes);
      setSignatureBase64(violation.signature_base64);
      setDescription(violation.description);
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
      <HeaderBack
        title={`Autuação Nº ${permitHolder?.auto_number || ""}`}
        variant="primary"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex px-4">
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
                      {permitHolder?.permit_holder.name}
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
                      {permitHolder?.permit_holder.cpf.slice(0, 3)}*****
                    </Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    CNH:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">
                      {permitHolder?.permit_holder.cnh.slice(0, 3)}*****
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Dados do Condutor */}
          {permitHolder?.driver && (
            <View className="flex">
              <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
                Dados do Condutor:
              </Text>
              <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                <View className="flex flex-row justify-between mb-4 gap-4">
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      Nome:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {permitHolder?.driver}
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
                        {permitHolder?.cpf_driver.slice(0, 3)}*****
                      </Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 font-regular text-2xl font-bold">
                      CNH:
                    </Text>
                    <View className="bg-gray-300 rounded-md p-3">
                      <Text className="font-semiBold text-lg">
                        {permitHolder?.cnh_driver.slice(0, 3)}*****
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Modo de abordagem */}
          <View>
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Modo de abordagem:
            </Text>
            <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{approach?.name}</Text>
            </View>
          </View>

          {/* Dados da Infração */}
          <View>
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Infrações:{` (${code?.length})`}
            </Text>
            <View className="">
              {code?.map((item, index) => (
                <View
                  key={index}
                  className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4"
                >
                  <Text className="font-semiBold text-lg">{`0${index + 1} - ${
                    item.code
                  }: ${item.description} `}</Text>
                </View>
              ))}
            </View>

            {/* <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
              <Text className="font-semiBold text-lg">{code}</Text>
            </View> */}
          </View>
          {signatureBase64 && (
            <View className="flex-1 justify-center items-center gap-4 mt-3">
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Assinatura:
              </Text>
              <Image
                source={{
                  uri: signatureBase64,
                }} // URL da imagem
                className="w-3/4 h-40 md:w-full md:h-64" // Altura ajustada pela proporção desejada
                resizeMode="contain" // Ajusta o modo de redimensionamento para conter a imagem
              />
            </View>
          )}

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
            {img.map((item) => {
              const uri = `https://emhur.conexo.solutions/storage/${item}`;

              return (
                <View
                  key={item}
                  className="w-full h-64 items-center justify-center"
                >
                  {loading[uri] && <LoadingLight />}

                  <Image
                    source={{ uri }}
                    className="w-full h-64"
                    resizeMode="contain"
                    onLoadStart={() => handleLoadStart(uri)}
                    onLoadEnd={() => handleLoadEnd(uri)}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {isLoaded ? <LoadingTop /> : <></>}
    </View>
  );
}
