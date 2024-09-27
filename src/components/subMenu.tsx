import React, { useState, useRef } from "react";
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

const MenuItem: React.FC<{ title: string; item: number, children: React.ReactNode }> = ({
  title,
  item,
  children,
}) => {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (item*48)], // Define o tamanho máximo para o submenu
  });

  return (
    <View className="mb-2.5">
      <TouchableOpacity
        className="w-full bg-white py-2 border-l-4 rounded-md justify-center pl-2 border-green-500"
        onPress={toggleExpand}
      >
        <Text className="font-semiBold font-bold text-lg text-green-500">{title}</Text>
      </TouchableOpacity>
      <Animated.View className="overflow-hidden pl-2" style={[{ height }]}>
        {expanded && children}
      </Animated.View>
    </View>
  );
};

export default MenuItem;
