import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    required?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle, required }) => {
    return (
        <div className="flex items-start gap-4 mb-6 pt-2">
            <div className="p-2.5 bg-blue-50 rounded-xl">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    {required && <span className="text-red-500 font-medium">*</span>}
                </div>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
};

export default SectionHeader;
