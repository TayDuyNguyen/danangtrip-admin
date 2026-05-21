import { useTranslation } from 'react-i18next';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewsTableProps {
    reviews: Array<{
        id: string;
        customer: { name: string; avatar: string };
        rating: number;
        comment: string;
        tourTitle: string;
        date: string;
    }>;
}

const ReviewsTable = ({ reviews }: ReviewsTableProps) => {
    const { t } = useTranslation('dashboard');

    return (
        <div className="bg-white border border-slate-200 rounded-4xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16} className="text-[#14b8a6]" />
                        {t('tables.recent_reviews')}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('tables.subtitle_recent_reviews')}</p>
                </div>
                <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    {t('tables.manage_reviews')}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50">
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_customer')}</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_tour')}</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_rating')}</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_comment')}</th>
                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('tables.header_date')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {reviews.map((review) => (
                            <tr key={review.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#dff7f4] flex items-center justify-center text-[#14b8a6] font-black text-xs">
                                            {review.customer.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-900">{review.customer.name}</span>
                                    </div>
                                </td>
                                <td className="py-4">
                                    <span className="text-xs font-bold text-slate-600">{review.tourTitle}</span>
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={12}
                                                className={i < review.rating ? 'fill-[#14b8a6] text-[#14b8a6]' : 'text-slate-200'}
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="py-4">
                                    <p className="text-xs text-slate-500 font-medium max-w-[300px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                                        "{review.comment}"
                                    </p>
                                </td>
                                <td className="py-4 whitespace-nowrap">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{review.date}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewsTable;
