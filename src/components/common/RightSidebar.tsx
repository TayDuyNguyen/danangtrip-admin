import { useEffect, useState } from 'react';
import {
    X,
    Settings,
    User,
    AtSign,
    Phone,
    Camera,
    Clock,
    Type,
    Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    applyAdminFontSize,
    getAdminPreferences,
    setAdminPreferences,
    type AdminFontSize,
    type AdminPreferences
} from '@/utils/storage';

interface RightSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const fontSizeOptions: Array<{ value: AdminFontSize; labelKey: string }> = [
    { value: 'small', labelKey: 'common:right_sidebar.preferences.font_size_small' },
    { value: 'medium', labelKey: 'common:right_sidebar.preferences.font_size_medium' },
    { value: 'large', labelKey: 'common:right_sidebar.preferences.font_size_large' },
];

const RightSidebar = ({ isOpen, onClose }: RightSidebarProps) => {
    const { t } = useTranslation(['common', 'dashboard']);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [preferences, setPreferences] = useState<AdminPreferences>(() => getAdminPreferences());

    useEffect(() => {
        applyAdminFontSize(preferences.fontSize);
    }, [preferences.fontSize]);

    const updatePreference = <K extends keyof AdminPreferences>(key: K, value: AdminPreferences[K]) => {
        setPreferences((current) => ({ ...current, [key]: value }));
    };

    const handleSavePreferences = () => {
        setAdminPreferences(preferences);
        applyAdminFontSize(preferences.fontSize);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={onClose}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed right-0 top-0 h-screen w-85 bg-white border-l border-slate-200 z-50 transition-transform duration-500 transform shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('common:right_sidebar.title')}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all group">
                            <X size={20} className="text-slate-500 group-hover:rotate-90 duration-300" />
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex p-2 bg-slate-100/50 mx-6 mt-6 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-[#14b8a6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <User size={16} />
                            {t('common:right_sidebar.profile')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-[#14b8a6] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Settings size={16} />
                            {t('common:right_sidebar.settings')}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
                        {activeTab === 'profile' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Profile Summary */}
                                <div className="text-center">
                                    <div className="relative inline-block group mb-4">
                                        <div className="w-24 h-24 rounded-3xl bg-[#dff7f4] flex items-center justify-center text-[#14b8a6] text-3xl font-bold shadow-xl border-4 border-white overflow-hidden">
                                            A
                                        </div>
                                        <button className="absolute bottom-1 right-1 p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#14b8a6] shadow-lg transition-all transform scale-0 group-hover:scale-100">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{t('dashboard:profile.default_name')}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{t('common:roles.super_admin')}</p>
                                </div>

                                {/* Quick Info */}
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#ccfbf1] transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <AtSign size={16} className="text-[#14b8a6]" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('common:right_sidebar.info.email')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 ml-7">{t('dashboard:profile.default_email')}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#ccfbf1] transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Phone size={16} className="text-[#14b8a6]" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('common:right_sidebar.info.phone')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 ml-7">{t('dashboard:profile.default_phone')}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#ccfbf1] transition-colors">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Clock size={16} className="text-[#0f766e]" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{t('common:right_sidebar.info.joined')}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 ml-7">{t('dashboard:profile.default_joined')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                {/* Settings Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">{t('common:right_sidebar.preferences.title')}</h4>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Type size={16} className="text-[#14b8a6]" />
                                            <span className="text-sm font-bold text-slate-700">{t('common:right_sidebar.preferences.font_size')}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {fontSizeOptions.map((option) => {
                                                const isActive = preferences.fontSize === option.value;

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => updatePreference('fontSize', option.value)}
                                                        className={`h-10 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${isActive
                                                            ? 'border-[#14b8a6] bg-[#dff7f4] text-[#0f766e] shadow-sm'
                                                            : 'border-slate-200 bg-white text-slate-500 hover:border-[#14b8a6] hover:text-[#0f766e]'
                                                            }`}
                                                    >
                                                        {isActive && <Check size={13} />}
                                                        {t(option.labelKey)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={handleSavePreferences}
                            className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                        >
                            {t('right_sidebar.apply_changes')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default RightSidebar;
