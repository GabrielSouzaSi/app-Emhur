import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ApproachOption {
  id: number;
  name: string;
}

interface RadioButtonGroupProps {
  options: ApproachOption[];
  onValueChange: (selectedId: number) => void;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  options,
  onValueChange,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handlePress = (id: number) => {
    setSelectedId(id);
    onValueChange(id);
  };

  return (
    <View className="flex flex-row">
      {options.map((option) => (
        <View className="flex-1" key={option.id}>
          <TouchableOpacity
            onPress={() => handlePress(option.id)}
          >
            <View className="flex flex-row items-center gap-1">
            <View className="w-6 h-6 border-2 border-gray-400 rounded-full items-center justify-center">
              {selectedId === option.id && (
                <View className="w-3 h-3 rounded-full bg-gray-700" />
              )}
            </View>
            <Text className="font-semiBold text-lg">{option.name}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  outerCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "#000",
  },
  label: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default RadioButtonGroup;
