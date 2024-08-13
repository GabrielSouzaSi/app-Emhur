import "@/styles/global.css";
import { Stack, useRouter } from "expo-router";
import { StatusBar, View } from "react-native";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";

import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

import { AuthContextProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/loading";

SplashScreen.preventAutoHideAsync();
const statusBarHeight = Constants.statusBarHeight;

function StackLayout() {
  const { user, isLoadingUserStorageData } = useAuth();
  const router = useRouter();

  const [isFontLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    console.log("authState", user);

    if (isFontLoaded) {
      if (!user?.id) {
        console.log("===Login===");
        router.replace("/");
      } else if (user?.id) {
        console.log("===Fiscal===");
        router.replace("/(fiscal)");
      }
    } else {
      return;
    }
  }, [user, isFontLoaded]);

  setTimeout(() => {
    SplashScreen.hideAsync();
  }, 2000);

  return (
    <View className="flex-1" style={{ marginTop: statusBarHeight }}>
      <StatusBar barStyle="dark-content" />
      {isFontLoaded ? (<Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(fiscal)" />
      </Stack>):(<Loading />)}
    </View>
  );
}

const RootLayoutNav = () => {
  return (
    <AuthContextProvider>
      <StackLayout />
    </AuthContextProvider>
  );
};

export default RootLayoutNav;
