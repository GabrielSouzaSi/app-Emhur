import "@/styles/global.css";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack, useRouter } from "expo-router";
import { StatusBar, View } from "react-native";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Toast from "react-native-toast-message";

// Database
import { DATABASE_NAME, db, expoDb } from "@/database/connection";
import { SQLiteProvider } from "expo-sqlite";
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
import { CustomToast } from "@/components/CustomToast";

SplashScreen.preventAutoHideAsync();

function StackLayout() {
  const { success, error } = useMigrations(db, migrations);
  useDrizzleStudio(expoDb);
  const { user } = useAuth();
  const router = useRouter();

  const [isFontLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  useEffect(() => {
    if (isFontLoaded && success) {
      SplashScreen.hideAsync();

      // Evita redirecionar várias vezes
      if (!user?.id) {
        router.replace("/");
      } else {
        router.replace("/fiscal");
      }
    }
  }, [isFontLoaded, success, user]);

  if (!__DEV__) {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }

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
      <Toast
        config={{
          success: (props) => <CustomToast {...props} type="success" />,
          error: (props) => <CustomToast {...props} type="error" />,
          info: (props) => <CustomToast {...props} type="info" />,
        }}
      />
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
