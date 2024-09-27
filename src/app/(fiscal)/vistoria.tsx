import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
} from "react-native";
import { HeaderBack } from "@/components/headerBack";
import { Field } from "@/components/input";
import RadioButtonGroup from "@/components/radioButtonGroup";

export default function Vistoria() {
  const [categoria, setCategoria] = useState("conventional");
  const [combustivel, setCombustivel] = useState([{
    "id": 1,
    "name": "Gasolina"},{
      "id": 2,
      "name": "Alcool"},{
        "id": 3,
        "name": "Flex"}]);
  const [conservacao, setConservacao] = useState("");
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheckbox = (item: string) => {
    setCheckedItems((prevState) =>
      prevState.includes(item)
        ? prevState.filter((i) => i !== item)
        : [...prevState, item]
    );
  };

  return (
    <View>
      <HeaderBack title="Cadastrar Vistoria" variant="primary" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex p-4">
          {/* Consultar veículo */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1">
              <Field
                variant="primary"
                placeholder="placa ou número"
                returnKeyType="send"
              />
            </View>
          </View>

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
                    <Text className="font-semiBold text-lg">name</Text>
                  </View>
                </View>
              </View>

              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    CPF:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">cpf</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    CNH:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">cnh</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Informações do veículo */}
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
                    <Text className="font-semiBold text-lg">plate_number</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Marca:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">make</Text>
                  </View>
                </View>
              </View>

              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Modelo:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">model</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Cor:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">color</Text>
                  </View>
                </View>
              </View>

              <View className="flex flex-row justify-between mb-4 gap-4">
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Ano:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">year</Text>
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 font-regular text-2xl font-bold">
                    Renavam:
                  </Text>
                  <View className="bg-gray-300 rounded-md p-3">
                    <Text className="font-semiBold text-lg">renavam</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Check List */}
          <Text style={styles.label}>Check List:</Text>
          {[
            "Extintor",
            "Buzina",
            "Triangulo",
            "Limpador de para-brisa",
            "Luz de freio",
            "Faixas",
            "Escapamento (Ruído)",
            "Step",
            "Luminoso",
            "Cintos de segurança",
          ].map((item) => (
            <View key={item} style={styles.checkboxContainer}>
              <Text>{item}</Text>
              <TouchableOpacity
                onPress={() => toggleCheckbox(item)}
                style={styles.checkbox}
              >
                {checkedItems.includes(item) && <View style={styles.checked} />}
              </TouchableOpacity>
            </View>
          ))}

          {/* Combustível */}
          <View className="mb-6">
            <Text className="mb-4 text-gray-500 font-regular text-2xl font-bold">
              Combustível:
            </Text>
              <RadioButtonGroup
                options={combustivel}
                onValueChange={() => {}}
              />
          </View>
          
          {/* Outros campos e botões */}
          <TextInput
            placeholder="Para-brisa vidro(Película)"
            style={styles.input}
          />
          <TextInput placeholder="Traseiro" style={styles.input} />
          <TextInput placeholder="Lateral dianteira" style={styles.input} />
          <TextInput placeholder="Lateral traseira" style={styles.input} />
          <TextInput placeholder="Nome da publicidade" style={styles.input} />
          <TextInput placeholder="Motivo da vistoria" style={styles.input} />
          <TextInput
            placeholder="Observações"
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <Button title="Adicionar Imagens" onPress={() => {}} />
          <Button title="SALVAR" onPress={() => {}} color="#007BFF" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#007BFF",
    marginLeft: 8,
  },
  selectedRadio: {
    backgroundColor: "#007BFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
    marginRight: 8,
    backgroundColor: "#FFF",
  },
  row: {
    flexDirection: "row",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#007BFF",
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: "#007BFF",
  },
});
