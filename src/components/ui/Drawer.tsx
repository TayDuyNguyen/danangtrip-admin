import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    subtitle?: string;
    badge?: string;
    width?: string;
    closeOnBackdropClick?: boolean;
    panelTestId?: string;
}

const Drawer = ({
    isOpen,
    onClose,
    title,
    children,
    subtitle,
    badge,
    width = "max-w-md",
    closeOnBackdropClick = true,
    panelTestId,
}: DrawerProps) => {
    const titleId = useId();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    const handleBackdropClick = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-150",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            <div
                role="dialog"
                aria-modal={isOpen ? true : undefined}
                aria-labelledby={titleId}
                aria-hidden={!isOpen}
                data-testid={panelTestId}
                className={cn(
                    "fixed inset-y-0 right-0 w-full z-50 bg-white shadow-2xl transition-transform duration-700 ease-in-out transform flex flex-col",
                    width,
                    isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
                )}
                inert={!isOpen ? true : undefined}
            >
                <div className="px-6 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <h2 id={titleId} className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                            {badge && (
                                <span className="px-2 py-0.5 bg-[#dff7f4] text-[#0f766e] text-[10px] font-black rounded-md uppercase tracking-wider">
                                    {badge}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {subtitle && (
                        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Drawer;
