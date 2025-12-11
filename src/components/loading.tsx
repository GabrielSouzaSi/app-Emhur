import React from "react";
import { View, ActivityIndicator } from "react-native";
import colors from "tailwindcss/colors";

const Loading = () => {
  return (
    <View className="absolute inset-0 flex justify-center items-center bg-black/10">
      <ActivityIndicator size={50} color={colors.green[600]} />
    </View>
  );
};

const LoadingTop = () => {
  return (
    <View className="absolute inset-0 flex items-center pt-[68px] bg-black/10">
      <ActivityIndicator size="large" color={colors.blue[500]} />
    </View>
  );
};

const LoadingLight = () => {
  return <ActivityIndicator size="large" color={colors.blue[500]} />;
};

export { Loading, LoadingTop, LoadingLight };
