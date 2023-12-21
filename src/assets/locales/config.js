import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import publicUS from './en-US/public.json';
import publicCN from './zh-CN/public.json';

import publishUS from './en-US/publish.json';
import publishCN from './zh-CN/publish.json';

import exploreUS from './en-US/explore.json';
import exploreCN from './zh-CN/explore.json';

import claimUS from './en-US/claim.json';
import claimCN from './zh-CN/claim.json';

import profileUS from './en-US/profile.json';
import profileCN from './zh-CN/profile.json';

import certUS from './en-US/cert.json';
import certCN from './zh-CN/cert.json';

import rateUS from './en-US/rate.json';
import rateCN from './zh-CN/rate.json';

const resources = {
    "zh-CN": {
        translation: publicCN,
        publish: publishCN,
        explore: exploreCN,
        claim: claimCN,
        profile: profileCN,
        cert: certCN,
        rate: rateCN
    },
    "en-US": {
        translation: publicUS,
        publish: publishUS,
        explore: exploreUS,
        claim: claimUS,
        profile: profileUS,
        cert: certUS,
        rate: rateUS
    }
};


i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem("decert.lang") || (navigator.language !== 'zh-CN' ? 'en-US' : 'zh-CN'),
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
