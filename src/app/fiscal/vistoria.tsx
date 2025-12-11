import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import colors from "tailwindcss/colors";

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
import { NetworkContext } from "@/contexts/NetworkContext";
import { getDatabaseInspectionLocation } from "@/database/InspectionLocation";
import { getDatabaseReason, getDatabaseReasonItemId } from "@/database/reason";
import { addDatabaseInspection } from "@/database/inspection";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Holder } from "@/components/Holder";
import { ImageDTO } from "@/dtos/imageDTO";
import { CameraSave } from "@/components/CameraSave";
import { GalleryPick } from "@/components/GalleryPick";
import { Search } from "@/components/search";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Toast from "react-native-toast-message";

enum MODAL {
  NONE = 0,
  IMAGENS = 1,
  VISTORIA = 2,
  LOCAIS = 3,
}

type FormData = {
  numero: string;
  vistoria: number;
  local: string;
  infracoes: number[];
  status: string;
};

export default function Vistoria() {
  const [isLoaded, setIsLoaded] = useState(false);

  const router = useRouter();

  const { isConnect } = useContext(NetworkContext);

  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    clearErrors,
  } = useForm<FormData>();

  // Informações do Veiculo
  const [vehicle, setVehicle] = useState<VehicleDTO>();
  const [permitType, setPermitType] = useState<string>("");
  // ID do alvará
  const [alvara, setAlvara] = useState<number>();

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
  // Status
  const [status, setStatus] = useState<any>();
  // Propaganda
  const [advertising, setAdvertising] = useState("");
  // Obserções
  const [obs, setObs] = useState("");

  // Itens da vitoria
  const [inspectionItems, setInspectionItems] = useState<any>([]);
  const [inspectionItemsObject, setInspectionItemsObject] = useState<any>(null);

  // Imagens
  const [imagens, setImagens] = useState<ImagePicker.ImagePickerResult[] | any>(
    []
  );

  // Modal
  const [modal, setModal] = useState(MODAL.NONE);

  // Buscar veículo
  async function searchPlate(req: any) {
    Keyboard.dismiss();
    try {
      setIsLoaded(true);
      const { data } = await server.get(`/vehicle/${req}`);
      // console.log(JSON.stringify(data, null, 2));

      const { permit_holder_id, vehicle_id } = data;
      setAlvara(data.permit_id);
      setVehicle(vehicle_id);
      setPermitHolder(permit_holder_id);
      setPermitType(data.permit_type.name);
    } catch (error) {
      setIsLoaded(false);
      Alert.alert("Algo deu errado!", "Tente novamente!");
    } finally {
      setIsLoaded(false);
    }
  }

  // Função para buscar a lista do motivo da vistoria
  async function getInspectionReasons() {
    try {
      const data = await getDatabaseReason();
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
      const data = await getDatabaseInspectionLocation();
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
      const data = await getDatabaseReasonItemId(id);
      let result = data.map((data: any) => {
        return {
          id: data.id,
          item: data.item,
          description: data.description,
          additional_info: "",
          status: "apto",
          exists: true,
        };
      });
      setInspectionItems(result);
    } catch (error) {
      console.log(error);
    }
  }

  // Função recebe os dados da vistoria selecionada
  function onSelectInspection(item: any) {
    //console.log(item);

    inspectionReasonsItems(Number(item.value));
  }

  // Função recebe os dados do local selecionado
  function onSelectLocation(item: any) {
    // console.log(item);
    setLocations(item);
  }
  // Função recebe os dados do local selecionado
  function onSelectStatus(item: any) {
    // console.log(item);
    setStatus(item);
  }

  // Recebe os dados da imagem e salva no array
  const saveImage = async (img: ImageDTO) => {
    setImagens((prev) => [...prev, img]);
  };

  // Função para remover imagem
  const removerImagem = (index: number) => {
    setImagens((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length < 1) setModal(MODAL.NONE);
      return updated;
    });
  };

  async function postInspection(data: FormData) {
    setIsLoaded(true);
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

    let formData = new FormData();
    formData.append("permit_id", `${alvara}`);
    formData.append("permit_holder_id", `${permitHolder?.id}`);
    formData.append("vehicle_id", `${vehicle?.id}`);
    formData.append("user_id", `${user.id}`);
    formData.append("inspection_location_id", `${locations.value}`);
    formData.append("inspection_reason_id", `${inspectionReason}`);
    formData.append("inspection_date", `${date}`);
    formData.append("inspection_time", `${time}`);
    formData.append("advertising", `${advertising}`);
    formData.append("final_observations", `${obs ? obs : "Sem observações"}`);
    formData.append("inspection_items", JSON.stringify(inspectionItemsObject));
    formData.append("inspection_result", `${status.value}`);
    imagens.forEach((image: ImageDTO) => {
      formData.append("attachments[]", {
        ...image,
        uri: image.uri,
        name: image.name,
        type: image.type,
      } as any);
    });

    //console.log("Checklist salvo", JSON.stringify(formData, null, 2));

    try {
      await server.postForm(`/inspections`, formData);
      Toast.show({
        type: "success",
        text1: "Vistoria enviado com sucesso!",
      });
      router.back();
    } catch (error) {
      console.log(error);
      addInspection(data);
    } finally {
      setIsLoaded(false);
    }
  }
  async function addInspection(form: FormData) {
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

    let inspection = [
      {
        permitHolderId: permitHolder?.id,
        vehicle: form.numero,
        inspectionLocationId: locations.value,
        inspectionReasonId: inspectionReason,
        data: date,
        hora: time,
        advertising: advertising,
        obs: `${obs ? obs : "Sem observações"}`,
        items: inspectionItems,
        imagens: imagens,
        status: `${status.value}`,
      },
    ];

    try {
      await addDatabaseInspection(inspection);
      Toast.show({
        type: "success",
        text1: "Vistoria salvo offline!",
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Algo deu errado!",
        text2: "Não foi possível salvar!",
      });
      console.log(error);
    }
  }

  const handleSave = (updatedData: any) => {
    // Aqui você pode mandar pra API
    setModal(MODAL.NONE);

    setInspectionItems(updatedData);

    // console.log("Checklist atualizado:", updatedData);

    let inspectionItemss = {};

    updatedData.forEach((item) => {
      inspectionItemss[item.id] = {
        item: item.item,
        additional_info: item.additional_info,
        status: item.status,
        exists: item.exists,
      };
    });

    // console.log(inspectionItems);

    setInspectionItemsObject(inspectionItemss);

    //Alert.alert("Checklist salvo", JSON.stringify(updatedData, null, 2));
  };

  useEffect(() => {
    getInspectionReasons();
    getListLocations();
  }, []);

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
        <HeaderBack title="Cadastrar Vistoria" variant="primary" />

        <View className="flex p-4">
          {/* Consultar veículo */}
          <View className="flex-row items-center mb-3">
            <View className="flex-1">
              <Controller
                control={control}
                name="numero"
                rules={{
                  required: "Informe o Número do Veículo!",
                }}
                render={({ field: { onChange, value } }) => (
                  <Search
                    errorMessage={errors.numero?.message}
                    placeholder="Número do Veículo"
                    onChangeText={onChange}
                    value={value}
                    onSubmitEditing={() => searchPlate(value)}
                    returnKeyType="send"
                    keyboardType="numeric"
                    onSearch={() => searchPlate(value)}
                  />
                )}
              />
            </View>
          </View>

          {/* Permissionário */}
          <Holder permitHolder={permitHolder} vehicle={vehicle} />

          {permitType !== "" && (
            <View className="mb-4">
              <View>
                <Text className="text-gray-500 font-regular text-2xl font-bold">
                  Tipo de Alvará
                </Text>
                <Field
                  variant="primary"
                  placeholder={permitType}
                  editable={false}
                />
              </View>
            </View>
          )}

          <View className="mb-4 gap-4">
            <View>
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Motivo da Vistoria
              </Text>
              <Controller
                control={control}
                name="vistoria"
                rules={{ required: "Selecione o Motivo da Vistoria!" }}
                render={({ field: { onChange, value } }) => (
                  <DropdownButton
                    data={[...inspectionOptions].sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    placeholder="Motivo da Vistoria"
                    value={value} // ✅ agora mostra o valor selecionado
                    errorMessage={errors.vistoria?.message} // ✅ mostra erro
                    onSelect={(item) => {
                      onChange(item.value); // ✅ atualiza o valor no formulário
                      onSelectInspection(item); // ✅ mantém sua lógica atual também
                    }}
                  />
                )}
              />
            </View>
            <View>
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Local da Vistoria
              </Text>
              <Controller
                control={control}
                name="local"
                rules={{ required: "Selecione o Local da Vistoria!" }}
                render={({ field: { onChange, value } }) => (
                  <DropdownButton
                    data={[...listLocations].sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    placeholder="Local da Vistoria"
                    value={value} // ✅ agora mostra o valor selecionado
                    errorMessage={errors.local?.message} // ✅ mostra erro
                    onSelect={(item) => {
                      onChange(item.value); // ✅ atualiza o valor no formulário
                      onSelectLocation(item); // ✅ mantém sua lógica atual também
                    }}
                  />
                )}
              />
            </View>

            {inspectionItems.length > 0 && (
              <Button
                className="mt-4"
                variant="primary"
                onPress={() => setModal(MODAL.VISTORIA)}
              >
                <Button.TextButton title="Itens da Vistoria" />
              </Button>
            )}

            {/* Imagens do Veiculo */}
            <View className="flex flex-row justify-between my-4">
              <View className="flex-1 mr-2">
                {/* Componente da camera */}
                <CameraSave onChange={saveImage} />
              </View>
              <View className="flex-1 ml-2">
                {/* Abrir Galeria */}
                <GalleryPick onChange={saveImage} />
              </View>
            </View>

            {/* Se houver imagem */}
            {imagens.length > 0 ? (
              <Button variant="primary" onPress={() => setModal(MODAL.IMAGENS)}>
                <Button.TextButton title={`Imagens(${imagens.length})`} />
              </Button>
            ) : (
              <></>
            )}

            <View>
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Status da Vistoria
              </Text>
              <Controller
                control={control}
                name="status"
                rules={{ required: "Selecione o Status da Vistoria!" }}
                render={({ field: { onChange, value } }) => (
                  <DropdownButton
                    data={[
                      { label: "Aprovada", value: "Aprovada" },
                      { label: "Reprovada", value: "Reprovada" },
                    ]}
                    placeholder="Status da Vistoria"
                    value={value} // ✅ agora mostra o valor selecionado
                    errorMessage={errors.status?.message} // ✅ mostra erro
                    onSelect={(item) => {
                      onChange(item.value); // ✅ atualiza o valor no formulário
                      onSelectStatus(item); // ✅ mantém sua lógica atual também
                    }}
                  />
                )}
              />
            </View>

            {/* Observação */}
            <View className="flex mb-5">
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                Observação:
              </Text>

              <Field
                placeholder="Descreva o assunto."
                variant="primary"
                onChangeText={setObs}
                value={obs}
                multiline={true}
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Salvar */}
          <Button variant="primary" onPress={handleSubmit(postInspection)}>
            <Button.TextButton title="ENVIAR" />
          </Button>
        </View>

        <Modal
          visible={modal === MODAL.IMAGENS}
          animationType="slide"
          onRequestClose={() => setModal(MODAL.NONE)}
        >
          <View className="flex-1 bg-white p-4">
            <TouchableOpacity
              activeOpacity={0.7}
              className="self-end mb-4"
              onPress={() => setModal(MODAL.NONE)}
            >
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={40}
                color={colors.blue[500]}
              />
            </TouchableOpacity>
            <FlatList
              data={imagens}
              renderItem={({ item, index }) => (
                <View className="w-full mb-4 bg-white p-2 rounded-md border-gray-300 border-2">
                  <Image
                    className="h-56 rounded-md"
                    source={{
                      uri: item.uri,
                    }}
                    resizeMode="contain"
                  />

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
        <Modal
          visible={modal === MODAL.VISTORIA}
          animationType="slide"
          onRequestClose={() => setModal(MODAL.NONE)}
        >
          <View className="flex-1  bg-white p-4">
            <View className="flex-row justify-between items-center">
              <Text className="font-semiBold text-xl">Lista de Items</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="self-end mb-4"
                onPress={() => setModal(MODAL.NONE)}
              >
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={40}
                  color={colors.blue[500]}
                />
              </TouchableOpacity>
            </View>
            {inspectionItems && (
              <InspectionItem data={inspectionItems} onSave={handleSave} />
            )}
          </View>
        </Modal>
      </KeyboardAwareScrollView>
      {isLoaded && <Loading />}
    </>
  );
}
