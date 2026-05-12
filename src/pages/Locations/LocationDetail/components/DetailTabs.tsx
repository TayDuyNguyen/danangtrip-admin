import { useTranslation } from 'react-i18next';
import type { LocationViewModel } from '@/dataHelper/location.dataHelper';
import { FiInfo, FiMessageSquare, FiMap } from 'react-icons/fi';
import LocationInfoTab from './LocationInfoTab';
import LocationReviewsTab from './LocationReviewsTab';
import LocationMapTab from './LocationMapTab';

interface DetailTabsProps {
    location: LocationViewModel;
    activeTab: 'info' | 'reviews' | 'map';
    setActiveTab: (tab: 'info' | 'reviews' | 'map') => void;
}

const DetailTabs = ({ location, activeTab, setActiveTab }: DetailTabsProps) => {
    const { t } = useTranslation('location');

    const tabs = [
        { id: 'info', label: t('detail.tabs.info'), icon: FiInfo },
        { id: 'reviews', label: t('detail.tabs.reviews'), icon: FiMessageSquare },
        { id: 'map', label: t('detail.tabs.map'), icon: FiMap },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl w-fit border border-slate-100">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm min-h-[400px]">
                {activeTab === 'info' && <LocationInfoTab location={location} />}
                {activeTab === 'reviews' && <LocationReviewsTab locationId={location.id} />}
                {activeTab === 'map' && <LocationMapTab location={location} />}
            </div>
        </div>
    );
};

export default DetailTabs;
