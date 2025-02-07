import "@/styles/global.css";
import { Stack, useRouter } from "expo-router";
import { StatusBar, View } from "react-native";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Constants from "expo-constants";
// Database
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations.js";

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

const DATABASE_NAME = "databese.db";

const expoDb = openDatabaseSync(DATABASE_NAME);
const db = drizzle(expoDb);

function StackLayout() {
  const { success, error } = useMigrations(db, migrations);
  const { user } = useAuth();
  const router = useRouter();

  const [isFontLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  // console.log("Success =>", success);
  // console.log("Error => ", error);
  // console.log("isFontLoaded => ", isFontLoaded);

  useEffect(() => {
    console.log("authState", user);

    if (isFontLoaded && success) {
      if (!user?.id) {
        console.log("===Login===");
        router.replace("/");
      } else if (user?.id) {
        console.log("===Fiscal===");
        router.replace("/fiscal");
      }
    } else {
      return;
    }
  }, [user, isFontLoaded, success]);

  setTimeout(() => {
    SplashScreen.hideAsync();
  }, 2000);

  return (
    <View className="flex-1">
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      {isFontLoaded ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="fiscal" />
        </Stack>
      ) : (
        <Loading />
      )}
    </View>
  );
}

const RootLayoutNav = () => {
  return (
    <AuthContextProvider>
      <SQLiteProvider databaseName={DATABASE_NAME}>
        <StackLayout />
      </SQLiteProvider>
    </AuthContextProvider>
  );
};

export default RootLayoutNav;