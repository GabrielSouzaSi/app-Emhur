import "@/styles/global.css";
import { Slot, Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import React, { useEffect } from "react";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";
import Constants from 'expo-constants'

import { Loading } from "@components/loading";
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const statusBarHeight = Constants.statusBarHeight;

export default function Layout() {
  const [isFontLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        SplashScreen.hideAsync();
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);
  if (!isFontLoaded) {
    return <Loading />;
  }

  return (
    <View className="flex-1" style={{ marginTop: statusBarHeight}}>
      <StatusBar barStyle="dark-content" />
      <Slot />
    </View>
      // <Stack screenOptions={{headerShown: false}}>
      //   <Stack.Screen name="index" />
      //   <Stack.Screen name="(fiscal)" />   
      //   <Stack.Screen name="(fiscal)/index" />   
      // </Stack>
  );
}
