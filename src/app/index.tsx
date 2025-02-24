import React, { useState } from "react";
import { Image, Text, View, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";

import { useAuth } from "@/hooks/useAuth";

import { Header } from "@/components/header";
import { Field } from "@/components/input";
import { Button } from "@/components/button";
import { Loading } from "@/components/loading";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn({ email, password }: FormData) {
    // console.log("Login e senha => ", email, password);

    try {
      setIsLoading(true);
      await signIn(email, password);
    } catch (error) {
      console.log("Error =>", error);
      Alert.alert("Aviso!","Não foi possível fazer login, tente novamente!");

      // const isAppError = error instanceof AppError;

      // const title =  isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.'
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Header title="Login" />

      <View className="flex-1 p-8 justify-center">
        <View className="items-center mb-10">
        <Image className="w-48 h-48" source={require("@/assets/adaptive-icon.png")} />
          {/* <Image source={require("@/assets/adaptive-icon.png")} resizeMode="contain" /> */}
        </View>

        <View>
          <Controller
            control={control}
            name="email"
            rules={{
              required: "Informe o e-mail, matrícula ou código!",
              // pattern: {
              //   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              //   message: "E-mail inválido",
              // },
            }}
            render={({ field: { onChange } }) => (
              <Field
                className={`${!!errors.email ? "border-red-500" : ""}`}
                placeholder="E-mail, Matrícula, Código"
                onChangeText={onChange}
              />
            )}
          />

          {errors.email?.message && (
            <Text className="font-regular font-bold text-lg text-red-500">
              {errors.email.message}
            </Text>
          )}

          <Controller
            control={control}
            name="password"
            rules={{ required: "Informe a senha!" }}
            render={({ field: { onChange } }) => (
              <Field
                className={`mt-5 ${!!errors.password ? "border-red-500" : ""}`}
                placeholder="Senha"
                secureTextEntry
                textContentType="password"
                onChangeText={onChange}
                onSubmitEditing={handleSubmit(handleSignIn)}
                returnKeyType="send"
              />
            )}
          />
          {errors.password?.message && (
            <Text className="font-regular font-bold text-lg text-red-500">
              {errors.password.message}
            </Text>
          )}
        </View>

        <Pressable className="my-7 items-end">
          <Text className="font-regular font-bold text-base text-blue-500">
            Esqueceu a senha?
          </Text>
        </Pressable>

        <Button variant="primary" onPress={handleSubmit(handleSignIn)}>
          <Button.TextButton title="Entrar" />
        </Button>
      </View>
        {isLoading && <Loading />}
    </>
  );
}
