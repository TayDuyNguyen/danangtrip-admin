export interface TourItem {
    id: string;
    title: string;
    image: string;
    category: string;
    price: string;
    originalPrice?: string;
    salesCount: number;
    rating: number;
    status: 'active' | 'inactive' | 'full';
    duration: string;
    createdAt: string;
}

export interface TourFilters {
    search: string;
    category: string;
    status: string;
    sortBy: string;
}

export interface TourListData {
    items: TourItem[];
    total: number;
    page: number;
    limit: number;
}
