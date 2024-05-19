import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      home: "Home",
      about: "About",
      contact: "Contact",
      Login: "Login",
    },
  },
  vn: {
    translation: {
      home: "Trang Chủ",
      about: "About",
      contact: "Contact",
      Login: "Đăng nhập",
    },
  },
  jp: {
    translation: {
      home: "Home",
      about: "About",
      contact: "Contact",
      Login: "ロックイン",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "jp",
  fallbackLng: "jp",
  interpolation: {
    escapeValue: false,
  },
});
