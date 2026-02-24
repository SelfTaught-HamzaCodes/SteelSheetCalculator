import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ur from './locales/ur.json';

const LANGUAGE_KEY = '@SteelSheetCalculator/language';

const resources = {
  en: { translation: en },
  ur: { translation: ur },
};

// flip layout for urdu (RTL) - might need restart to fully apply
const setRTL = (lang) => {
  const isRTL = lang === 'ur';
  I18nManager.forceRTL(isRTL);
  I18nManager.allowRTL(isRTL);
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// restore saved lang on startup
AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
  if (lang && (lang === 'en' || lang === 'ur')) {
    i18n.changeLanguage(lang);
    setRTL(lang);
  }
});

// call this when user picks a lang in settings
export const changeLanguage = async (lang) => {
  if (lang === 'en' || lang === 'ur') {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
    setRTL(lang);
    return true;
  }
  return false;
};

export default i18n;
