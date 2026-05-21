import { Skeleton } from '@/components/ui/Skeleton';

const LocationFormSkeleton = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
            {/* Left Column */}
            <div className="flex-1 space-y-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <Skeleton className="w-10 h-10 rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-12 w-full rounded-xl" />
                            <div className="grid grid-cols-2 gap-6">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </div>
                            <Skeleton className="h-32 w-full rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Column */}
            <div className="lg:w-80 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                    <Skeleton className="h-5 w-24 mb-4" />
                    <Skeleton className="h-24 w-full rounded-2xl mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                    <Skeleton className="h-5 w-24 mb-4" />
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                        <div className="flex justify-between">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationFormSkeleton;
