import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

import { useAuth } from "@/hooks/useAuth";

import { HeaderBack } from "@/components/headerBack";
import { Field } from "@/components/input";
import { Button } from "@/components/button";
import { server } from "@/server/api";
import { Loading } from "@/components/loading";
import { InspectionItem } from "@/components/inspectionItem";
import { DropdownButton } from "@/components/buttonDropdown";
import { VehicleDTO } from "@/dtos/vehicleDTO";
import { PermitHolderDTO } from "@/dtos/permitHolderDTO";
import { InspectionItemDTO } from "@/dtos/inspectionItemDTO";
import { Modal } from "@/components/modal";
import axios from "axios";
import { string } from "yup";

enum MODAL {
  NONE = 0,
  IMAGENS = 1,
  VISTORIA = 2,
  LOCAIS = 3,
}

type Locations = {
  id: number;
  name: string;
};

export default function Vistoria() {
  const [isLoaded, setIsLoaded] = useState(false);

  const { user } = useAuth();

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [numero, setNumero] = useState("");
  // Dados do Condutor/Infrator
  const [permitHolder, setPermitHolder] = useState<PermitHolderDTO>();
  // Motivos da vistoria
  const [inspectionOptions, setInspectionOptions] = useState([]);
  const [inspectionReason, setInspectionReason] = useState<number>();
  // Formulário da vistoria
  const [formData, setFormData] = useState<any>();
  // Locais
  const [listLocations, setListLocations] = useState([]);
  const [locations, setLocations] = useState<any>();
  // Propaganda
  const [advertising, setAdvertising] = useState("");
  // Obserções
  const [obs, setObs] = useState("");

  // Itens da vitoria
  const [inspectionItems, setInspectionItems] = useState<InspectionItemDTO[]>();

  // Imagens
  const [imagens, setImagens] = useState<ImagePicker.ImagePickerResult[] | any>(
    []
  );

  // Modal
  const [modal, setModal] = useState(MODAL.NONE);

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

  // Função para buscar a lista do motivo da vistoria
  async function getInspectionReasons() {
    try {
      const { data } = await server.get("/inspection-reasons");
      let result = data.map((data: any) => {
        return {
          label: data.name,
          value: data.id,
        };
      });
      setInspectionOptions(result);
    } catch (error) {
      console.log(error);
    }
  }

  // Função para buscar a lista dos locais da vistoria
  async function getListLocations() {
    try {
      const { data } = await server.get("/inspection-locations");
      let result = data.map((data: any) => {
        return {
          label: data.name,
          value: data.id,
        };
      });
      setListLocations(result);
    } catch (error) {
      console.log(error);
    }
  }
  // Função para listar os itens da vistoria
  async function inspectionReasonsItems(id: number) {
    setInspectionReason(id);
    try {
      const { data } = await server.get(`inspection-reasons/${id}/items`);
      let result = await data.map((data: InspectionItemDTO) => {
        return {
          id: data.id,
          item: data.item,
          description: data.description,
          info: "",
          status: "",
          exists: false,
        };
      });
      setInspectionItems(result);
    } catch (error) {
      console.log(error);
    }
  }

  // Função recebe os dados da vistoria selecionada
  function onSelectInspection(item: any) {
    inspectionReasonsItems(Number(item.value));
  }

  // Função recebe os dados do local selecionado
  function onSelectLocation(item: any) {
    console.log(item);
    setLocations(item);
  }

  // Função recebe os dados do item da vistoria
  function onInspectionItem(item: InspectionItemDTO) {
    const result = inspectionItems?.map((data) => {
      if (data.id == item.id) {
        return {
          [item.id]: {
            exists: item.exists,
            additional_info: item.info,
            status: item.status,
          },
        };
      } else {
        return {
          [data.id]: {
            exists: data.exists,
            additional_info: data.info,
            status: data.status,
          },
        };
      }
    });
    console.log(result);

    const formattedData = result.reduce((acc, currentItem) => {
      const [key, value] = Object.entries(currentItem)[0];

      acc[key] = {
        ...value
      };

      return acc;
    }, {});

    console.log(formattedData);
    

    setFormData(result);
  }

  // Função para ter acesso a galeria de imagens
  const askPermission = async (failureMessage: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === "denied") {
      alert(failureMessage);
    }
  };

  // Funação para ter acesso a camera
  const askCameraPermission = async () => {
    // Solicitar permissão para usar a câmera
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    // Solicitar permissão para salvar a imagem no álbum
    const { status: mediaLibraryStatus } =
      await MediaLibrary.requestPermissionsAsync();
    if (cameraStatus !== "granted" || mediaLibraryStatus !== "granted") {
      alert(
        "Desculpe, precisamos das permissões da câmera e do álbum para isso funcionar!"
      );
      return;
    }
  };

  // Função para tirar foto
  const takePhoto = async () => {
    await askCameraPermission();
    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      let img = {
        uri: pickerResult.assets[0].uri,
        name: new Date().getTime() + ".jpeg",
        type: "image/jpeg",
      };
      setImagens([...imagens, img]);
    }
  };

  // Função para selecinar imagem da galeria
  const pickImage = async () => {
    await askPermission(
      "Precisamos da permissão do rolo da câmera para ler as fotos do seu telefone..."
    );

    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 2],
      quality: 1,
    });
    // console.log(pickerResult);

    if (!pickerResult.canceled) {
      let img = {
        uri: pickerResult.assets[0].uri,
        name: new Date().getTime() + ".jpeg",
        type: "image/jpeg",
      };
      setImagens([...imagens, img]);
    }
  };

  // Função para remover imagem
  const removerImagem = (index: number) => {
    let upImagens = [...imagens.slice(0, index), ...imagens.slice(index + 1)];

    setImagens(upImagens);

    if (imagens.length <= 1) setModal(MODAL.NONE);
  };

  async function postInspection() {
    let currentdate = new Date();
    let date =
      +currentdate.getFullYear() +
      "-" +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getDate();

    let time =
      currentdate.getHours() +
      ":" +
      currentdate.getMinutes() +
      ":" +
      currentdate.getSeconds();

    // const formData = new FormData();
    // formData.append("permit_id", `${user.id}`);
    // formData.append("permit_holder_id", `${permitHolder?.id}`);
    // formData.append("vehicle_id", `${vehicle?.id}`);
    // formData.append("user_id", `${permitHolder?.id}`);
    // formData.append("inspection_location_id", `${locations?.value}`);
    // formData.append("inspection_reason_id", `${inspectionReason}`); //motivo da vistoria
    // formData.append("auto_number", `${user.id + 100}`);
    // formData.append("inspection_date", `${date}`);
    // formData.append("inspection_time", `${time}`);
    // formData.append("advertising", ``);
    // formData.append("final_observations", ``);
    // formData.append("inspection_items", ``);
    // formData.append("inspection_result", ``);
    // formData.append("attachments", ``);
    // imagens.forEach((image: any, index: number) => {
    //   formData.append("attachments[]", {
    //     ...image,
    //     uri: image.uri,
    //     name: `image_${index}.jpg`,
    //     type: "image/jpeg",
    //   } as any);
    // });
    // console.log(formData);
    // let item = [{"1":{"exists":"1","additional_info":"teste","status":"inapto"},"2":{"exists":"1","additional_info":"teste","status":"apto"}}]
    let data = new FormData();
    data.append("permit_id", `1`);
    data.append("permit_holder_id", `${permitHolder?.id}`);
    data.append("vehicle_id", `${vehicle?.id}`);
    data.append("user_id", `${user.id}`);
    data.append("inspection_location_id", `${locations.value}`);
    data.append("inspection_reason_id", `${inspectionReason}`);
    data.append("auto_number", `20423`);
    data.append("inspection_date", `${date}`);
    data.append("inspection_time", `${time}`);
    data.append("advertising", `${advertising}`);
    data.append("final_observations", `${obs}`);
    data.append("inspection_items", formData);
    data.append("inspection_result", "");
    imagens.forEach((image: any, index: number) => {
      data.append("attachments[]", {
        ...image,
        uri: image.uri,
        name: `image_${index}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const config = {     
      method: "post",
      maxBodyLength: Infinity, // React Native pode não precisar disso, depende do tamanho da requisição
      url: "http://appbus.conexo.solutions:8990/api/v1/inspections",
      headers: {
        Authorization:
          "9|cbLtIGqakUSTyBxe4bn9n6W72TisZhI2jBIsHeZz142b88ba",
        "Content-Type": "multipart/form-data", // Definir o tipo de conteúdo
      },
      data: data,
    };

    // try {
    //   const response = await axios.request(config);
    //   console.log(JSON.stringify(response.data)); // Exibe a resposta no console
    //   Alert.alert("Success", "Vistoria enviado com sucesso!");
    // } catch (error) {
    //   console.error(error); // Exibe o erro no console
    //   Alert.alert("Error", "Failed to submit inspection");
    // }

    try {
      setIsLoaded(true);
      await server.postForm(`/inspections`, data);
      Alert.alert("Sucesso", "Vistoria enviado com sucesso!");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoaded(false);
    }
  }

  useEffect(() => {
    getInspectionReasons();
    getListLocations();
  }, []);

  return (
    <View>
      <HeaderBack title="Cadastrar Vistoria" variant="primary" />
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

          {permitHolder?.id ? (
            <>
              <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                Motivo da Vistoria
              </Text>
              <DropdownButton
                data={inspectionOptions}
                onSelect={onSelectInspection}
                placeholder="Motivo da Vistoria"
              />
              <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                Local da Vistoria
              </Text>
              <DropdownButton
                data={listLocations}
                onSelect={onSelectLocation}
                placeholder="Local da Vistoria"
              />

              <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
                Itens da Vistoria
              </Text>

              {inspectionItems?.map((item, index) => (
                <InspectionItem
                  key={index}
                  item={item}
                  onInspectData={onInspectionItem}
                />
              ))}

              {/* Imagens do Veiculo */}
              <View className="flex flex-row justify-between mb-4">
                <View className="flex-1 mr-2">
                  <Button variant="primary" onPress={() => takePhoto()}>
                    <Button.TextButton title="Tirar foto" />
                  </Button>
                </View>
                <View className="flex-1 ml-2">
                  <Button variant="primary" onPress={() => pickImage()}>
                    <Button.TextButton title="Abrir galeria" />
                  </Button>
                </View>
              </View>
              {/* Se houver imagem */}
              {imagens.length ? (
                <Button
                  variant="primary"
                  onPress={() => setModal(MODAL.IMAGENS)}
                >
                  <Button.TextButton title={`Imagens(${imagens.length})`} />
                </Button>
              ) : (
                <></>
              )}
              <Field
                className="my-4"
                variant="primary"
                placeholder="Anúncio/Propaganda"
                onChangeText={setAdvertising}
                value={advertising}
              />
              <Field
                className="my-4"
                variant="primary"
                placeholder="Observação"
                onChangeText={setObs}
                value={obs}
              />
            </>
          ) : (
            <></>
          )}

          {/* Salvar */}
          {permitHolder?.id ? (
            <Button variant="primary" onPress={() => postInspection()}>
              <Button.TextButton title="SALVAR" />
            </Button>
          ) : (
            <></>
          )}
        </View>
      </ScrollView>
      <Modal
        className="bg-gray-200"
        variant="primary"
        visible={modal === MODAL.IMAGENS}
        onClose={() => setModal(MODAL.NONE)}
      >
        <View className="flex-1">
          <FlatList
            data={imagens}
            renderItem={({ item, index }) => (
              <View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
                <Image className="h-56 rounded-md" source={{ uri: item.uri }} />
                <Pressable
                  className="py-4 items-center"
                  onPress={() => removerImagem(index)}
                >
                  <Text className="text-red-500 font-semiBold text-lg">
                    Excluir
                  </Text>
                </Pressable>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
      {isLoaded ? <Loading /> : <></>}
    </View>
  );
}
