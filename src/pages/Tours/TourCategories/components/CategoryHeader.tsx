import { Plus, Map } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { ROUTES } from '@/routes/routes';

interface CategoryHeaderProps {
    onAdd: () => void;
}

const CategoryHeader = ({ onAdd }: CategoryHeaderProps) => {
    const { t } = useTranslation(['tour', 'common']);

    return (
        <div className="mb-8">
            <Breadcrumbs
                icon={Map}
                items={[
                    { label: 'sidebar.tours', path: ROUTES.TOURS_LIST },
                    { label: 'sidebar.tour_categories' }
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

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center mt-6">
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
    );
};

export default CategoryHeader;
