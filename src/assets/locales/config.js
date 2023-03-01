import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translation_enUS from './en-US.json';
import translation_zhCN from './zh-CN.json';

const resources = {
    zh_CN: {
        translation: translation_zhCN,
    },
    en_US: {
        translation: translation_enUS,
    }
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'en-US',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
