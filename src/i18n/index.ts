import i18 from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18
    // tải file json từ public/locales
    .use(Backend)
    // tự động detect ngôn ngữ
    .use(LanguageDetector)
    // kết nối i18next với react
    .use(initReactI18next)
    .init({
        fallbackLng: 'vi', // Ngôn ngữ mặc định
        supportedLngs: ['vi', 'en'], // Ngôn ngữ được hỗ trợ
        defaultNS: 'translation',
        ns: ['translation', 'login', 'common', 'register', ], // namespace
        
        // Cho phép dùng dấu chấm để phân tách namespace (VD: login.key) thay vì dấu :
        nsSeparator: '.',
        // Cho phép dùng dấu chấm cho key lồng nhau
        keySeparator: '.',

        backend: {
            loadPath: '/lang/{{lng}}/{{ns}}.json', // đường dẫn file json
        },

        detection: {
            order: ['localStorage', 'querystring', 'cookie', 'navigator'], // thứ tự ưu tiên detect ngôn ngữ
            caches: ['localStorage', 'cookie'], // cache ngôn ngữ
            lookupLocalStorage: 'i18nextLng',
            lookupCookie: 'i18nextLng',
        },


        interpolation: {
            escapeValue: false, // không escape giá trị
        },

        react: {
            useSuspense: false, // không sử dụng suspense
        },
    });

export default i18;