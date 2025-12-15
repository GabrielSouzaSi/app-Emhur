import { Alert } from "react-native";

let setIsLoadedGlobal: ((value: boolean) => void) | null = null;

// opcional: registrar setIsLoaded para usar no handler global
export function registerSetIsLoaded(fn: (value: boolean) => void) {
    setIsLoadedGlobal = fn;
}

export function handleRequestError(message: string, error: any) {
    console.error(message, error);

    Alert.alert("Erro", message);

    if (setIsLoadedGlobal) {
        setIsLoadedGlobal(false);
    }
}
