// utils/file.ts
import * as FileSystem from "expo-file-system/legacy";

export async function saveSignatureAsPng(base64String: string) {
    const base64Data = base64String.replace(
        /^data:image\/png;base64,/,
        ""
    );

    if (!FileSystem.cacheDirectory) {
        throw new Error("Cache directory not available");
    }

    const fileUri =
        FileSystem.cacheDirectory + `signature_${Date.now()}.png`;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
}
