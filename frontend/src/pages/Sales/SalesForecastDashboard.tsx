import React from 'react';
import { getSalesForecasts } from '../../services/addSalesForecastApi';
import { 
  KPICard, 
  ForecastVsTarget, 
  RevenueChart, 
  PipelineHealth, 
  SalesFunnel, 
  ForecastAccuracy, 
  AIInsights, 
  ForecastTimeline,
} from '../../components/sales/ForecastWidgets';
import { formatCurrency, formatPercent } from '../../components/sales/ForecastUtils';
import { RegionalTable, RepPerformanceTable, FullForecastTable } from '../../components/sales/ForecastTables';
import { useAuth } from '@/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';

const SkeletonDashboard = () => (
  <div className="min-h-screen bg-base-200 p-4 md:p-8 space-y-8 animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
      <div className="h-10 w-64 bg-base-300 rounded-lg"></div>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="h-10 w-24 bg-base-300 rounded-lg"></div>
        <div className="h-10 w-24 bg-base-300 rounded-lg"></div>
        <div className="h-10 w-24 bg-base-300 rounded-lg"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-base-300 rounded-3xl"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-2 h-96 bg-base-300 rounded-3xl"></div>
      <div className="h-96 bg-base-300 rounded-3xl"></div>
    </div>
  </div>
);

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-base-100 rounded-3xl shadow-xl border border-base-300 p-10 text-center m-8">
    <svg className="w-24 h-24 text-base-content/20 mb-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-2 4a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
    <h2 className="text-2xl font-bold mb-2">No Forecast Data Available</h2>
    <p className="text-base-content/60 mb-6">It looks like the forecast data hasn't been generated yet or is currently unavailable.</p>
    <div className="flex gap-4">
      <button className="btn btn-primary" onClick={onRefresh}>Generate Forecast</button>
      <button className="btn btn-outline" onClick={onRefresh}>Refresh Data</button>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-base-100 rounded-3xl shadow-xl border border-error p-10 text-center m-8">
    <svg className="w-24 h-24 text-error mb-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    <h2 className="text-2xl font-bold mb-2 text-error">Unable to load forecast data</h2>
    <p className="text-base-content/60 mb-6">{error}</p>
    <button className="btn btn-error text-error-content" onClick={onRetry}>Retry Connection</button>
  </div>
);

const FilterPanel = () => (
  <div className="bg-base-100 p-5 rounded-3xl shadow-lg border border-base-300 flex flex-col md:flex-row flex-wrap gap-4 md:items-end justify-between">
    <div className="flex flex-wrap gap-4 flex-1">
      <div className="form-control w-full max-w-[12rem]">
        <label className="label py-1"><span className="label-text text-xs font-bold">Date Range</span></label>
        <select className="select select-sm select-bordered w-full"><option>This Quarter</option><option>This Month</option><option>This Year</option></select>
      </div>
      <div className="form-control w-full max-w-[12rem]">
        <label className="label py-1"><span className="label-text text-xs font-bold">Region</span></label>
        <select className="select select-sm select-bordered w-full"><option>All Regions</option><option>North</option><option>South</option></select>
      </div>
      <div className="form-control w-full max-w-[12rem]">
        <label className="label py-1"><span className="label-text text-xs font-bold">Sales Rep</span></label>
        <select className="select select-sm select-bordered w-full"><option>All Reps</option></select>
      </div>
      <div className="form-control w-full max-w-[12rem]">
        <label className="label py-1"><span className="label-text text-xs font-bold">Pipeline Stage</span></label>
        <select className="select select-sm select-bordered w-full"><option>All Stages</option></select>
      </div>
    </div>
    <button className="btn btn-primary btn-sm px-6">Apply Filters</button>
  </div>
);

export default function SalesForecastDashboard() {
  const { auth } = useAuth();
  const slug = auth?.slug;

  const { data: response, isLoading: loading, isError, refetch } = useQuery({
    queryKey: ['salesForecasts', slug],
    queryFn: () => getSalesForecasts(slug!),
    enabled: !!slug,
  });

  const error = isError ? "Failed to load sales forecast data" : null;
  const data = response?.data?.data || response?.data;

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!data || Object.keys(data).length === 0) return <EmptyState onRefresh={() => refetch()} />;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">Sales Forecast Overview</h1>
          <p className="text-base-content/70 mt-1 font-medium">Analyze future sales performance, revenue forecasts, pipeline health, and target achievement.</p>
          <div className="mt-2 text-sm font-semibold text-primary">Current Period: Q3 2026</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-outline btn-sm" onClick={() => refetch()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
            Refresh Data
          </button>
          <button className="btn btn-outline btn-sm">Download Report</button>
          <button className="btn btn-outline btn-sm">Share Dashboard</button>
          <button className="btn btn-primary btn-sm">Export Forecast</button>
        </div>
      </header>

      <FilterPanel />

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Forecast Revenue" value={formatCurrency(data?.forecastRevenue || 0)} growth="5.2%" trend="up" icon="📈" />
        <KPICard title="Expected Revenue" value={formatCurrency(data?.expectedRevenue || 0)} growth="2.1%" trend="up" icon="📅" />
        <KPICard title="Closed Revenue" value={formatCurrency(data?.closedRevenue || 0)} growth="1.4%" trend="down" icon="✅" />
        <KPICard title="Target Revenue" value={formatCurrency(data?.targetRevenue || 0)} growth="0.0%" trend="up" icon="🎯" />
        <KPICard title="Forecast Accuracy" value={formatPercent(data?.forecastAccuracy || 0)} growth="3.5%" trend="up" icon="⚡" />
        <KPICard title="Pipeline Value" value={formatCurrency(data?.pipelineValue || 0)} growth="8.7%" trend="up" icon="📊" />
        <KPICard title="Conversion Rate" value={formatPercent(data?.conversionRate || 0)} growth="1.2%" trend="down" icon="🔄" />
        <KPICard title="Win Rate" value={formatPercent((data?.deals?.won / data?.deals?.total) * 100 || 0)} growth="4.1%" trend="up" icon="🏆" />
      </div>

      {/* Forecast Chart & Target Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.monthlyForecast || []} />
        </div>
        <div className="lg:col-span-1">
          <ForecastVsTarget forecast={data?.forecastRevenue || 0} target={data?.targetRevenue || 0} />
        </div>
      </div>

      {/* Pipeline Health & Sales Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PipelineHealth data={{ 
          ...data, 
          deals: data?.deals || {}, 
          pipeline: data?.pipeline || {}, 
          opportunities: data?.opportunities || {} 
        }} />
        <SalesFunnel stages={data?.pipelineStages || []} />
      </div>

      {/* Analytics, Insights & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ForecastAccuracy accuracy={data?.forecastAccuracy || 0} variance={12} />
        </div>
        <div className="lg:col-span-1">
          <AIInsights />
        </div>
        <div className="lg:col-span-1">
          <ForecastTimeline />
        </div>
      </div>

      {/* Regional Analytics */}
      <div className="w-full">
        <RegionalTable data={data?.salesByRegion || []} />
      </div>

      {/* Representative Performance */}
      <div className="w-full">
        <RepPerformanceTable data={data?.salesByRepresentative || []} />
      </div>

      {/* Full Forecast Opportunities Table */}
      <div className="w-full">
        <FullForecastTable data={data?.topOpportunities || []} />
      </div>

    </div>
  );
}