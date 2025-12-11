import { useState } from "react";
import { View, Image, TouchableOpacity, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

import styles from "@/styles/shadow";
import { FontAwesome6 } from "@expo/vector-icons";
import { exportDatabase } from "@/database/exportDatabase";

type HeaderMenuProps = {
  onUpdate: () => void;
};

export function HeaderMenu({ onUpdate }: HeaderMenuProps) {
  const router = useRouter();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { signOut } = useAuth();

  function handleSignOut() {
    signOut();
  }

  function toggleDropdown() {
    setIsDropdownVisible((prev) => !prev);
  }

  return (
    <View
      className="bg-white w-full flex flex-row justify-between items-center py-3 px-5 mb-5"
      style={[styles.shadow, { position: "relative", zIndex: 10 }]}
    >
      <Image
        className="w-12 h-12"
        source={require("@/assets/app-fiscal.png")}
      />
      <View className="flex flex-row items-center gap-3 relative">
        {/* <TouchableOpacity
          onPress={() => router.push("/scale/notifications")}
          className="p-2 relative"
        >
          <BellIcon size={24} color={colors.zinc[700]} />
          {true && (
            <View className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1" />
          )}
        </TouchableOpacity> */}

        <TouchableOpacity onPress={toggleDropdown} className="p-2">
          <FontAwesome6 name="user-circle" size={30} color="#3b82f6" />
        </TouchableOpacity>

        {isDropdownVisible && (
          <View
            className="absolute top-12 right-0 w-40 bg-white rounded-md border border-zinc-200"
            style={{
              zIndex: 9999, // <- força o dropdown a estar acima de tudo
              elevation: 10, // Android
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            <Pressable
              onPress={() => {
                setIsDropdownVisible(false);
                router.push("/fiscal/credencial");
              }}
              className="px-4 py-3 border-b border-zinc-100"
            >
              <Text className="font-regular font-bold text-base text-blue-500 ">
                Perfil
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsDropdownVisible(false);
                router.push("/fiscal/escala");
              }}
              className="px-4 py-3 border-b border-zinc-100"
            >
              <Text className="font-regular font-bold text-base text-blue-500">
                Escala
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setIsDropdownVisible(false);
                onUpdate();
              }}
              className="px-4 py-3 border-b border-zinc-100"
            >
              <Text className="font-regular font-bold text-base text-blue-500">
                Atualizar
              </Text>
            </Pressable>
            {/* <Pressable
              onPress={exportDatabase}
              className="px-4 py-3 border-b border-zinc-100"
            >
              <Text className="font-regular font-bold text-base text-blue-500">
                Backup
              </Text>
            </Pressable> */}
            <Pressable
              onPress={() => {
                setIsDropdownVisible(false);
                handleSignOut();
              }}
              className="px-4 py-3"
            >
              <Text className="font-regular font-bold text-base text-red-600">
                Sair
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
