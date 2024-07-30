import { Image, Text, View, TextInput, Pressable, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Header } from "@components/Header";

export default function Login() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Header title="Login"/>
      <View className="mt-10 p-8">
        <View className="items-center">
          <Image className="mb-5" source={require("@assets/prefeitura.png")} />
          <Image className="mb-5" source={require("@assets/emhur.png")} />
        </View>
        <TextInput
          className="mb-5 w-full h-14 border-gray-400 border-2 rounded-md text-gray-400 px-4 focus:border-green-500"
          placeholder="E-mail, Matricula, Codigo"
        />
        <TextInput
          className="mb-5 w-full h-14 border-gray-400 border-2 rounded-md text-gray-400 px-4 focus:border-green-500"
          placeholder="Senha"
        />
        <Pressable className="mb-5 items-end">
          <Text className="font-regular font-bold text-base text-green-500">
            Esqueceu a senha?
          </Text>
        </Pressable>
        <Pressable style={({pressed}) => [{opacity: pressed ? 0.7 : 1, margin: 2 }, { padding: 2 }]} className="mb-5 w-full bg-green-500 items-center justify-center p-4 rounded-md">
          <Text className="font-regular font-bold text-2xl text-white">
            Entrar
          </Text>
        </Pressable>
        <View className="items-center">
          
            <Link href={"/fiscal"} className="mb-5 font-regular font-bold text-base text-green-500">
              Ambiante do Fiscal
            </Link>
          
          <Pressable
            className="mb-3"
            onPress={() => router.push("/permissionario")}
          >
            <Text className="font-regular font-bold text-base text-green-500">
              Ambiente do Permissionário
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
