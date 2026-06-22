export interface ForecastPeriod {
  startDate: string;
  endDate: string;
}

export interface SalesForecastPayload {
  forecastName: string;
  forecastType: string;
  forecastStatus: string;
  forecastDescription: string;
  
  period: ForecastPeriod;
  forecastYear: number;
  forecastQuarter: string;
  
  salesRegion: string;
  salesTerritory: string;
  salesTeam: string;
  salesManager: string;
  salesRepresentative: string;
  customerSegment: string;
  productCategory: string;
  
  forecastRevenue: number;
  targetRevenue: number;
  expectedRevenue: number;
  minimumRevenue: number;
  maximumRevenue: number;
  currency: string;
  
  expectedDeals: number;
  openOpportunities: number;
  expectedCustomers: number;
  averageDealSize: number;
  pipelineValue: number;
  expectedCloseRate: number;
  
  forecastMethod: string;
  confidenceLevel: number;
  riskLevel: string;
  
  businessAssumptions: string;
  marketAssumptions: string;
  growthExpectations: string;
  challenges: string;
  opportunities: string;
  
  forecastOwner: string;
  reviewer: string;
  approver: string;
  approvalDeadline: string;
  
  internalNotes: string;
  remarks: string;
}