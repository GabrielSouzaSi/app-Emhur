import React from "react";
import { View, ActivityIndicator } from "react-native";
import colors from "tailwindcss/colors";

export function Loading() {
  return (
    <View className="absolute inset-0 flex justify-center items-center bg-black/50">
      <ActivityIndicator size="large" color={colors.green[500]} />
    </View>
  );
}
