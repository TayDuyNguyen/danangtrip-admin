import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiImage, FiMapPin, FiMaximize2, FiStar } from 'react-icons/fi';

import Badge from '@/components/ui/Badge';
import type { LocationViewModel } from '@/dataHelper/location.dataHelper';

interface DetailHeroProps {
    location: LocationViewModel;
}

const DetailHero = ({ location }: DetailHeroProps) => {
    const { t } = useTranslation('location');
    const [selectedImage, setSelectedImage] = useState(location.thumbnail || location.images?.[0] || '');

    const gallery = [location.thumbnail, ...(location.images || [])].filter(Boolean) as string[];

    return (
        <div className="relative group overflow-hidden rounded-[32px] bg-white border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                {selectedImage ? (
                    <img
                        src={selectedImage}
                        alt={location.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <FiImage size={64} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">{t('detail.hero.no_images')}</span>
                    </div>
                )}

                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-white/40 shadow-xl flex items-end justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary/10 text-primary border-none text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                                {location.category}
                            </Badge>
                            {location.isFeatured && (
                                <Badge className="bg-amber-100 text-amber-600 border-none text-[11px] font-bold uppercase tracking-wider px-2.5 py-1">
                                    {t('stats.featured')}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-900">
                            <FiMapPin size={16} className="text-primary" />
                            <span className="text-sm font-medium">{location.district}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end mb-0.5">
                                <FiStar 
                                    size={18} 
                                    fill={location.rating > 0 ? "currentColor" : "none"} 
                                    className={location.rating > 0 ? "text-amber-500" : "text-slate-300"} 
                                />
                                <span className={`text-xl font-bold ${location.rating > 0 ? "text-slate-900" : "text-slate-400"}`}>
                                    {location.rating > 0 ? location.rating : '—'}
                                </span>
                            </div>
                            <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-tight">
                                {location.reviewCount > 0 
                                    ? `${location.reviewCount} ${t('detail.stats.ratings')}`
                                    : t('detail.reviews.empty')}
                            </p>
                        </div>
                    </div>
                </div>

                <button className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-900/40 text-white backdrop-blur-sm border border-white/20 hover:bg-slate-900/60 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                    <FiMaximize2 size={20} />
                </button>
            </div>

            {gallery.length > 1 && (
                <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                    {gallery.map((img, idx) => (
                        <button
                            key={`${img}-${idx}`}
                            onClick={() => setSelectedImage(img)}
                            className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${
                                selectedImage === img
                                    ? 'border-primary shadow-lg scale-95'
                                    : 'border-transparent hover:border-slate-200 grayscale-[0.5] hover:grayscale-0'
                            }`}
                        >
                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DetailHero;
