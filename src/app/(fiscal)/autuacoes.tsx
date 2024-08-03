import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { HeaderBack } from "@/components/headerBack";
import { Field } from "@/components/input";
import { Button } from "@/components/button";

export default function Autuacaoes() {
  const router = useRouter();
  const [infracao, setInfracao] = useState();
  const [modoAbordagem, setModoAbordagem] = useState();
  return (
    <View>
      {/* Cabeçalho */}
      <HeaderBack title="Cadastrar Autuação" variant="primary" />
      <ScrollView className="" showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <View className="flex p-4">
          {/* Numero da infração */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1">
              <Text className="text-gray-500 font-regular text-2xl font-bold">
                N° Auto de infração:
              </Text>
            </View>
            <View className="flex-1">
              <Field variant="primary" />
            </View>
          </View>

          {/* Modo de abordagem */}
          <View className="mb-4">
            <Text className="text-gray-500 font-regular text-2xl font-bold">
              Modo de abordagem:
            </Text>
            <Picker
              selectedValue={modoAbordagem}
              onValueChange={(itemValue, itemIndex) =>
                setModoAbordagem(itemValue)
              }
              style={{}}
            >
              <Picker.Item label="Com Abordagem" value="Com Abordagem" />
              <Picker.Item label="Sem Abordagem" value="Sem Abordagem" />
              <Picker.Item label="Estacionado" value="Estacionado" />
            </Picker>
          </View>

          {/* Veiculo */}
          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Placa" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="N° Veículo" variant="primary" />
            </View>
          </View>

          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Marca" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="Modelo" variant="primary" />
            </View>
          </View>

          <View className="flex flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Field placeholder="Tipo" variant="primary" />
            </View>
            <View className="flex-1 ml-2">
              <Field placeholder="Especie" variant="primary" />
            </View>
          </View>

          {/* Imagens do Veiculo */}
          <Button variant="primary">
            <Button.TextButton title="Adicionar Imagens" />
          </Button>

          {/* Dados da Infração */}
          <View className="flex">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Dados da Infração:
            </Text>
            <Field placeholder="Local" variant="primary" />
            <View className="flex flex-row my-4">
              <View className="flex-1 mr-2">
                <Field placeholder="Data" variant="primary" />
              </View>
              <View className="flex-1 ml-2">
                <Field placeholder="Hora" variant="primary" />
              </View>
            </View>
            <Field placeholder="Código da Infração" variant="primary" />
          </View>

          {/* Dados do Condutor/Infrator */}
          <View className="flex mb-5">
            <Text className="my-4 text-gray-500 font-regular text-2xl font-bold">
              Dados do Condutor/Infrator:
            </Text>
            <Field placeholder="Nome" variant="primary" />
            <View className="flex flex-row my-4">
              <View className="flex-1 mr-2">
                <Field placeholder="CPF" variant="primary" />
              </View>
              <View className="flex-1 ml-2">
                <Field placeholder="N° CNH/Permissão" variant="primary" />
              </View>
            </View>
            <Field placeholder="UF" variant="primary" />
          </View>

          {/* Salvar */}
          <Button variant="primary">
            <Button.TextButton title="SALVAR" />
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
