import React, { useEffect } from 'react';
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
}

const Drawer = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    subtitle, 
    badge,
    width = "max-w-md"
}: DrawerProps) => {
    // Prevent scrolling when drawer is open
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

    return (
        <>
            {/* Backdrop */}
            <div 
                className={cn(
                    "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Panel */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-full z-50 bg-white shadow-2xl transition-transform duration-500 ease-in-out transform flex flex-col",
                width,
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                            {badge && (
                                <span className="px-2 py-0.5 bg-[#dff7f4] text-[#0f766e] text-[10px] font-black rounded-md uppercase tracking-wider">
                                    {badge}
                                </span>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    {subtitle && (
                        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Drawer;
