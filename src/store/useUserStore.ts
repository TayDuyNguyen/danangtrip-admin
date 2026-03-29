import { create } from 'zustand';
import type { User } from '@/types';

/**
 * User store interface
 * (Interface để lưu trữ trạng thái user)
 */
interface UserState {
    user: User | null;
    setUser: (user: User) => void;
    logout: () => void;
}

/**
 * User store
 * (Store để lưu trữ trạng thái user)
 */
export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
}));
