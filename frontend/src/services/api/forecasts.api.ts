import { API } from "./axios";
import type { SalesForecastPayload } from "@/type/addSalesForecast";

export const createSalesForecast = async (slug: string, payload: SalesForecastPayload) => {
  const response = await API.post(`forecast/${slug}/create-forecast`, payload);
  return response.data;
};

export const getSalesForecasts = async (slug: string) => {
  const response = await API.get(`forecast/${slug}/get-forecasts`);
  return response.data;
};
