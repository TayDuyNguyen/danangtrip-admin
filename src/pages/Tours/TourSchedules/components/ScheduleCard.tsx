import type { Schedule } from '@/types/schedule';
import { ScheduleStatus } from '@/types/schedule';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { formatCurrency } from '@/utils/pricing';
import { Calendar, Eye, Edit3, Tag, ImageOff, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatAdminShortDate } from '@/utils/dateDisplay';

interface ScheduleCardProps {
    schedule: Schedule;
    onViewDetail?: (id: string | number) => void;
    onEdit?: (id: string | number) => void;
    onDelete?: (id: string | number) => void;
    onStatusChange?: (id: string | number, status: ScheduleStatus) => void;
}

export function ScheduleCard({ 
    schedule, 
    onViewDetail, 
    onEdit,
    onDelete,
    onStatusChange
}: ScheduleCardProps) {
    const { t, i18n } = useTranslation(['schedules', 'common']);

    const getStatusVariant = (status: ScheduleStatus) => {
        switch (status) {
            case ScheduleStatus.AVAILABLE: return 'success';
            case ScheduleStatus.FULL: return 'error';
            case ScheduleStatus.CANCELLED: return 'neutral';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: ScheduleStatus) => {
        switch (status) {
            case ScheduleStatus.AVAILABLE: return t('schedules:status.available');
            case ScheduleStatus.FULL: return t('schedules:status.full');
            case ScheduleStatus.CANCELLED: return t('schedules:status.cancelled');
            default: return status;
        }
    };

    const title = schedule.tourName.trim() || t('schedules:card.untitled_tour');
    const imageAlt = schedule.tourName.trim() || t('schedules:card.image_alt_fallback');

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full group/card">
            {/* Image & Status Badge */}
            <div className="relative h-48 w-full group">
                {schedule.tourImage ? (
                    <img 
                        src={schedule.tourImage} 
                        alt={imageAlt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div 
                        className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-2 text-slate-400"
                        role="img"
                        aria-label={imageAlt}
                    >
                        <ImageOff className="w-10 h-10 opacity-60" />
                        <span className="text-xs font-medium">{t('common:labels.not_available')}</span>
                    </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {schedule.categoryName.trim() ? (
                        <Badge variant="default" className="shadow-sm uppercase">
                            <Tag className="w-3 h-3 mr-1" />
                            {schedule.categoryName}
                        </Badge>
                    ) : null}
                </div>
                <div className="absolute top-3 right-3 group/status">
                    <Badge variant={getStatusVariant(schedule.status)} className="shadow-sm uppercase cursor-pointer">
                        {getStatusLabel(schedule.status)}
                    </Badge>
                    {/* Native Select Overlay for easy status change */}
                    <select
                        value={schedule.status}
                        onChange={(e) => onStatusChange?.(schedule.id, e.target.value as ScheduleStatus)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title={t('common:actions.edit')}
                    >
                        <option value={ScheduleStatus.AVAILABLE}>{t('schedules:status.available')}</option>
                        <option value={ScheduleStatus.FULL}>{t('schedules:status.full')}</option>
                        <option value={ScheduleStatus.CANCELLED}>{t('schedules:status.cancelled')}</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 grow flex flex-col">
                <h3 className="text-gray-900 font-semibold text-lg line-clamp-2 mb-2 min-h-14">
                    {title}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{formatAdminShortDate(schedule.startDate, i18n.language)}</span>
                </div>

                <div className="space-y-4 grow">
                    {/* Capacity Section */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{t('schedules:fields.capacity')}</span>
                            <span className="font-medium text-gray-700">{schedule.bookedSlots}/{schedule.totalSlots}</span>
                        </div>
                        <ProgressBar 
                            value={schedule.bookedSlots} 
                            max={schedule.totalSlots} 
                            color={schedule.status === ScheduleStatus.FULL ? 'red' : 'blue'}
                        />
                    </div>

                    {/* Price Section */}
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-400">{t('schedules:fields.price')}</span>
                        {schedule.priceAdult == null ? (
                            <span className="text-xs text-gray-400 italic">{t('schedules:fields.price_follows_tour')}</span>
                        ) : (
                            <span className="text-red-600 font-bold text-lg">
                                {formatCurrency(schedule.priceAdult)}đ
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-50 flex gap-2">
                <button 
                    onClick={() => onViewDetail?.(schedule.id)}
                    className="grow flex items-center justify-center gap-2 py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors text-sm font-medium"
                >
                    <Eye className="w-4 h-4" />
                    {t('common:actions.view')}
                </button>
                <button 
                    onClick={() => onEdit?.(schedule.id)}
                    className="flex items-center justify-center w-10 h-10 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title={t('common:actions.edit')}
                    type="button"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => {
                        if (window.confirm(t('common:confirm_delete'))) {
                            onDelete?.(schedule.id);
                        }
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title={t('common:actions.delete')}
                    type="button"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default ScheduleCard;
