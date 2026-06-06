import { useTranslation } from 'react-i18next';
import {
    FiCheckCircle,
    FiClock,
    FiGlobe,
    FiMail,
    FiMapPin,
    FiPhone,
} from 'react-icons/fi';

import type { LocationViewModel, OpeningHours } from '@/dataHelper/location.dataHelper';

interface LocationInfoTabProps {
    location: LocationViewModel;
}

const LocationInfoTab = ({ location }: LocationInfoTabProps) => {
    const { t } = useTranslation('location');

    const renderOpeningHours = (val: string | string[] | OpeningHours | undefined) => {
        if (!val) return null;
        if (typeof val === 'string') {
            return (
                <p className="text-sm font-bold text-slate-800">
                    {val}
                </p>
            );
        }
        if (Array.isArray(val)) {
            return (
                <div className="space-y-1 pt-1">
                    {val.map((timeRange) => (
                        <div
                            key={timeRange}
                            className="text-[13px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-100 shadow-sm w-fit"
                        >
                            {timeRange}
                        </div>
                    ))}
                </div>
            );
        }

        const daysOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        return (
            <div className="grid grid-cols-1 gap-1.5 pt-1">
                {daysOrder.map((day) => {
                    const time = val[day];
                    if (!time) return null;
                    return (
                        <div key={day} className="flex justify-between items-center gap-6">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter w-12">
                                {t(`detail.days.${day}`)}
                            </span>
                            <span className="text-[13px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-slate-100 shadow-sm">
                                {time}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const contactItems = [
        { icon: FiMapPin, label: t('detail.info.address'), value: location.address, type: 'text' },
        { icon: FiPhone, label: t('detail.info.phone'), value: location.phone, type: 'text' },
        { icon: FiMail, label: t('detail.info.email'), value: location.email, type: 'text' },
        { icon: FiGlobe, label: t('detail.info.website'), value: location.website, type: 'link' },
        { icon: FiClock, label: t('detail.info.opening_hours'), value: location.openingHours, type: 'hours' },
    ].filter((item) => item.value);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full" />
                    {t('detail.info.description')}
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                    {location.description ? (
                        <p className="whitespace-pre-line">{location.description}</p>
                    ) : (
                        <p className="italic text-slate-400">{t('detail.info.no_description')}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary rounded-full" />
                        {t('detail.info.contact')}
                    </h3>
                    <div className="space-y-4">
                        {contactItems.map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group">
                                <div className="p-2.5 h-fit rounded-xl bg-white text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <item.icon size={18} />
                                </div>
                                <div className="flex-1 space-y-0.5 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        {item.label}
                                    </p>
                                    {item.type === 'link' ? (
                                        <a
                                            href={(item.value as string)?.startsWith('http') ? (item.value as string) : `https://${item.value}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-slate-800 hover:text-primary transition-colors block truncate max-w-[240px] sm:max-w-[320px] lg:max-w-[400px]"
                                            title={item.value as string}
                                        >
                                            {item.value as string}
                                        </a>
                                    ) : item.type === 'hours' ? (
                                        renderOpeningHours(item.value as string | string[] | OpeningHours | undefined)
                                    ) : (
                                        <p className="text-sm font-bold text-slate-800">
                                            {item.value as string}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" />
                            {t('detail.info.price_range')}
                        </h3>
                        <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                                    {t('detail.info.price_estimate')}
                                </p>
                                <p className="text-xl font-black text-indigo-900">
                                    {location.priceMin && location.priceMax
                                        ? `${location.priceMin.toLocaleString()} - ${location.priceMax.toLocaleString()} VND`
                                        : t('detail.info.no_price')}
                                </p>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white text-indigo-600 font-bold shadow-sm border border-indigo-100">
                                {t(`priceLevels.${location.priceLevelKey}`)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" />
                            {t('detail.info.amenities')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {location.amenities.length > 0 ? (
                                location.amenities.map((amenity) => (
                                    <div
                                        key={amenity}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[13px] font-semibold"
                                    >
                                        <FiCheckCircle size={14} className="text-green-500" />
                                        {amenity}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm italic text-slate-400">{t('detail.info.no_amenities')}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" />
                            {t('detail.info.tags', 'Tags')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {location.tags && location.tags.length > 0 ? (
                                location.tags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[13px] font-semibold"
                                    >
                                        <span className="text-primary font-bold">#</span>
                                        {tag}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm italic text-slate-400">{t('detail.info.no_tags', 'Không có tag')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationInfoTab;
