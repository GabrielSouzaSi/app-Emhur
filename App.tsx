import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";

import { Login } from "@screens/login";
import { Loading } from "@components/Loading";
import { HomeFiscal} from "@screens/HomeFiscal";

SplashScreen.preventAutoHideAsync();

export default function App() {
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
  return (
    <>
    <StatusBar 
    barStyle="dark-content"
    backgroundColor="transparent"
    translucent
    />
    {isFontLoaded ? <HomeFiscal /> : <Loading />}
    </>
  );
}
