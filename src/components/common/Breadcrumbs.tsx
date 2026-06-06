import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Eye, Pencil } from 'lucide-react';
import { ROUTES } from '@/routes/routes';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;      // translation key (e.g., 'sidebar.tours', 'breadcrumb.edit') or raw string
    path?: string;      // optional url path
    isRaw?: boolean;    // if true, displays raw label as text instead of translating it
}

export type BreadcrumbActionVariant = 'primary' | 'outline';

export interface BreadcrumbAction {
    /** i18n key under `common:breadcrumb.*`, e.g. 'breadcrumb.add', 'breadcrumb.edit', 'breadcrumb.view' */
    labelKey?: string;
    /** Raw label text or pre-translated label string */
    label?: string;
    icon?: LucideIcon;
    onClick?: () => void;
    variant?: BreadcrumbActionVariant;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    form?: string;
}

interface BreadcrumbsProps {
    /** Optional icon component for the root (replaces Home icon). Pass a Lucide icon, e.g. icon={Map} */
    icon?: LucideIcon;
    items: BreadcrumbItem[];
    /** Optional action buttons rendered on the right side */
    actions?: BreadcrumbAction[];
}

const ACTION_ICON_FALLBACK: Record<string, LucideIcon> = {
    'breadcrumb.add': Plus,
    'breadcrumb.edit': Pencil,
    'breadcrumb.view': Eye,
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ icon: RootIcon, items, actions }) => {
    const { t } = useTranslation('common');

    return (
        <div className="flex items-center justify-between gap-3 flex-wrap select-none">
            {/* Left: Icon + trail */}
            <div className="flex items-center flex-wrap gap-1 text-xs font-black text-slate-400 uppercase tracking-wider px-1 py-0.5">
                {/* Root icon — main menu icon or fallback Home */}
                {RootIcon ? (
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-[#14b8a6]/10 text-[#14b8a6]">
                        <RootIcon size={13} strokeWidth={2.5} />
                    </span>
                ) : (
                    <Link
                        to={ROUTES.DASHBOARD}
                        className="hover:text-[#14b8a6] text-slate-400 cursor-pointer flex items-center gap-1 transition-colors duration-150"
                    >
                        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-400">
                            <ChevronRight size={13} strokeWidth={2.5} />
                        </span>
                    </Link>
                )}

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const translatedLabel = item.isRaw ? item.label : t(item.label, { defaultValue: item.label });

                    return (
                        <React.Fragment key={index}>
                            <ChevronRight size={12} className="text-slate-300 mx-0.5 shrink-0" />
                            {isLast ? (
                                <span className="text-[#14b8a6] font-black tracking-wide truncate max-w-[200px] sm:max-w-none">
                                    {translatedLabel}
                                </span>
                            ) : item.path ? (
                                <Link
                                    to={item.path}
                                    className="hover:text-[#14b8a6] text-slate-400 transition-colors duration-150 hover:underline decoration-2"
                                >
                                    {translatedLabel}
                                </Link>
                            ) : (
                                <span className="text-slate-500 font-bold">{translatedLabel}</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Right: Action buttons */}
            {actions && actions.length > 0 && (
                <div className="flex items-center gap-2 shrink-0">
                    {actions.map((action, idx) => {
                        const actionLabel = action.label ?? (action.labelKey ? t(action.labelKey, { defaultValue: action.labelKey }) : '');
                        const iconKey = action.labelKey || action.label || '';
                        const IconComp = action.icon ?? ACTION_ICON_FALLBACK[iconKey];
                        const isPrimary = action.variant === 'primary';
                        return (
                            <button
                                key={idx}
                                type={action.type || 'button'}
                                form={action.form}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                className={[
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50',
                                    isPrimary
                                        ? 'bg-[#14b8a6] text-white shadow-md shadow-[#14b8a6]/20 hover:bg-[#0f766e]'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300',
                                ].join(' ')}
                            >
                                {IconComp && <IconComp size={12} strokeWidth={2.5} />}
                                {actionLabel}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Breadcrumbs;
