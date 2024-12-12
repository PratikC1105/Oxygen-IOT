import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Existing API functions
export const fetchHourlyData = (storeID, startDate, endDate) =>
  API.get("/hourly-data", { params: { storeID, startDate, endDate } });

export const fetchDailyTotals = (storeID) =>
  API.get("/daily-totals", { params: { storeID } });
export const fetchPeakHours = (storeID) =>
  API.get("/peak-hours", { params: { storeID } });

export const fetchPeakDay = (storeID, startDate, endDate) =>
  API.get("/peak-day", { params: { storeID, startDate, endDate } });

export const fetchLiveStats = (storeID) =>
  API.get("/live-stats", { params: { storeID } });
export const fetchStores = () => API.get("/stores");
export const fetchTopStores = () => API.get("/report");

export const fetchReport = (startDate, endDate) =>
  API.get("/report", { params: { startDate, endDate } });
export const fetchLastMonthBestStore = (startDate, endDate) =>
  API.get("/last-month-best-store", { params: { startDate, endDate } });

export const fetchStoreLocations = () => API.get("/store-locations");
export const fetchAlerts = (storeID) =>
  API.get("/alerts", { params: { storeID } });

export const fetchPredictiveAnalytics = (storeID, type) =>
  API.get("/predictive-analytics", { params: { storeID, type } });

export const fetchTopPerformingDays = (storeID, startDate, endDate) =>
  API.get("/top-performing-days", { params: { storeID, startDate, endDate } });

export const fetchMonthlyData = (storeID, startDate, endDate) =>
  API.get("/monthly-data", { params: { storeID, startDate, endDate } });

export const fetchPeakHourData = (storeID, startDate, endDate) =>
  API.get("/peak-hour", { params: { storeID, startDate, endDate } });

