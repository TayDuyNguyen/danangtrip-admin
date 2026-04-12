import { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import RightSidebar from '@/components/common/RightSidebar';
import LoadingReact from '@/components/loading';

const MainLayout = () => {
    const { t } = useTranslation('common');
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50/50 font-sans text-slate-900 overflow-hidden antialiased selection:bg-blue-100 selection:text-blue-700">
            {/* Meta tags for SEO Audit compliance and accessibility */}
            <meta name="description" content="Hệ thống quản trị Đà Nẵng Trip Admin" />
            <meta property="og:title" content="Đà Nẵng Trip" />
            <div className="sr-only">
                <h1>{t('title')} - Đà Nẵng Trip Admin</h1>
                <p>Nền tảng quản lý tour du lịch và doanh thu chuyên nghiệp. Tối ưu hóa vận hành doanh nghiệp lữ hành tại Đà Nẵng.</p>
            </div>
            {/* Sidebar Left - Fixed Navigation */}
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header Top - Fixed */}
                <Header />

                {/* Main Content Area - Scrollable */}
                <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-screen-2xl mx-auto w-full overflow-y-auto transition-all duration-300 custom-scrollbar">
                    <Suspense fallback={<LoadingReact />}>
                        <Outlet context={{ setIsRightSidebarOpen }} />
                    </Suspense>

                    {/* Footer inside scroll area (Optional) */}
                    <footer className="mt-10 py-6 text-center border-t border-slate-200/60 text-slate-400 text-[13px] font-medium tracking-tight">
                        {t('footer.copyright')}
                    </footer>
                </main>
            </div>

            {/* Global Right Sidebar - Drawer Style */}
            <RightSidebar 
                isOpen={isRightSidebarOpen} 
                onClose={() => setIsRightSidebarOpen(false)} 
            />

            {/* Temp Button to test RightSidebar if no global state yet */}
            <button 
                onClick={() => setIsRightSidebarOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
                title={t('right_sidebar.title')}
            >
                <div className="relative">
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
            </button>
        </div>
    );
};

export default MainLayout;
