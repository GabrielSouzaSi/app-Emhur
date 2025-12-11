import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import * as Sharing from "expo-sharing";
import { DATABASE_NAME } from "@/database/connection";

export async function exportDatabase() {
    try {
        const internalPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
        const fileInfo = await FileSystem.getInfoAsync(internalPath);

        if (!fileInfo.exists) {
            Alert.alert("Erro", "Banco de dados não encontrado.");
            return;
        }
        await Sharing.shareAsync(internalPath);
    } catch (error) {
        Alert.alert("Erro", "Não foi possível enviar o backup.");
    }
}
