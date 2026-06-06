import { Plus, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { ROUTES } from '@/routes/routes';

interface CategoryHeaderProps {
    onAdd: () => void;
}

const CategoryHeader = ({ onAdd }: CategoryHeaderProps) => {
    const { t } = useTranslation('location');

    return (
        <div className="mb-8">
            <div className="mb-6">
                <Breadcrumbs
                    icon={MapPin}
                    items={[
                        { label: 'sidebar.locations', path: ROUTES.LOCATIONS_LIST },
                        { label: 'sidebar.location_categories' }
                    ]}
                    actions={[
                        {
                            labelKey: 'breadcrumb.add',
                            icon: Plus,
                            onClick: onAdd,
                            variant: 'primary',
                        }
                    ]}
                />
            </div>

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#14b8a6] to-[#0f766e] shadow-xl shadow-[#14b8a6]/20">
                        <MapPin size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                            {t('categories.title')}
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500 md:text-base">
                            {t('categories.subtitle')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryHeader;
