import { useTranslation } from 'react-i18next';

const HomePage = () => {
    const { t } = useTranslation('home');
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
        </div>
    );
};

export default HomePage;