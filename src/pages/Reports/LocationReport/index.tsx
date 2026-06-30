import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocationsReportQuery, useReportMutations } from '@/hooks/useReportQueries';
import useReportMockMode, { useReportApiErrorToast } from '../shared/useReportMockMode';
import { REPORTS_MOCK_PARAM, parseReportPerPage } from '../shared/reports.constants';
import ReportPageShell from '../shared/ReportPageShell';
import { downloadMockCsv } from '../shared/mockExportCsv';
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
    const { t } = useTranslation(['location_report', 'reports_common']);
    const { t: tCommon } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMockMode, toggleMockMode, enableMockMode } = useReportMockMode();
    const [activeTab, setActiveTab] = useState<TabType>('views');

    const initialFrom = searchParams.get('from') || getFirstDayOfMonth();
    const initialTo   = searchParams.get('to')   || getToday();
    const initialCat  = searchParams.get('category_id') || 'all';
    const initialDist = searchParams.get('district')    || 'all';
    const initialSt   = (searchParams.get('status') as LocationReportFilters['status']) || 'all';
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialPerPage = parseReportPerPage(searchParams.get('per_page'));

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
        per_page:    initialPerPage,
    });

    useEffect(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('from', activeFilters.from || '');
            next.set('to', activeFilters.to || '');
            next.set('page', String(activeFilters.page));
            next.set('per_page', String(activeFilters.per_page));
            if (activeFilters.category_id && activeFilters.category_id !== 'all') {
                next.set('category_id', String(activeFilters.category_id));
            } else next.delete('category_id');
            if (activeFilters.district && activeFilters.district !== 'all') {
                next.set('district', activeFilters.district);
            } else next.delete('district');
            if (activeFilters.status && activeFilters.status !== 'all') {
                next.set('status', activeFilters.status);
            } else next.delete('status');
            if (isMockMode) next.set(REPORTS_MOCK_PARAM, '1');
            else next.delete(REPORTS_MOCK_PARAM);
            return next;
        }, { replace: true });
    }, [activeFilters, isMockMode, setSearchParams]);

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
        },
        { enabled: !isMockMode }
    );

    useReportApiErrorToast(isRealError, isMockMode);
    const showErrorPanel = isRealError && !isMockMode;

    // 4. Report mutation hooks
    const { exportLocationsMutation } = useReportMutations();

    // State composition
    const isLoading  = !isMockMode && isRealLoading;
    const isFetching = !isMockMode && isRealFetching;
    const data = isMockMode ? getMockLocationReportData(activeFilters, activeTab) : realData;

    // 5. Handler functions
    const applyFilterValues = useCallback((values: typeof localFilters) => {
        if (values.from && values.to && new Date(values.from) > new Date(values.to)) {
            toast.error(t('filter.validation.date_range'));
            return;
        }
        setLocalFilters(values);
        setActiveFilters((prev) => ({ ...prev, ...values, page: 1 }));
    }, [t]);

    const handleLocalFilterChange = (updated: Partial<typeof localFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...updated }));
    };

    const handleApplyFilters = () => applyFilterValues(localFilters);

    const handleQuickRangeApply = (dates: { from: string; to: string }) => {
        applyFilterValues({ ...localFilters, ...dates });
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
        setActiveFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handlePerPageChange = (perPage: number) => {
        setActiveFilters((prev) => ({ ...prev, per_page: perPage, page: 1 }));
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
                const bom = '\uFEFF';
                const headers = bom + 'ID,Tên địa điểm,Danh mục,Quận/Huyện,Lượt xem,Yêu thích,Đánh giá,Trạng thái\n';
                const rows = data?.table.items
                    .map((i) =>
                        `"${i.id}","${i.name}","${i.categoryName}","${i.district}","${i.views}","${i.favorites}","${i.rating}","${i.status}"`
                    )
                    .join('\n') ?? '';
                downloadMockCsv({
                    filename: fallbackFilename,
                    headers,
                    rows,
                    loadingMessage: tCommon('export.toast_mock_loading'),
                    successMessage: tCommon('export.toast_mock_success'),
                });
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

    return (
        <ReportPageShell
            icon={MapPin}
            title={t('title')}
            subtitle={t('subtitle')}
            breadcrumbCurrentLabel="sidebar.reports_locations"
            testIdPrefix="locations-report"
            isMockMode={isMockMode}
            showErrorPanel={showErrorPanel}
            isExportDisabled={isLoading || isFetching}
            isExportPending={exportLocationsMutation.isPending}
            exportLabel={tCommon('export.btn_label')}
            onToggleMock={toggleMockMode}
            onExport={handleExportCSV}
            onRetry={() => refetch()}
            onUseMock={enableMockMode}
        >
            <LocationReportFilterBar
                filters={localFilters}
                onFilterChange={handleLocalFilterChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                onQuickRangeApply={handleQuickRangeApply}
                isSubmitting={isLoading || isFetching}
            />
            <LocationStatsCards stats={data?.stats} isLoading={isLoading} />
            <LocationReportCharts data={data?.charts} isLoading={isLoading} />
            <LocationReportTables
                data={data?.table}
                isLoading={isLoading}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
            />
        </ReportPageShell>
    );
};

export default LocationReport;
