import React from 'react';
import type { ForecastOverviewData, PipelineStage, MonthlyData } from '../../type/salesForecast';
import { formatCurrency, formatPercent } from './ForecastUtils';

export const Card = ({ title, children, className = '' }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-base-300 bg-base-100 p-6 flex flex-col ${className}`}>
    {title && <h3 className="text-xl font-bold mb-6 text-base-content">{title}</h3>}
    {children}
  </div>
);

interface KPICardProps {
  title: string;
  value: React.ReactNode;
  growth: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

export const KPICard = ({ title, value, growth, trend, icon }: KPICardProps) => (
  <Card className="justify-between">
    <div className="flex justify-between items-start mb-2">
      <div className="text-base-content/60 text-sm font-semibold">{title}</div>
      <div className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</div>
    </div>
    <div className="text-3xl font-extrabold text-base-content mb-2">{value}</div>
    <div className={`text-sm font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-success' : 'text-error'}`}>
      {trend === 'up' ? '▲' : '▼'} {growth} vs last period
    </div>
  </Card>
);

export const ForecastVsTarget = ({ forecast, target }: { forecast: number, target: number }) => {
  const achievement = target > 0 ? Math.min((forecast / target) * 100, 100) : 0;
  const gap = Math.max(target - forecast, 0);

  return (
    <Card title="Forecast vs Target" className="h-full flex flex-col justify-center items-center text-center">
      <div className="relative mb-6">
        <div className="radial-progress text-primary transition-all duration-1000" style={{ ["--value" as string]: achievement, ["--size" as string]: "12rem", ["--thickness" as string]: "1.5rem" }} role="progressbar">
          <span className="text-3xl font-bold text-base-content">{achievement.toFixed(0)}%</span>
        </div>
      </div>
      <div className="w-full space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-base-content/70">Target Revenue</span>
          <span className="font-bold">{formatCurrency(target)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-base-content/70">Forecast Revenue</span>
          <span className="font-bold text-primary">{formatCurrency(forecast)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-base-content/70">Remaining Gap</span>
          <span className="font-bold text-error">{formatCurrency(gap)}</span>
        </div>
      </div>
    </Card>
  );
};

export const RevenueChart = ({ data }: { data: MonthlyData[] }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d.actual, d.expected, d.target))) || 1;
  
  return (
    <Card title="Monthly Revenue Forecast">
      <div className="flex justify-end gap-4 mb-4 text-xs font-semibold">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-base-300 rounded-sm"></span> Target</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-secondary rounded-sm"></span> Expected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-primary rounded-sm"></span> Actual</span>
      </div>
      <div className="flex h-64 items-end space-x-2 w-full">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
            <div className="flex space-x-1 items-end h-full w-full justify-center">
              <div className="w-1/3 bg-base-300 rounded-t-md hover:opacity-80 transition-all tooltip" data-tip={`Target: ${formatCurrency(d.target)}`} style={{ height: `${(d.target / maxVal) * 100}%` }}></div>
              <div className="w-1/3 bg-secondary rounded-t-md hover:opacity-80 transition-all tooltip" data-tip={`Expected: ${formatCurrency(d.expected)}`} style={{ height: `${(d.expected / maxVal) * 100}%` }}></div>
              <div className="w-1/3 bg-primary rounded-t-md hover:opacity-80 transition-all tooltip" data-tip={`Actual: ${formatCurrency(d.actual)}`} style={{ height: `${(d.actual / maxVal) * 100}%` }}></div>
            </div>
            <span className="text-xs text-center mt-3 text-base-content/70 font-medium">{d.month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const PipelineHealth = ({ data }: { data: ForecastOverviewData }) => (
  <Card title="Pipeline Health">
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="bg-base-200 rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-sm text-base-content/70 mb-1">Total Pipeline</span>
        <span className="text-2xl font-bold text-primary">{formatCurrency(data.pipelineValue)}</span>
      </div>
      <div className="bg-base-200 rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-sm text-base-content/70 mb-1">Open Opps</span>
        <span className="text-2xl font-bold">{data.deals.open} Deals</span>
      </div>
      <div className="bg-base-200 rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-sm text-base-content/70 mb-1">Closed Won</span>
        <span className="text-2xl font-bold text-success">{formatCurrency(data.closedRevenue)}</span>
      </div>
      <div className="bg-base-200 rounded-2xl p-4 flex flex-col justify-center">
        <span className="text-sm text-base-content/70 mb-1">Win Rate</span>
        <span className="text-2xl font-bold">{formatPercent((data.deals.won / data.deals.total) * 100 || 0)}</span>
      </div>
    </div>
  </Card>
);

export const SalesFunnel = ({ stages }: { stages: PipelineStage[] }) => (
  <Card title="Sales Funnel">
    <div className="flex flex-col items-center w-full gap-2 mt-4">
      {stages.map((stage, idx) => {
        const width = stages.length > 0 ? 100 - (idx * (50 / stages.length)) : 100;
        return (
          <div key={idx} className="bg-primary/10 border border-primary/30 hover:border-primary text-base-content rounded-xl flex justify-between items-center px-6 py-3 transition-all cursor-pointer" style={{ width: `${width}%` }}>
            <div className="flex flex-col">
              <span className="font-bold text-primary">{stage.stage}</span>
              <span className="text-xs text-base-content/60">Conv: {formatPercent(stage.conversion)}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-extrabold">{formatCurrency(stage.value)}</div>
              <div className="text-xs text-base-content/60">{stage.count} Deals</div>
            </div>
          </div>
        )
      })}
    </div>
  </Card>
);

export const ForecastAccuracy = ({ accuracy, variance }: { accuracy: number, variance: number }) => (
  <Card title="Forecast Accuracy" className="h-full">
    <div className="flex flex-col h-full items-center justify-center">
      <div className="radial-progress text-info mb-6" style={{ ["--value" as string]: accuracy, ["--size" as string]: "10rem", ["--thickness" as string]: "1rem" }} role="progressbar">
        <span className="text-3xl font-bold text-base-content">{accuracy}%</span>
      </div>
      <p className="text-center text-sm text-base-content/70">
        Prediction Confidence is high. Variance is <strong className={variance > 0 ? 'text-success' : 'text-error'}>{variance}%</strong> compared to last forecast.
      </p>
    </div>
  </Card>
);

export const AIInsights = () => (
  <Card title="AI Insights" className="h-full">
    <div className="space-y-4">
      <div className="alert alert-info shadow-sm rounded-2xl bg-info/10 text-base-content border-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-info shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-bold">Target Alert</h3>
          <div className="text-xs">Revenue forecast is 18% below the Q3 target. Action recommended.</div>
        </div>
      </div>
      <div className="alert alert-success shadow-sm rounded-2xl bg-success/10 text-base-content border-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-success shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-bold">Overperforming Region</h3>
          <div className="text-xs">North region is exceeding its target by 12%.</div>
        </div>
      </div>
      <div className="alert alert-warning shadow-sm rounded-2xl bg-warning/10 text-base-content border-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-warning shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <div>
          <h3 className="font-bold">Concentration Risk</h3>
          <div className="text-xs">3 large opportunities contribute 40% of expected revenue.</div>
        </div>
      </div>
    </div>
  </Card>
);

export const ForecastTimeline = () => (
  <Card title="Forecast Timeline" className="h-full">
    <ul className="timeline timeline-vertical">
      <li>
        <div className="timeline-start text-xs text-base-content/60">Oct 01</div>
        <div className="timeline-middle"><div className="w-4 h-4 bg-primary rounded-full"></div></div>
        <div className="timeline-end timeline-box text-sm">Forecast Created</div>
        <hr className="bg-primary" />
      </li>
      <li>
        <hr className="bg-primary" />
        <div className="timeline-start text-xs text-base-content/60">Oct 05</div>
        <div className="timeline-middle"><div className="w-4 h-4 bg-primary rounded-full"></div></div>
        <div className="timeline-end timeline-box text-sm">Target Revised</div>
        <hr className="bg-primary" />
      </li>
      <li>
        <hr className="bg-primary" />
        <div className="timeline-start text-xs text-base-content/60">Oct 12</div>
        <div className="timeline-middle"><div className="w-4 h-4 bg-primary rounded-full"></div></div>
        <div className="timeline-end timeline-box text-sm">Major Opportunity Added</div>
        <hr className="bg-base-300" />
      </li>
      <li>
        <hr className="bg-base-300" />
        <div className="timeline-start text-xs text-base-content/60">Oct 28</div>
        <div className="timeline-middle"><div className="w-4 h-4 bg-base-300 rounded-full"></div></div>
        <div className="timeline-end timeline-box text-sm text-base-content/50">Forecast Approved</div>
      </li>
    </ul>
  </Card>
);