// src/i18n.ts
import { I18n } from 'i18n-js';

// Definindo as traduções
const translations  = {
  en: { cameraPermission: "app-Emhur needs permissions for accessing camera. You've already granted permission to another Expo experience. Allow app-Emhur to also use it?" },
  pt: { cameraPermission: "O app-Emhur precisa de permissão para acessar a câmera. Você já concedeu permissão para outra experiência Expo. Permitir que o app-Emhur também use?" },
};

// Definindo o idioma automaticamente
const i18n = new I18n
i18n.translations = translations;
i18n.locale = "pt";
i18n.enableFallback = true;

export default i18n;
