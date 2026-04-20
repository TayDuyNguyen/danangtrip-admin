import { useState, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IoChevronDownOutline } from 'react-icons/io5';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation('common');

    const languages = [
        { 
            name: t('language.vi'), 
            code: 'vi', 
            flag: '/images/lang/vi.png' 
        },
        { 
            name: t('language.en'), 
            code: 'en', 
            flag: '/images/lang/en.png' 
        },
    ];

    const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

    const toggleLanguage = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 border border-slate-200/60 bg-slate-50/50 text-slate-700 hover:border-blue-500/30 hover:bg-blue-50/50 group`}
            >
                <img 
                    src={currentLanguage.flag} 
                    alt={currentLanguage.name}
                    className="w-5 h-5 rounded-full object-cover border border-white/20 shadow-sm"
                />
                <span className="text-xs font-bold uppercase tracking-wider">{currentLanguage.code}</span>
                <IoChevronDownOutline className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{t('language.select')}</span>
                    </div>
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => toggleLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 hover:bg-gray-50 group/item ${
                                i18n.language === lang.code ? 'bg-primary/5' : ''
                            }`}
                        >
                            <img 
                                src={lang.flag} 
                                alt={lang.name}
                                className="w-6 h-6 rounded-full object-cover shadow-sm group-hover/item:scale-110 transition-transform"
                            />
                            <span className={`font-semibold ${
                                i18n.language === lang.code ? 'text-primary' : 'text-gray-700'
                            }`}>
                                {lang.name}
                            </span>
                            {i18n.language === lang.code && (
                                <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"></span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default memo(LanguageSwitcher);
