import * as dashboardService from '../../services/dashboard.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getKPIs = asyncHandler(async (req, res) => {
  const kpis = await dashboardService.getKPIs(req.params.restaurantId);
  sendSuccess(res, 200, 'Dashboard KPIs', kpis);
});

export const getSalesChart = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;
  const data = await dashboardService.getSalesChart(req.params.restaurantId, period);
  sendSuccess(res, 200, 'Sales chart', { chart: data });
});

export const getTopItems = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 20);
  const items = await dashboardService.getTopItems(req.params.restaurantId, limit);
  sendSuccess(res, 200, 'Top items', { items });
});

export const getRecentOrders = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const orders = await dashboardService.getRecentOrders(req.params.restaurantId, limit);
  sendSuccess(res, 200, 'Recent orders', { orders });
});
