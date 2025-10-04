import React, { useState } from "react";
import { View, Text, Switch, FlatList, TouchableOpacity } from "react-native";

import { colors } from "@/styles/colors";
import { Button } from "./button";
import { Field } from "./input";
import { InspectionItemDTO } from "@/dtos/inspectionItemDTO";

type InspectionItemProps = {
  data: InspectionItemDTO[];
  onSave: (updatedData: InspectionItemDTO[]) => void;
};

export function InspectionItem({ data, onSave }: InspectionItemProps) {
  const [checklist, setChecklist] = useState<InspectionItemDTO[]>(data);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleExists = (id: number) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, exists: !c.exists } : c))
    );
  };

  const updateStatus = (id: number, newStatus: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setOpenDropdown(null);
  };

  const updateAdditionalInfo = (id: number, text: string) => {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, additional_info: text } : c))
    );
  };

  return (
    <View className="flex-1 mb-4">
      <FlatList
        data={checklist}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View
            className="w-full p-4 mb-4 bg-white rounded-md border border-gray-300 gap-4"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 0.27,
              shadowRadius: 4.65,
              elevation: 6,
            }}
          >
            {/* Nome + Switch */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-semiBold text-lg">{item.item}</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={item.exists ? colors.blue[500] : "#f4f3f4"}
                value={item.exists}
                onValueChange={() => toggleExists(item.id)}
              />
            </View>

            {/* Dropdown inline */}
            <TouchableOpacity
              className="flex-row justify-between items-center h-16 border-gray-400 border-2 bg-white rounded-md px-4"
              onPress={() =>
                setOpenDropdown(openDropdown === item.id ? null : item.id)
              }
            >
              <Text className="font-semiBold text-lg">
                {item.status || "Selecione o status"}
              </Text>
            </TouchableOpacity>

            {openDropdown === item.id && (
              <View className="bg-white rounded-md p-2 border-2 border-gray-300 mb-4">
                <TouchableOpacity
                  className="bg-blue-500 rounded-md p-2 my-2"
                  onPress={() => updateStatus(item.id, "Apto")}
                >
                  <Text className="text-lg font-semiBold text-white">Apto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-blue-500 rounded-md p-2 my-2"
                  onPress={() => updateStatus(item.id, "Inapto")}
                >
                  <Text className="text-lg font-semiBold text-white">
                    Inapto
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Informações Adicionais */}
            <Field
              className="mb-4"
              placeholder="Informações adicionais"
              variant="primary"
              value={item.additional_info}
              onChangeText={(text) => updateAdditionalInfo(item.id, text)}
            />
          </View>
        )}
      />

      {/* Botão de salvar */}
      <Button variant="primary" onPress={() => onSave(checklist)}>
        <Button.TextButton title="Salvar" />
      </Button>
    </View>
  );
}
