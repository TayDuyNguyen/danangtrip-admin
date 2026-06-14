import { 
    Activity, 
    Zap, 
    Coins, 
    AlertTriangle, 
    ThumbsDown, 
    HelpCircle, 
    Inbox,
    RefreshCw,
    UserCheck,
    Flame
} from 'lucide-react';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis,
    CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useChatbotStats } from '@/hooks/useChatbotQueries';

const COLORS = ['#14b8a6', '#0f766e', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#64748b'];

export default function DashboardTab() {
    const { t, i18n } = useTranslation('chatbot');
    const { data: stats, isLoading, isError, refetch, isFetching } = useChatbotStats();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-[#14b8a6] animate-spin mb-4" />
                <p className="text-slate-500 font-bold text-sm">{t('dashboard.loading')}</p>
            </div>
        );
    }

    if (isError || !stats) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-[32px] p-8 text-center shadow-xs">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{t('dashboard.error_title')}</h3>
                <p className="text-sm text-slate-500 mb-4">{t('dashboard.error_desc')}</p>
                <button
                    onClick={() => refetch()}
                    className="px-6 py-2.5 bg-[#14b8a6] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                    {t('dashboard.try_again')}
                </button>
            </div>
        );
    }

    const { kpis, trends, business } = stats;

    const translatedIntentDistribution = (business.intentDistribution || []).map((item: { name: string; value: number }) => ({
        ...item,
        name: t(`intents.${item.name}`, item.name)
    }));

    return (
        <div className="space-y-8">
            {/* Action Row */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-black text-slate-900">{t('dashboard.activity_overview')}</h2>
                    <p className="text-xs text-slate-400 font-bold">{t('dashboard.activity_desc')}</p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                    {t('dashboard.refresh_data')}
                </button>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                {/* Card 1: Total Messages */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.total_messages')}</p>
                        <h4 className="text-2xl font-black text-slate-950 mt-1">{kpis.total_messages.toLocaleString()}</h4>
                    </div>
                </div>

                {/* Card 2: Cache Hit Rate */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#dff7f4] flex items-center justify-center text-[#0f766e] shrink-0 border border-[#ccfbf1]">
                        <Zap className="w-6 h-6 fill-[#0f766e]/20" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.cache_hit_rate')}</p>
                        <h4 className="text-2xl font-black text-[#0f766e] mt-1">{kpis.cache_hit_rate}%</h4>
                    </div>
                </div>

                {/* Card 3: Avg Latency */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-100">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.avg_latency')}</p>
                        <h4 className="text-2xl font-black text-slate-950 mt-1">{kpis.avg_latency} ms</h4>
                    </div>
                </div>

                {/* Card 4: Estimated Cost */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 shrink-0 border border-blue-100">
                        <Coins className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.llm_cost')}</p>
                        <h4 className="text-2xl font-black text-slate-950 mt-1">${kpis.total_cost.toFixed(4)}</h4>
                    </div>
                </div>

                {/* Card 5: System Errors */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex items-center gap-4 hover:shadow-md transition-all">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                        kpis.system_errors > 0 
                             ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
                             : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{t('dashboard.errors_failover')}</p>
                        <h4 className={`text-2xl font-black mt-1 ${kpis.system_errors > 0 ? 'text-rose-600' : 'text-slate-950'}`}>
                            {kpis.system_errors}
                        </h4>
                    </div>
                </div>
            </div>

            {/* SECTION 1: TECHNICAL ANALYTICS */}
            <div className="bg-slate-100/40 p-1.5 rounded-[32px] border border-slate-200/40">
                <div className="p-6">
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-[10px] font-black rounded-lg border border-teal-100 uppercase tracking-wider">
                        {t('dashboard.tech_infra_tag')}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{t('dashboard.tech_analytics')}</h3>
                    <p className="text-xs text-slate-400 font-bold">{t('dashboard.tech_analytics_desc')}</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-4">
                    {/* Chart 1: Latency */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[360px] flex flex-col hover:shadow-md transition-all">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.latency_trend')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.latency_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends.latency}>
                                    <defs>
                                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="latency" name={t('dashboard.avg_latency')} stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Cache Hit Rate */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[360px] flex flex-col hover:shadow-md transition-all">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.cache_efficiency')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.cache_efficiency_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends.cacheRate}>
                                    <defs>
                                        <linearGradient id="cacheRateGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                                    <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="hitRate" name={t('dashboard.cache_hit_rate')} stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#cacheRateGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 3: Pricing Cost */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[360px] flex flex-col hover:shadow-md transition-all">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.llm_cost_trend')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.llm_cost_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends.cost}>
                                    <defs>
                                        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={50} />
                                    <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="cost" name={t('dashboard.llm_cost')} stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#costGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 4: Error Rate */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[360px] flex flex-col hover:shadow-md transition-all">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.errors_failover_trend')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.errors_failover_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={trends.errors}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={30} allowDecimals={false} />
                                    <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                                    <Bar dataKey="errors" name={t('dashboard.errors_failover')} fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: BUSINESS ANALYTICS */}
            <div className="bg-slate-100/40 p-1.5 rounded-[32px] border border-slate-200/40">
                <div className="p-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100 uppercase tracking-wider">
                        {t('dashboard.business_insights_tag')}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{t('dashboard.business_insights')}</h3>
                    <p className="text-xs text-slate-400 font-bold">{t('dashboard.business_insights_desc')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                    {/* Chart 5: Intent Distribution */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[380px] flex flex-col hover:shadow-md transition-all lg:col-span-1">
                        <div className="mb-2">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.intent_distribution')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.intent_distribution_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                            {business.intentDistribution.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">{t('dashboard.no_intent_data')}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={translatedIntentDistribution}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {business.intentDistribution.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [`${value} ${t('dashboard.sessions_unit')}`, name]} />
                                        <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', maxHeight: '90px', overflowY: 'auto' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Chart 6: Top Destinations */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[380px] flex flex-col hover:shadow-md transition-all lg:col-span-1">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.top_destinations')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.top_destinations_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            {business.topDestinations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">{t('dashboard.no_destination_data')}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={business.topDestinations} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                                        <Tooltip formatter={(value) => [`${value} ${t('dashboard.sessions_unit')}`, t('dashboard.frequency')]} />
                                        <Bar dataKey="value" fill="#0f766e" radius={[0, 4, 4, 0]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Chart 7: Top Tours */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs h-[380px] flex flex-col hover:shadow-md transition-all lg:col-span-1">
                        <div className="mb-4">
                            <h4 className="font-black text-sm text-slate-900">{t('dashboard.top_tours')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.top_tours_desc')}</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            {business.topTours.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">{t('dashboard.no_tour_data')}</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={business.topTours} layout="vertical" margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={80} tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                                        <Tooltip formatter={(value) => [`${value} ${t('dashboard.sessions_unit')}`, t('dashboard.frequency')]} />
                                        <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={14} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

                {/* Drop-off & Handoff conversion stats card */}
                <div className="mx-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Clarification completed rate */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex flex-col justify-between">
                        <div>
                            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-wider">
                                {t('dashboard.conversational_flow_tag')}
                            </span>
                            <h4 className="font-black text-slate-900 mt-2 text-sm">{t('dashboard.clarification_rate')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.clarification_rate_desc')}</p>
                        </div>
                        <div className="flex items-center gap-6 mt-6">
                            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path className="text-[#14b8a6]" strokeDasharray={`${business.clarification.completion_rate}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute text-base font-black text-slate-900">{business.clarification.completion_rate}%</span>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span className="flex items-center gap-1.5 font-bold"><UserCheck className="w-3.5 h-3.5 text-[#14b8a6]" /> {t('dashboard.clarification_completed')}</span>
                                    <span className="font-black text-slate-900">{business.clarification.completed_sessions} / {business.clarification.total_clarified_sessions} {t('dashboard.sessions_unit')}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-600">
                                    <span className="flex items-center gap-1.5 font-bold"><ThumbsDown className="w-3.5 h-3.5 text-rose-500" /> {t('dashboard.clarification_dropoff')}</span>
                                    <span className="font-black text-slate-900">{business.clarification.drop_off_rate.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Human Handoff info card */}
                    <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex flex-col justify-between">
                        <div>
                            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-black rounded-lg border border-rose-100 uppercase tracking-wider">
                                {t('dashboard.support_handoff_tag')}
                            </span>
                            <h4 className="font-black text-slate-900 mt-2 text-sm">{t('dashboard.handoff_title')}</h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.handoff_desc')}</p>
                        </div>
                        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3 items-center">
                            <Flame className="w-5 h-5 text-rose-500 fill-rose-500/20 shrink-0" />
                            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                                {t('dashboard.handoff_detail')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* UNKNOWN INTENTS & NEGATIVE FEEDBACKS TABLES */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Column 1: Unknown Intents */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex flex-col h-[480px]">
                    <div className="mb-4 shrink-0 flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                                <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
                                {t('dashboard.unknown_intents')}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.unknown_intents_desc')}</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto border border-slate-100 rounded-2xl">
                        {business.unknownIntents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2 py-10">
                                <UserCheck className="w-8 h-8 text-green-500" />
                                {t('dashboard.no_unknown_intents')}
                            </div>
                        ) : (
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                                        <th className="p-3.5 pl-4">{t('dashboard.time_header')}</th>
                                        <th className="p-3.5">{t('dashboard.question_header')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {business.unknownIntents.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="p-3.5 pl-4 text-slate-400 whitespace-nowrap">
                                                {new Date(item.created_at).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                            </td>
                                            <td className="p-3.5 text-slate-700 font-bold max-w-xs truncate" title={item.question}>
                                                {item.question}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Column 2: Negative Feedbacks */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200/60 shadow-xs flex flex-col h-[480px]">
                    <div className="mb-4 shrink-0 flex items-center justify-between">
                        <div>
                            <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                                <ThumbsDown className="w-4.5 h-4.5 text-rose-500" />
                                {t('dashboard.negative_feedbacks')}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-bold">{t('dashboard.negative_feedbacks_desc')}</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto border border-slate-100 rounded-2xl">
                        {business.negativeFeedbacks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2 py-10">
                                <UserCheck className="w-8 h-8 text-green-500" />
                                {t('dashboard.no_negative_feedbacks')}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {business.negativeFeedbacks.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50/50 space-y-1.5 text-xs">
                                        <div className="flex justify-between items-center text-slate-400">
                                            <span className="font-semibold uppercase text-[9px] px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100">
                                                {t('dashboard.intent_prefix')}{t(`intents.${item.intent}`, item.intent)}
                                            </span>
                                            <span>
                                                {new Date(item.created_at).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                                            </span>
                                        </div>
                                        <p className="text-slate-700 font-black">{t('logs.customer_label')}: "{item.question}"</p>
                                        <p className="text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                            🤖 Copilot: "{item.answer}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
