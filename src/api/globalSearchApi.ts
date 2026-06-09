import { blogApi } from './blogApi';
import { bookingApi } from './bookingApi';
import locationApi from './locationApi';
import { tourApi } from './tourApi';
import { userApi } from './userApi';
import { mapLocationToViewModel } from '@/dataHelper/location.mapper';
import { ROUTES } from '@/routes/routes';

export type GlobalSearchGroup = 'tours' | 'locations' | 'bookings' | 'users' | 'blog';

export interface GlobalSearchResult {
    id: string;
    group: GlobalSearchGroup;
    title: string;
    subtitle: string;
    path: string;
}

export interface GlobalSearchResponse {
    groups: Record<GlobalSearchGroup, GlobalSearchResult[]>;
    total: number;
}

const emptyGroups = (): GlobalSearchResponse['groups'] => ({
    tours: [],
    locations: [],
    bookings: [],
    users: [],
    blog: [],
});

export const globalSearchApi = {
    search: async (query: string, limit = 3): Promise<GlobalSearchResponse> => {
        const q = query.trim();
        if (q.length < 2) return { groups: emptyGroups(), total: 0 };

        const requests = await Promise.allSettled([
            tourApi.getTours({
                q,
                tour_category_id: 'all',
                status: 'all',
                booking_availability: 'all',
                type: 'all',
                sort: 'created_at',
                order: 'desc',
            }, 1, limit),
            locationApi.getLocations({
                q,
                category_id: 'all',
                district: 'all',
                price_level: 'all',
                status: 'all',
                page: 1,
                per_page: limit,
            }),
            bookingApi.getList({
                search: q,
                status: 'all',
                payment_status: 'all',
                date_from: '',
                date_to: '',
                sort: 'booked_at',
                order: 'desc',
                page: 1,
                per_page: limit,
            }),
            userApi.getList({ q, role: '', status: '', page: 1, per_page: limit }),
            blogApi.getList({ search: q, page: 1, per_page: limit }),
        ]);

        if (requests.every((request) => request.status === 'rejected')) {
            throw new Error('All global search requests failed');
        }

        const groups = emptyGroups();
        const [tours, locations, bookings, users, posts] = requests;

        if (tours.status === 'fulfilled') {
            groups.tours = tours.value.data.map((tour) => ({
                id: `tour-${tour.id}`,
                group: 'tours',
                title: tour.name,
                subtitle: tour.duration || tour.slug,
                path: ROUTES.TOURS_EDIT.replace(':id', String(tour.id)),
            }));
        }

        if (locations.status === 'fulfilled') {
            groups.locations = (locations.value.data?.data ?? []).map(mapLocationToViewModel).map((location) => ({
                id: `location-${location.id}`,
                group: 'locations',
                title: location.name,
                subtitle: [location.district, location.address].filter(Boolean).join(' - '),
                path: ROUTES.LOCATIONS_DETAIL.replace(':id', String(location.id)),
            }));
        }

        if (bookings.status === 'fulfilled') {
            groups.bookings = (bookings.value.data?.data ?? []).map((booking) => ({
                id: `booking-${booking.id}`,
                group: 'bookings',
                title: booking.booking_code,
                subtitle: `${booking.customer_name} - ${booking.tour_name}`,
                path: ROUTES.BOOKINGS_DETAIL.replace(':id', String(booking.id)),
            }));
        }

        if (users.status === 'fulfilled') {
            groups.users = (users.value.data?.data ?? []).map((user) => ({
                id: `user-${user.id}`,
                group: 'users',
                title: user.full_name,
                subtitle: user.email,
                path: ROUTES.USERS_DETAIL.replace(':id', String(user.id)),
            }));
        }

        if (posts.status === 'fulfilled') {
            groups.blog = (posts.value.data?.data ?? []).map((post) => ({
                id: `blog-${post.id}`,
                group: 'blog',
                title: post.title,
                subtitle: post.excerpt || post.slug,
                path: ROUTES.BLOG_POSTS_DETAIL.replace(':id', String(post.id)),
            }));
        }

        return {
            groups,
            total: Object.values(groups).reduce((sum, items) => sum + items.length, 0),
        };
    },
};
