import { useCallback, useMemo, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

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



const TAB_KEYS: TabKey[] = ['dashboard', 'logs', 'settings'];



function parseTab(value: string | null): TabKey {

    if (value && TAB_KEYS.includes(value as TabKey)) {

        return value as TabKey;

    }

    return 'dashboard';

}



export default function ChatbotHub() {

    const { t } = useTranslation('chatbot');

    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = parseTab(searchParams.get('tab'));
    const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(() => new Set());

    const logsFetchEnabled = activeTab === 'logs' || visitedTabs.has('logs');
    const settingsFetchEnabled = activeTab === 'settings' || visitedTabs.has('settings');

    const setActiveTab = useCallback(

        (key: TabKey) => {
            setVisitedTabs((prev) => {
                if (prev.has(key)) return prev;
                const next = new Set(prev);
                next.add(key);
                return next;
            });

            setSearchParams(

                (prev) => {

                    const next = new URLSearchParams(prev);

                    if (key === 'dashboard') {

                        next.delete('tab');

                    } else {

                        next.set('tab', key);

                    }

                    return next;

                },

                { replace: true }

            );

        },

        [setSearchParams]

    );



    const tabs = useMemo(

        () => [

            { key: 'dashboard' as const, label: t('tabs.dashboard'), icon: LayoutDashboard },

            { key: 'logs' as const, label: t('tabs.logs'), icon: History },

            { key: 'settings' as const, label: t('tabs.settings'), icon: Settings },

        ],

        [t]

    );



    return (

        <div className="min-h-screen bg-slate-50/50 pb-20" data-testid="chatbot-hub">

            {/* Page Header */}

            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs">

                <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

                    <div>

                        <div className="mb-1" data-testid="chatbot-breadcrumbs">

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

                <div

                    className="flex flex-wrap gap-2 border-b border-slate-200 pb-px"

                    role="tablist"

                    aria-label={t('title')}

                >

                    {tabs.map((tab) => {

                        const Icon = tab.icon;

                        const isSelected = activeTab === tab.key;

                        return (

                            <button

                                key={tab.key}

                                type="button"

                                role="tab"

                                id={`chatbot-tab-${tab.key}-btn`}

                                aria-selected={isSelected}

                                aria-controls={`chatbot-tabpanel-${tab.key}`}

                                data-testid={`chatbot-tab-${tab.key}`}

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



                {/* Tab Contents — keep mounted to preserve filter/form state */}

                <div className="mt-8">

                    <div

                        id="chatbot-tabpanel-dashboard"
                        data-testid="chatbot-tabpanel-dashboard"
                        role="tabpanel"

                        aria-labelledby="chatbot-tab-dashboard-btn"

                        hidden={activeTab !== 'dashboard'}

                        className={activeTab !== 'dashboard' ? 'hidden' : undefined}

                    >

                        <DashboardTab isActive={activeTab === 'dashboard'} />

                    </div>

                    <div

                        id="chatbot-tabpanel-logs"
                        data-testid="chatbot-tabpanel-logs"
                        role="tabpanel"

                        aria-labelledby="chatbot-tab-logs-btn"

                        hidden={activeTab !== 'logs'}

                        className={activeTab !== 'logs' ? 'hidden' : undefined}

                    >

                        <LogsTab fetchEnabled={logsFetchEnabled} isActive={activeTab === 'logs'} />

                    </div>

                    <div

                        id="chatbot-tabpanel-settings"
                        data-testid="chatbot-tabpanel-settings"
                        role="tabpanel"

                        aria-labelledby="chatbot-tab-settings-btn"

                        hidden={activeTab !== 'settings'}

                        className={activeTab !== 'settings' ? 'hidden' : undefined}

                    >

                        <CacheSettingsTab fetchEnabled={settingsFetchEnabled} isActive={activeTab === 'settings'} />

                    </div>

                </div>

            </div>

        </div>

    );

}


