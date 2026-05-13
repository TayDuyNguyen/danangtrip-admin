import { useTranslation } from 'react-i18next';
import { FiMapPin, FiNavigation } from 'react-icons/fi';

import type { LocationViewModel } from '@/dataHelper/location.dataHelper';

interface LocationMapTabProps {
    location: LocationViewModel;
}

const LocationMapTab = ({ location }: LocationMapTabProps) => {
    const { t } = useTranslation('location');
    const hasCoordinates = typeof location.latitude === 'number' && typeof location.longitude === 'number';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[24px] bg-indigo-50 border border-indigo-100">
                <div className="space-y-1">
                    <h3 className="text-[14px] font-bold text-indigo-900 uppercase tracking-tight flex items-center gap-2">
                        <FiMapPin className="text-primary" />
                        {t('detail.map.coordinates')}
                    </h3>
                    <p className="text-sm font-medium text-indigo-700/70">
                        {hasCoordinates ? `${location.latitude}, ${location.longitude}` : t('detail.map.no_coordinates')}
                    </p>
                </div>
                {hasCoordinates && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl bg-white text-primary text-sm font-bold shadow-sm border border-indigo-100 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                    >
                        <FiNavigation size={16} />
                        {t('detail.map.directions')}
                    </a>
                )}
            </div>

            <div className="aspect-21/9 w-full rounded-[32px] overflow-hidden border border-slate-100 shadow-inner bg-slate-100 relative group">
                {hasCoordinates ? (
                    <iframe
                        title={t('detail.tabs.map')}
                        src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                        className="h-full w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                        <FiMapPin size={40} className="mb-3" />
                        <p className="text-sm font-semibold">{t('detail.map.no_coordinates')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocationMapTab;
