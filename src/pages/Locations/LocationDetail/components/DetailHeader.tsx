import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/routes/routes';
import { Button } from '@/components/ui/Button';
import { FiArrowLeft, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useAuth } from '@/store';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { MapPin } from 'lucide-react';
import { cn } from '@/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface DetailHeaderProps {
    isScrolled: boolean;
    isLoading?: boolean;
    name?: string;
    district?: string;
    id?: number;
    onDeleteClick: () => void;
}

const DetailHeader = ({
    isScrolled,
    isLoading = false,
    name,
    district,
    id,
    onDeleteClick,
}: DetailHeaderProps) => {
    const { t } = useTranslation(['location', 'common']);
    const navigate = useNavigate();
    const { user } = useAuth();

    const goToList = () => navigate(ROUTES.LOCATIONS_LIST);

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-xs transition-all duration-300">
            <div
                className={cn(
                    'w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4 transition-all duration-300',
                    isScrolled ? 'py-2' : 'min-h-20 py-3'
                )}
            >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <button
                        type="button"
                        onClick={goToList}
                        aria-label={t('location:detail.back_to_list')}
                        className="shrink-0 rounded-full w-10 h-10 p-0 hover:bg-slate-100 cursor-pointer flex items-center justify-center border-0 bg-transparent text-slate-600"
                    >
                        <FiArrowLeft size={20} />
                    </button>

                    <div className="min-w-0 flex-1">
                        <div
                            className={cn(
                                'transition-all duration-300',
                                isScrolled ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100 h-auto mb-1'
                            )}
                        >
                            <Breadcrumbs
                                icon={MapPin}
                                items={[
                                    { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                                    { label: 'sidebar.location_list', path: ROUTES.LOCATIONS_LIST },
                                    { label: 'breadcrumb.view' },
                                ]}
                            />
                        </div>

                        <h1
                            className={cn(
                                'font-bold text-slate-900 tracking-tight leading-tight flex flex-wrap items-center gap-x-2 gap-y-1 transition-all duration-300',
                                isScrolled ? 'text-base' : 'text-xl'
                            )}
                        >
                            <span className="whitespace-nowrap">{t('location:detail.title')}</span>
                            {isScrolled && (
                                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 animate-in fade-in slide-in-from-left-2 duration-300">
                                    {t('common:breadcrumb.view')}
                                </span>
                            )}
                            {!isLoading && name && (
                                <>
                                    <span className="text-slate-300 font-light">·</span>
                                    <span className="truncate max-w-[200px] sm:max-w-md">{name}</span>
                                </>
                            )}
                        </h1>

                        {!isLoading && name && (
                            <p
                                className={cn(
                                    'text-xs text-slate-400 font-medium truncate select-all transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                )}
                            >
                                {district ? `${district} · ${name}` : name}
                            </p>
                        )}

                        {isLoading && (
                            <div
                                className={cn(
                                    'transition-all duration-300',
                                    isScrolled ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto mt-1'
                                )}
                            >
                                <Skeleton className="h-3 w-48 rounded-md" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:flex shrink-0 items-center gap-2">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-10 w-24 rounded-xl" />
                            <Skeleton className="h-10 w-28 rounded-xl" />
                        </>
                    ) : (
                        user?.role === 'admin' &&
                        id != null && (
                            <>
                                <Button
                                    variant="primary"
                                    className="rounded-xl gap-2 h-10 px-4"
                                    aria-label={t('location:detail.edit')}
                                    onClick={() => navigate(ROUTES.LOCATIONS_EDIT.replace(':id', id.toString()))}
                                >
                                    <FiEdit2 size={16} />
                                    <span className="hidden sm:inline">{t('location:detail.edit')}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-2 h-10 px-4"
                                    aria-label={t('location:detail.delete')}
                                    onClick={onDeleteClick}
                                >
                                    <FiTrash2 size={16} />
                                    <span className="hidden sm:inline">{t('location:detail.delete')}</span>
                                </Button>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailHeader;
