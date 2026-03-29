import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { clearTokens, getAccessToken, setAccessToken } from '@/utils';

/**
 * Defines the shape of user state and available actions
 * (Interface để lưu trữ trạng thái user)
 */
interface UserState {
    user: User | null;
    setUser: (user: User, token: string) => void;
    logout: () => void;
}

/**
 * Zustand store for managing user authentication state with persistence
 * (Store Zustand quản lý trạng thái xác thực user với tính năng lưu trữ)
 */
export const useUserStore = create<UserState>()(
    // Persist user state to localStorage
    // (Lưu trạng thái user vào localStorage để không mất khi F5)
    persist(
        (set) => ({
            user: null,
            setUser: (user, token) => {
                setAccessToken(token);
                set({user});
            },
            logout: () => {
                clearTokens();
                set({user: null});
            }
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({user: state.user}),
            onRehydrateStorage: () => (state, error) => {
                if(error || !state){
                    return;
                }
                const token = getAccessToken();
                if(!token){
                    return {user: null};
                }
            }
        }
    )
);

/**
 * Custom hook to access authentication state conveniently
 * (Custom hook giúp truy cập trạng thái authentication một cách tiện lợi)
 */
export const useAuth = () => {
    const user = useUserStore((state) => state.user);
    return {
        user,
        isAuthenticated: !!user && !!getAccessToken(),
    }
}
