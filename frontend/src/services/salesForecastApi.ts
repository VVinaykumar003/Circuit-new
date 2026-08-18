import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import type { ForecastOverviewData } from '../type/salesForecast';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSalesForecastOverview = async (): Promise<ForecastOverviewData> => {
  const response = await apiClient.get<ForecastOverviewData>('/sales/forecast/overview');
  return response.data;
};

export const useSalesForecast = () => {
  const [data, setData] = useState<ForecastOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSalesForecastOverview();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales forecast data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, refetch: loadData };
};