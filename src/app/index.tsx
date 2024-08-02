import {
  Image,
  Text,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Header } from "@components/header";
import { Field } from "@/components/input";
import { Button } from "@/components/button";

export default function Login() {
  const router = useRouter();

  return (
    <>
      <Header title="Login" />

      <View className="p-8">

        <View className="items-center mb-10">
          <Image className="mb-5" source={require("@assets/prefeitura.png")} />
          <Image source={require("@assets/emhur.png")} />
        </View>

        <View>
          <Field
            className="mb-5"
            placeholder="E-mail, Matricula, Codigo"
            variant="secundary"
          />
          <Field placeholder="Senha" variant="secundary" />
        </View>

        <Pressable className="my-7 items-end">
          <Text className="font-regular font-bold text-base text-green-500">
            Esqueceu a senha?
          </Text>
        </Pressable>

        <Button variant="primary">
          <Button.TextButton title="Entrar" />
        </Button>

        <View className="mt-7 items-center">
          <Link
            href={"/(fiscal)"}
            className="mb-5 font-regular font-bold text-base text-green-500"
          >
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
    </>
  );
}
