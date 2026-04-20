import { memo } from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton = memo(({ className = '', style }: SkeletonProps) => {
    return (
        <div
            className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`}
            style={style}
        />
    );
});

Skeleton.displayName = 'Skeleton';
