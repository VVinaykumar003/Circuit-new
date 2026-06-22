export interface DealStats {
  total: number;
  open: number;
  won: number;
  lost: number;
}

export interface MonthlyData {
  month: string;
  actual: number;
  expected: number;
  target: number;
}

export interface RegionData {
  region: string;
  forecast: number;
  pipeline: number;
  target: number;
  topRep: string;
  achievement: number;
}

export interface RepData {
  id: string;
  name: string;
  forecast: number;
  closed: number;
  target: number;
  pipeline: number;
  winRate: number;
  status: 'On Track' | 'At Risk' | 'Exceeded';
}

export interface Opportunity {
  id: string;
  name: string;
  customer: string;
  value: number;
  probability: number;
  expectedRevenue: number;
  expectedCloseDate: string;
  rep: string;
  stage: string;
  priority: 'High' | 'Medium' | 'Low';
  region: string;
  status: 'Open' | 'Won' | 'Lost';
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  conversion: number;
  dropoff: number;
}

export interface ForecastOverviewData {
  forecastRevenue: number;
  expectedRevenue: number;
  closedRevenue: number;
  targetRevenue: number;
  forecastAccuracy: number;
  conversionRate: number;
  pipelineValue: number;
  deals: DealStats;
  monthlyForecast: MonthlyData[];
  salesByRegion: RegionData[];
  salesByRepresentative: RepData[];
  pipelineStages: PipelineStage[];
  topOpportunities: Opportunity[];
}