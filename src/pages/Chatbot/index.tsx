import { useState } from 'react';
import { 
    Bot, 
    LayoutDashboard, 
    History, 
    Settings
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DashboardTab from './components/DashboardTab';
import LogsTab from './components/LogsTab';
import CacheSettingsTab from './components/CacheSettingsTab';

type TabKey = 'dashboard' | 'logs' | 'settings';

export default function ChatbotHub() {
    const { t } = useTranslation('chatbot');
    const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

    const tabs = [
        { key: 'dashboard' as const, label: t('tabs.dashboard'), icon: LayoutDashboard },
        { key: 'logs' as const, label: t('tabs.logs'), icon: History },
        { key: 'settings' as const, label: t('tabs.settings'), icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Page Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div>
                        <div className="mb-1">
                            <Breadcrumbs
                                icon={Bot}
                                items={[
                                    { label: t('breadcrumbs'), path: '/admin/chatbot' }
                                ]}
                            />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                            {t('title')}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Tab Selection Row */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 mt-6">
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-px">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-bold text-sm transition-all cursor-pointer ${
                                    isSelected
                                        ? 'border-[#14b8a6] text-[#0f766e] font-black'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#14b8a6]' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Contents */}
                <div className="mt-8">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'logs' && <LogsTab />}
                    {activeTab === 'settings' && <CacheSettingsTab />}
                </div>
            </div>
        </div>
    );
}
