import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Breadcrumb {
    label: string;
    path?: string;
    active?: boolean;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: Breadcrumb[];
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumbs, actions }) => {
    return (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
                {breadcrumbs && (
                    <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Link to="/admin/dashboard" className="transition-colors hover:text-[#14b8a6]">
                            <Home size={14} />
                        </Link>
                        {breadcrumbs.map((crumb) => (
                            <React.Fragment key={crumb.label}>
                                <ChevronRight size={12} className="text-slate-300" />
                                {crumb.path && !crumb.active ? (
                                    <Link to={crumb.path} className="transition-colors hover:text-[#14b8a6]">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className={crumb.active ? 'text-[#14b8a6]' : ''}>{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className="text-3xl font-black tracking-tight text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm font-medium text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
    );
};

export default PageHeader;
