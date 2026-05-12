import { Skeleton } from '@/components/ui/Skeleton';

const LocationDetailSkeleton = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center py-2">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24 rounded-xl" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content Skeleton */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Hero Skeleton */}
                    <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                        <Skeleton className="h-[400px] w-full" />
                        <div className="p-6 flex gap-4">
                            <Skeleton className="h-20 w-20 rounded-2xl" />
                            <Skeleton className="h-20 w-20 rounded-2xl" />
                            <Skeleton className="h-20 w-20 rounded-2xl" />
                        </div>
                    </div>

                    {/* Tabs Skeleton */}
                    <div className="space-y-4">
                        <div className="flex gap-4 border-b border-slate-100 pb-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <div className="bg-white rounded-3xl p-8 border border-slate-100 space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <Skeleton className="h-32 rounded-2xl" />
                                <Skeleton className="h-32 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Skeleton */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-xl" />
                        </div>
                        <div className="pt-4 space-y-4">
                            <Skeleton className="h-24 w-full rounded-2xl" />
                            <Skeleton className="h-24 w-full rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationDetailSkeleton;
