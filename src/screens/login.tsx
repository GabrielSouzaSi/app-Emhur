import { Image, Text, View, TextInput, TouchableOpacity} from "react-native";
import { Header } from "@components/Header";


export function Login(){

  return (
    <View className="flex-1 bg-slate-50">
      <Header title="Login"/>
    <View className="flex-1 mt-10 p-8">
      <View className="items-center">
      <Image className="mb-5" source={require("@assets/prefeitura.png")} />
      <Image className="mb-5" source={require("@assets/emhur.png")} />
      </View>
      <TextInput className="mb-5 w-full h-14 border-gray-400 border-2 rounded-md text-gray-400 px-4 focus:border-green-500" placeholder="E-mail, Matricula, Codigo"/>
      <TextInput className="mb-5 w-full h-14 border-gray-400 border-2 rounded-md text-gray-400 px-4 focus:border-green-500" placeholder="Senha"/>
      <TouchableOpacity className="mb-5 items-end">
        <Text className="font-regular font-bold text-base text-green-500">
          Esqueceu a senha?
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mb-3 w-full bg-green-500 items-center justify-center p-4 rounded-md">
        <Text className="font-regular font-bold text-2xl text-white">
          Entrar
        </Text>
      </TouchableOpacity>
      <View className="items-center">
      <TouchableOpacity className="mb-3">
        <Text className="font-regular font-bold text-base text-green-500">
          Ambiante do Fiscal
        </Text>
      </TouchableOpacity>
      <TouchableOpacity className="mb-3">
        <Text className="font-regular font-bold text-base text-green-500">
          Ambiente do Permissionário
        </Text>
      </TouchableOpacity>
      </View>
    </View>
    </View>
  );
}
