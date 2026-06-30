import { useEffect, useState } from 'react';

/**
 * Tracks whether the admin `<main>` scroll container has scrolled past the collapse threshold.
 * Listen in capture phase — same pattern as BookingDetail / TourCreate.
 */
export function useMainScrollCollapse() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'MAIN' || target.classList.contains('overflow-y-auto'))) {
                setIsScrolled((prev) => {
                    const currentScroll = target.scrollTop;
                    if (!prev && currentScroll > 10) return true;
                    if (prev && currentScroll < 2) return false;
                    return prev;
                });
            }
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, []);

    return isScrolled;
}
