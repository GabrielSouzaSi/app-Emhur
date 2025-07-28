import { Button } from "@/components/button";
import { HeaderBack } from "@/components/headerBack";
import React, { useState } from "react";
import { FlatList, Pressable, Text, View, Dimensions } from "react-native";

const initialVehicles = Array.from({ length: 30 }, (_, i) => ({
  vehicle: (i + 1).toString().padStart(3, "0"),
  status: false,
}));

export default function VehicleChecklist() {
  const [vehicles, setVehicles] = useState(initialVehicles);

  // Define o número de colunas dinamicamente com base no número de veículos ou largura da tela
  const numColumns = Math.min(3, vehicles.length); // até 3 colunas (ou você pode calcular com base na largura da tela)

  const toggleStatus = (index: number) => {
    const updated = [...vehicles];
    updated[index].status = !updated[index].status;
    setVehicles(updated);
  };

  return (
    <View className="flex-1 bg-white">
      <HeaderBack title={`Frequência 11/06/2025`} variant="primary" />
      <FlatList
        data={vehicles}
        key={numColumns} // força re-render se numColumns mudar
        numColumns={numColumns}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => toggleStatus(index)}
            style={{
              flex: 1,
              margin: 8,
              height: 60,
              borderRadius: 8,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: item.status ? "#4ade80" : "#e5e7eb", // verde se selecionado, cinza se não
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#1f2937" }}>
              {item.vehicle}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
      />
      <View className="m-4">
        <Button variant="primary">
          <Button.TextButton title="Enviar" />
        </Button>
      </View>
    </View>
  );
}
