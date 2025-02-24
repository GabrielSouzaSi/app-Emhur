import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import styles from "@/styles/shadow";
import { colors } from "@/styles/colors";
import { Field } from "./input";
import { DropdownButton } from "./buttonDropdown";
import { Button } from "./button";
import { InspectionItemDTO } from "@/dtos/inspectionItemDTO";

type InspectionItemProps = {
  item: InspectionItemDTO;
  onInspectData: (data: InspectionItemDTO) => void;
};

const InspectionItem: React.FC<InspectionItemProps> = ({
  item,
  onInspectData,
}) => {
  const [description, setDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [confirm, setConfirm] = useState(false);

  const [data, setData] = useState([
    { label: "Apto", value: "Apto" },
    { label: "Inapto", value: "Inapto" },
  ]);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const handleSelect = (value: any) => {
    console.log(value);
    setSelectedOption(value.label);
  };
  const handleSave = () => {
    setConfirm(true);
    let data = {
      id: item.id,
      item: item.item,
      description: item.description,
      additional_info: description,
      status: selectedOption,
      exists: isEnabled,
    };
    onInspectData(data);
  };

  return (
    <View className="w-full p-4 mb-4 bg-white rounded-md" style={styles.shadow}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-semiBold text-lg">{item.item}</Text>
        <View className="flex-row items-center">
          <Text className="font-semiBold text-lg">Existe?</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? colors.blue[500] : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </View>

      <Field
        className="mb-4"
        placeholder="Informações adicionais"
        variant="primary"
        value={description}
        onChangeText={setDescription}
      />

      <DropdownButton data={data} onSelect={handleSelect} />

      <Button
        variant={confirm ? "secundary" : "primary"}
        onPress={() => handleSave()}
      >
        <Button.TextButton title={confirm ? "Confirmado" : "Confirmar"} />
      </Button>
    </View>
  );
};

export { InspectionItem };
