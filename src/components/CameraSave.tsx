import React, { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Button } from "./button";
import { ImageDTO } from "@/dtos/imageDTO";

type CameraSaveProps = {
  onChange?: (imagens: ImageDTO) => void; // callback opcional para atualizar o banco ou o form
};

export function CameraSave({ onChange }: CameraSaveProps) {
  // Função principal de captura e salvamento
  async function handleTakePhoto() {
    try {
      // 1️⃣ Abre a câmera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        aspect: [4, 2],
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      const imageObj: ImageDTO = {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName ?? `${Date.now()}.jpg`,
        type: "image/jpeg",
      };

      onChange?.(imageObj);

      return;

      // 2️⃣ Verifica permissão
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Habilite o acesso à galeria para salvar a foto."
        );
        return;
      }

      // 3️⃣ Cria o asset e adiciona ao álbum "appFiscal"
      const asset = await MediaLibrary.createAssetAsync(uri);
      let album = await MediaLibrary.getAlbumAsync("appFiscal");
      if (!album) {
        album = await MediaLibrary.createAlbumAsync("appFiscal", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      }

      // 4️⃣ Recarrega o asset dentro do álbum — para pegar o caminho real
      const { assets } = await MediaLibrary.getAssetsAsync({
        album: album.id,
        mediaType: "photo",
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 1,
      });

      // O último asset criado (mais recente)
      const saved = assets[0];

      // 5️⃣ Cria o objeto final com o caminho real dentro de /Pictures/appFiscal/

      // 6️⃣ Retorna o objeto correto
      onChange?.(imageObj);

      // 7️⃣ Remove arquivo temporário (câmera)
      if (
        uri.startsWith(FileSystem.cacheDirectory) ||
        uri.startsWith(FileSystem.documentDirectory)
      ) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.log("Erro ao capturar ou salvar imagem:", error);
    }
  }

  return (
    <Button variant="primary" onPress={handleTakePhoto}>
      <Button.TextButton title="Tirar Foto" />
    </Button>
  );
}
