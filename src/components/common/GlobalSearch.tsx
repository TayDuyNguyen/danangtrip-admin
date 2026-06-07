import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
    FileText,
    MapPin,
    Search,
    ShoppingCart,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextInput } from '@/components/ui/TextInput';
import { useDebounce } from '@/hooks/useDebounce';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import type { GlobalSearchGroup, GlobalSearchResult } from '@/api/globalSearchApi';

const groupMeta: Record<GlobalSearchGroup, { label: string; icon: LucideIcon }> = {
    tours: { label: 'Tour', icon: Search },
    locations: { label: 'Địa điểm', icon: MapPin },
    bookings: { label: 'Đơn hàng', icon: ShoppingCart },
    users: { label: 'Người dùng', icon: Users },
    blog: { label: 'Bài viết', icon: FileText },
};

export default function GlobalSearch() {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const searchId = useId();
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const debouncedQuery = useDebounce(query, 300);
    const { data, isFetching, isError } = useGlobalSearch(debouncedQuery);

    const groupedResults = useMemo(
        () => Object.entries(data?.groups ?? {}) as Array<[GlobalSearchGroup, GlobalSearchResult[]]>,
        [data],
    );
    const flatResults = useMemo(
        () => groupedResults.flatMap(([, results]) => results),
        [groupedResults],
    );

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const handleShortcut = (event: KeyboardEvent) => {
            if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) {
                event.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleShortcut);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleShortcut);
        };
    }, []);

    const openResult = (result: GlobalSearchResult) => {
        setIsOpen(false);
        setQuery('');
        navigate(result.path);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setIsOpen(false);
            return;
        }
        if (!flatResults.length) return;
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % flatResults.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + flatResults.length) % flatResults.length);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            openResult(flatResults[activeIndex] ?? flatResults[0]);
        }
    };

    const showPanel = isOpen && query.trim().length > 0;

    return (
        <div ref={containerRef} className="relative w-full">
            <label htmlFor={searchId} className="sr-only">
                {t('header.search_label')}
            </label>
            <TextInput
                ref={inputRef}
                id={searchId}
                type="search"
                name="admin-quick-search"
                autoComplete="off"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={t('header.search')}
                aria-expanded={showPanel}
                aria-controls={`${searchId}-results`}
                leftIcon={<Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#14b8a6] transition-colors duration-150" />}
                containerClassName="group"
                className="rounded-full border-slate-100 pl-12 pr-12 py-3 text-sm font-medium shadow-sm focus:ring-4 focus:ring-[#14b8a6]/10 focus:border-[#14b8a6]/50"
            />
            {query && (
                <button
                    type="button"
                    onClick={() => {
                        setQuery('');
                        inputRef.current?.focus();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label="Xóa tìm kiếm"
                >
                    <X size={16} />
                </button>
            )}

            {showPanel && (
                <div
                    id={`${searchId}-results`}
                    className="absolute left-0 right-0 top-[calc(100%+10px)] z-[70] max-h-[70vh] overflow-y-auto rounded-3xl border border-slate-100 bg-white p-3 shadow-2xl shadow-slate-900/15"
                >
                    {query.trim().length < 2 ? (
                        <p className="px-4 py-6 text-center text-sm font-medium text-slate-400">
                            Nhập ít nhất 2 ký tự để tìm kiếm.
                        </p>
                    ) : isFetching ? (
                        <div className="flex items-center justify-center gap-3 px-4 py-8 text-sm font-semibold text-slate-500">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#14b8a6] border-t-transparent" />
                            Đang tìm kiếm...
                        </div>
                    ) : isError ? (
                        <p className="px-4 py-6 text-center text-sm font-medium text-rose-500">
                            Không thể tải kết quả. Vui lòng thử lại.
                        </p>
                    ) : flatResults.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm font-medium text-slate-400">
                            Không tìm thấy kết quả cho “{debouncedQuery}”.
                        </p>
                    ) : (
                        groupedResults.map(([group, results]) => {
                            if (!results.length) return null;
                            const meta = groupMeta[group];
                            const GroupIcon = meta.icon;
                            return (
                                <section key={group} className="mb-2 last:mb-0">
                                    <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                                        <GroupIcon size={14} />
                                        {meta.label}
                                    </div>
                                    {results.map((result) => {
                                        const index = flatResults.findIndex((item) => item.id === result.id);
                                        return (
                                            <button
                                                key={result.id}
                                                type="button"
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onClick={() => openResult(result)}
                                                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                                                    activeIndex === index ? 'bg-[#dff7f4]' : 'hover:bg-slate-50'
                                                }`}
                                            >
                                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#0f766e] shadow-sm">
                                                    <GroupIcon size={18} />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm font-black text-slate-900">{result.title}</span>
                                                    <span className="mt-0.5 block truncate text-xs font-medium text-slate-400">{result.subtitle}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </section>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
