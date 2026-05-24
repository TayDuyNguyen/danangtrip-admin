import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileDown, MapPin, LayoutDashboard, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useLocationsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import LocationReportFilterBar from './components/LocationReportFilterBar';
import LocationStatsCards from './components/LocationStatsCards';
import LocationReportCharts from './components/LocationReportCharts';
import LocationReportTables from './components/LocationReportTables';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { LocationReportFilters, LocationReportViewModel } from '@/dataHelper/report.dataHelper';

// Date utility helpers
const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

/** Default active tab for the table */
type TabType = 'views' | 'favorites' | 'ratings';

const TAB_SORT_MAP: Record<TabType, string> = {
    views: 'view_count',
    favorites: 'favorite_count',
    ratings: 'avg_rating',
};

/**
 * Generate premium mock data fallback when API endpoints are not ready
 */
const getMockLocationReportData = (
    filters: LocationReportFilters,
    activeTab: TabType
): LocationReportViewModel => {
    const stats = {
        total: 154,
        active: 142,
        featured: 24,
        totalViews: 842600,
    };

    const categories = [
        { name: "Điểm tham quan", value: 45 },
        { name: "Ẩm thực", value: 38 },
        { name: "Khách sạn / Lưu trú", value: 28 },
        { name: "Giải trí & Mua sắm", value: 22 },
        { name: "Bãi biển", value: 21 },
    ];

    const districts = [
        { name: "Hải Châu", value: 35 },
        { name: "Sơn Trà", value: 32 },
        { name: "Ngũ Hành Sơn", value: 28 },
        { name: "Thanh Khê", value: 20 },
        { name: "Liên Chiểu", value: 18 },
        { name: "Cẩm Lệ", value: 11 },
        { name: "Hòa Vang", value: 10 },
    ];

    const categoryNames: Record<string, string> = {
        "1": "Điểm tham quan",
        "2": "Ẩm thực",
        "3": "Khách sạn / Lưu trú",
        "4": "Giải trí & Mua sắm",
        "5": "Bãi biển",
    };

    const rawMockLocations = [
        { id: 1, name: "Bà Nà Hills - Đường lên tiên cảnh", categoryId: 1, categoryName: "Điểm tham quan", district: "Hòa Vang", views: 125400, favorites: 8520, rating: 4.8, status: "active" as const },
        { id: 2, name: "Cầu Vàng (Golden Bridge)", categoryId: 1, categoryName: "Điểm tham quan", district: "Hòa Vang", views: 98600, favorites: 7240, rating: 4.9, status: "active" as const },
        { id: 3, name: "Bán đảo Sơn Trà & Chùa Linh Ứng", categoryId: 1, categoryName: "Điểm tham quan", district: "Sơn Trà", views: 88200, favorites: 6540, rating: 4.7, status: "active" as const },
        { id: 4, name: "Ngũ Hành Sơn (Marble Mountains)", categoryId: 1, categoryName: "Điểm tham quan", district: "Ngũ Hành Sơn", views: 76500, favorites: 4320, rating: 4.5, status: "active" as const },
        { id: 5, name: "Bãi biển Mỹ Khê", categoryId: 5, categoryName: "Bãi biển", district: "Sơn Trà", views: 112000, favorites: 9800, rating: 4.8, status: "active" as const },
        { id: 6, name: "Cầu Rồng Đà Nẵng", categoryId: 1, categoryName: "Điểm tham quan", district: "Hải Châu", views: 94000, favorites: 5600, rating: 4.6, status: "active" as const },
        { id: 7, name: "Chợ Hàn Đà Nẵng", categoryId: 4, categoryName: "Giải trí & Mua sắm", district: "Hải Châu", views: 65000, favorites: 3200, rating: 4.3, status: "active" as const },
        { id: 8, name: "Công viên Châu Á (Asia Park)", categoryId: 4, categoryName: "Giải trí & Mua sắm", district: "Hải Châu", views: 58000, favorites: 2900, rating: 4.4, status: "active" as const },
        { id: 9, name: "Bảo tàng Điêu khắc Chăm", categoryId: 1, categoryName: "Điểm tham quan", district: "Hải Châu", views: 32000, favorites: 1200, rating: 4.5, status: "active" as const },
        { id: 10, name: "Đèo Hải Vân - Thiên hạ đệ nhất hùng quan", categoryId: 1, categoryName: "Điểm tham quan", district: "Liên Chiểu", views: 71000, favorites: 5200, rating: 4.7, status: "active" as const },
        { id: 11, name: "Suối khoáng nóng Núi Thần Tài", categoryId: 4, categoryName: "Giải trí & Mua sắm", district: "Hòa Vang", views: 49000, favorites: 3800, rating: 4.6, status: "active" as const },
        { id: 12, name: "Rạn Nam Ô - Vẻ đẹp hoang sơ", categoryId: 5, categoryName: "Bãi biển", district: "Liên Chiểu", views: 24000, favorites: 1900, rating: 4.2, status: "inactive" as const },
        { id: 13, name: "Nhà hàng Hải sản Bé Mặn", categoryId: 2, categoryName: "Ẩm thực", district: "Sơn Trà", views: 54000, favorites: 3500, rating: 4.4, status: "active" as const },
        { id: 14, name: "InterContinental Danang Sun Peninsula Resort", categoryId: 3, categoryName: "Khách sạn / Lưu trú", district: "Sơn Trà", views: 42000, favorites: 4100, rating: 4.9, status: "active" as const },
        { id: 15, name: "Mì Quảng Bà Mua", categoryId: 2, categoryName: "Ẩm thực", district: "Thanh Khê", views: 38000, favorites: 2400, rating: 4.3, status: "active" as const },
        { id: 16, name: "Bánh tráng cuốn thịt heo Trần", categoryId: 2, categoryName: "Ẩm thực", district: "Hải Châu", views: 45000, favorites: 2800, rating: 4.4, status: "active" as const },
        { id: 17, name: "Chợ đêm Sơn Trà", categoryId: 4, categoryName: "Giải trí & Mua sắm", district: "Sơn Trà", views: 52000, favorites: 3100, rating: 4.2, status: "active" as const },
        { id: 18, name: "Novotel Danang Premier Han River", categoryId: 3, categoryName: "Khách sạn / Lưu trú", district: "Hải Châu", views: 36000, favorites: 2200, rating: 4.7, status: "active" as const },
        { id: 19, name: "Bãi biển Non Nước", categoryId: 5, categoryName: "Bãi biển", district: "Ngũ Hành Sơn", views: 28000, favorites: 1500, rating: 4.5, status: "active" as const },
        { id: 20, name: "Cầu tình yêu Đà Nẵng", categoryId: 1, categoryName: "Điểm tham quan", district: "Sơn Trà", views: 82000, favorites: 6800, rating: 4.6, status: "active" as const }
    ];

    // Filter locations
    let filteredList = [...rawMockLocations];

    if (filters.category_id && filters.category_id !== "all") {
        const catName = categoryNames[filters.category_id];
        if (catName) {
            filteredList = filteredList.filter(item => item.categoryName === catName);
        } else {
            filteredList = filteredList.filter(item => String(item.categoryId) === String(filters.category_id));
        }
    }

    if (filters.district && filters.district !== "all") {
        filteredList = filteredList.filter(item => item.district === filters.district);
    }

    if (filters.status && filters.status !== "all") {
        filteredList = filteredList.filter(item => item.status === filters.status);
    }

    // Sort locations based on activeTab
    filteredList.sort((a, b) => {
        if (activeTab === "views") {
            return b.views - a.views;
        } else if (activeTab === "favorites") {
            return b.favorites - a.favorites;
        } else {
            return b.rating - a.rating;
        }
    });

    const totalCount = filteredList.length;
    const perPage = filters.per_page || 10;
    const page = filters.page || 1;
    const offset = (page - 1) * perPage;
    const paginatedItems = filteredList.slice(offset, offset + perPage).map(item => ({
        id: item.id,
        name: item.name,
        categoryName: item.categoryName,
        district: item.district,
        views: item.views,
        favorites: item.favorites,
        rating: item.rating,
        status: item.status,
    }));

    return {
        stats,
        charts: {
            categories,
            districts,
        },
        table: {
            items: paginatedItems,
            pagination: {
                currentPage: page,
                lastPage: Math.ceil(totalCount / perPage) || 1,
                perPage,
                total: totalCount,
            },
        },
    };
};

/**
 * LocationReport page — step 04 skeleton.
 * Data integration and chart/table components will be wired in steps 05–07.
 */
const LocationReport: React.FC = () => {
    const { t } = useTranslation('location_report');
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMockMode, setIsMockMode] = useState<boolean>(false);
    const [hasAttemptedRealApi, setHasAttemptedRealApi] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<TabType>('views');

    // 1. Initialise filters from URL SearchParams
    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo   = searchParams.get('to')   || getToday();
    const initialCat  = searchParams.get('category_id') || 'all';
    const initialDist = searchParams.get('district')    || 'all';
    const initialSt   = (searchParams.get('status') as LocationReportFilters['status']) || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;

    const [localFilters, setLocalFilters] = useState<Omit<LocationReportFilters, 'page' | 'per_page'>>({
        from:        initialFrom,
        to:          initialTo,
        category_id: initialCat,
        district:    initialDist,
        status:      initialSt,
    });

    const [activeFilters, setActiveFilters] = useState<LocationReportFilters>({
        from:        initialFrom,
        to:          initialTo,
        category_id: initialCat,
        district:    initialDist,
        status:      initialSt,
        page:        initialPage,
        per_page:    10,
    });

    // 2. Sync active filters back into URL
    useEffect(() => {
        const newParams: Record<string, string> = {
            from:  activeFilters.from || '',
            to:    activeFilters.to   || '',
            page:  String(activeFilters.page),
        };
        if (activeFilters.category_id && activeFilters.category_id !== 'all') {
            newParams.category_id = String(activeFilters.category_id);
        }
        if (activeFilters.district && activeFilters.district !== 'all') {
            newParams.district = activeFilters.district;
        }
        if (activeFilters.status && activeFilters.status !== 'all') {
            newParams.status = activeFilters.status;
        }
        setSearchParams(newParams);
    }, [activeFilters, setSearchParams]);

    // 3. TanStack Query — fetch combined locations report data
    const {
        data:      realData,
        isLoading: isRealLoading,
        isError:   isRealError,
        refetch,
        isFetching: isRealFetching,
    } = useLocationsReportQuery(
        { from: activeFilters.from, to: activeFilters.to },
        {
            ...activeFilters,
            sort_by:    TAB_SORT_MAP[activeTab],
            sort_order: 'desc',
        }
    );

    // Auto-switch to mock on API error
    useEffect(() => {
        if (isRealError && !isMockMode && !hasAttemptedRealApi) {
            const timer = setTimeout(() => {
                setIsMockMode(true);
                setHasAttemptedRealApi(true);
                toast.warning(t('mock.toast_to_mock'));
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isRealError, isMockMode, hasAttemptedRealApi, t]);

    // 4. Report mutation hooks
    const { exportLocationsMutation } = useReportMutations();

    // State composition
    const isLoading  = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    const data = isMockMode ? getMockLocationReportData(activeFilters, activeTab) : realData;

    // 5. Handler functions
    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters(prev => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => {
        if (localFilters.from && localFilters.to && new Date(localFilters.from) > new Date(localFilters.to)) {
            toast.error(t('filter.validation.date_range'));
            return;
        }
        setActiveFilters(prev => ({ ...prev, ...localFilters, page: 1 }));
    };

    const handleResetFilters = () => {
        const defaults = {
            from:        getFirstDayOfMonth(),
            to:          getToday(),
            category_id: 'all',
            district:    'all',
            status:      'all' as const,
        };
        setLocalFilters(defaults);
        setActiveFilters({ ...defaults, page: 1, per_page: 10 });
        toast.info(t('filter.toast_reset'));
    };

    const handlePageChange = (newPage: number) => {
        setActiveFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setActiveFilters(prev => ({ ...prev, page: 1 }));
    };

    const handleExportCSV = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const fallbackFilename = `bao-cao-dia-diem_${activeFilters.from}_to_${activeFilters.to}_${dateStr}.csv`;

            if (isMockMode) {
                toast.loading(t('export.toast_mock_loading'));
                setTimeout(() => {
                    toast.dismiss();
                    toast.success(t('export.toast_mock_success'));
                    // BOM + basic CSV for Vietnamese characters
                    const bom = '\uFEFF';
                    const headers = 'ID,Tên địa điểm,Danh mục,Quận/Huyện,Lượt xem,Yêu thích,Đánh giá,Trạng thái\n';
                    const blob = new Blob([bom + headers], { type: 'text/csv;charset=utf-8;' });
                    const url  = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', fallbackFilename);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }, 1000);
                return;
            }

            toast.promise(
                exportLocationsMutation.mutateAsync({ params: activeFilters, fallbackFilename }),
                {
                    loading: t('export.toast_loading'),
                    success: t('export.toast_success'),
                    error:   t('export.toast_error'),
                }
            );
        } catch {
            // Captured inside toast.promise
        }
    };

    const toggleMockMode = () => {
        const next = !isMockMode;
        setIsMockMode(next);
        toast.success(next ? t('mock.toast_switched_mock') : t('mock.toast_switched_real'));
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
            {/* 1. Page Header & Breadcrumb */}
            <div className="flex flex-col gap-3">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider select-none px-1">
                    <span className="hover:text-[#14b8a6] cursor-pointer flex items-center gap-1 transition-colors duration-150">
                        <LayoutDashboard size={13} />
                        {t('breadcrumb.home')}
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="hover:text-[#14b8a6] cursor-pointer transition-colors duration-150">{t('breadcrumb.reports')}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-[#14b8a6]">{t('breadcrumb.current')}</span>
                </div>

                {/* ─── Gradient border shell header card ─── */}
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-[#14b8a6]/25 via-slate-200/20 to-transparent shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-white/98 backdrop-blur-sm rounded-[23px] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#14b8a6]/10 text-[#14b8a6] border border-[#14b8a6]/20 rounded-2xl flex items-center justify-center shadow-xs shrink-0">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h1 className="text-[22px] font-black text-[#0F172A] tracking-tight leading-tight">{t('title')}</h1>
                                <p className="text-xs font-bold text-[#94A3B8] mt-1">{t('subtitle')}</p>
                            </div>
                        </div>

                        {/* Header actions */}
                        <div className="flex items-center gap-2">
                            {/* Mock Mode toggle */}
                            <button
                                type="button"
                                id="location-report-mock-toggle"
                                onClick={toggleMockMode}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                                    isMockMode
                                        ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-2xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 shadow-2xs'
                                }`}
                                title={t('mock.toggle_title')}
                            >
                                <Sparkles size={13} className={isMockMode ? 'animate-bounce text-amber-500' : ''} />
                                {isMockMode ? t('mock.mock_on') : t('mock.mock_off')}
                            </button>

                            {/* Export CSV */}
                            <button
                                type="button"
                                id="location-report-export-btn"
                                onClick={handleExportCSV}
                                disabled={isLoading || isFetching || exportLocationsMutation.isPending}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-white border border-[#E2E8F0] hover:border-[#14b8a6] hover:bg-[#14b8a6]/5 hover:text-[#14b8a6] shadow-xs active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 cursor-pointer select-none text-[#0F172A]/80"
                            >
                                {exportLocationsMutation.isPending ? (
                                    <div className="w-4 h-4 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FileDown size={16} />
                                )}
                                {t('export.btn_label')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Error state — API failed and not in mock mode */}
            {isRealError && !isMockMode ? (
                <div className="p-[1px] rounded-3xl bg-gradient-to-br from-red-500/20 via-slate-200/25 to-slate-100/10 shadow-xs max-w-lg mx-auto mt-12 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[23px] p-8 text-center flex flex-col items-center justify-center font-sans">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-[#0F172A]">{t('error.load_failed')}</h3>
                            <p className="text-xs font-bold text-[#94A3B8] mt-1.5">{t('error.connection')}</p>
                        </div>
                        <div className="flex gap-2 justify-center mt-6">
                            <button
                                onClick={() => refetch()}
                                className="inline-flex items-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <RefreshCw size={15} />
                                {t('error.retry_btn')}
                            </button>
                            <button
                                onClick={toggleMockMode}
                                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl active:scale-95 transition-all shadow-md cursor-pointer"
                            >
                                <Sparkles size={15} />
                                {t('error.use_mock_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* 3. Filter Bar */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-75">
                        <LocationReportFilterBar
                            filters={localFilters}
                            onFilterChange={handleLocalFilterChange}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                            isSubmitting={isLoading || isFetching}
                        />
                    </div>

                    {/* 4. KPI Stats Cards */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
                        <LocationStatsCards
                            stats={data?.stats}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 5. Distribution Charts */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-200">
                        <LocationReportCharts
                            data={data?.charts}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* 6. Top Lists Tab Table */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
                        <LocationReportTables
                            data={data?.table}
                            isLoading={isLoading}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default LocationReport;
