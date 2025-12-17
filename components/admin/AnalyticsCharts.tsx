"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  ordersByDate: Array<{
    createdAt: string;
    totalAmount: number;
    items: Array<{ quantity: number }>;
  }>;
  topProducts: Array<{
    productName: string;
    totalQuantity: number;
    revenue: number;
  }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
  period: string;
}

export function AnalyticsCharts({ data, period }: AnalyticsChartsProps) {
  // Process orders by date for revenue chart
  const revenueData = data.ordersByDate.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.totalAmount;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, { date: string; revenue: number; orders: number }>);

  const revenueChartData = Object.values(revenueData);

  // Process sales volume
  const salesData = data.ordersByDate.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, quantity: 0 };
    }
    acc[date].quantity += order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    return acc;
  }, {} as Record<string, { date: string; quantity: number }>);

  const salesChartData = Object.values(salesData);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              name="Revenue ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Sales Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#82ca9d" name="Items Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Top Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalQuantity" fill="#8884d8" name="Quantity Sold" />
            <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

