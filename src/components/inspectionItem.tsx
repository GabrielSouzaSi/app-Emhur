import React, { useCallback, useState } from "react";
import { View, FlatList } from "react-native";
import { Button } from "./button";
import { InspectionItemCard } from "./inspectionItemCard";

export function InspectionItem({ data, onSave }) {
  const [checklist, setChecklist] = useState(data);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const toggleExists = useCallback((id: number) => {
    setChecklist((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              exists: !i.exists,
              status: !i.exists ? "apto" : "inapto", // <<< AQUI!!! automatiza o status
            }
          : i
      )
    );
  }, []);

  const updateStatus = useCallback((id: number, status: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    setOpenDropdown(null);
  }, []);

  const updateAdditionalInfo = useCallback((id: number, text: string) => {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, additional_info: text } : i))
    );
  }, []);

  const openOrClose = useCallback((id: number) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <InspectionItemCard
        item={item}
        isOpen={openDropdown === item.id}
        onToggleExists={toggleExists}
        onOpenDropdown={openOrClose}
        onSelectStatus={updateStatus}
        onChangeInfo={updateAdditionalInfo}
      />
    ),
    [
      openDropdown,
      toggleExists,
      openOrClose,
      updateStatus,
      updateAdditionalInfo,
    ]
  );

  return (
    <View className="flex-1 mb-4">
      <FlatList
        data={checklist}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 16 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        initialNumToRender={10}
        windowSize={10}
      />

      <Button variant="primary" onPress={() => onSave(checklist)}>
        <Button.TextButton title="Salvar" />
      </Button>
    </View>
  );
}
