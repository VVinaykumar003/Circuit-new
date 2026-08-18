import type { SalesForecastPayload } from '../type/addSalesForecast';
import API from '@/api/axios'



export const createSalesForecast = async (slug : string ,payload: SalesForecastPayload) => {
  const response = await API.post(`forecast/${slug}/create-forecast`, payload);
  return response.data;
};

export const getSalesForecasts = async (slug : string) => {
  const response = await API.get(`forecast/${slug}/get-forecasts`);
  return response.data;
}