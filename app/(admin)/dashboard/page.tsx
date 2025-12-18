import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { query } from "@/lib/supabase";
import { formatCurrency } from "@/lib/currency";
import { DollarSign, Package, ShoppingCart, TrendingUp, Warehouse } from "lucide-react";

async function getDashboardData() {
  try {
    const totalProductsResult = await query('SELECT COUNT(*) as count FROM "Product"');
    const totalProducts = parseInt(totalProductsResult.rows[0].count) || 0;

    const totalOrdersResult = await query('SELECT COUNT(*) as count FROM "Order"');
    const totalOrders = parseInt(totalOrdersResult.rows[0].count) || 0;
    
    const totalRevenueResult = await query('SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Order"');
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].total) || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenueResult = await query(
      'SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Order" WHERE "createdAt" >= $1',
      [todayStart]
    );
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].total) || 0;

    const lowStockResult = await query('SELECT COUNT(*) as count FROM "Product" WHERE stock < 10');
    const lowStockProducts = parseInt(lowStockResult.rows[0].count) || 0;

    // Total inventory value (sum of price * stock for all products)
    const inventoryValueResult = await query(
      'SELECT COALESCE(SUM(price * stock), 0) as total FROM "Product"'
    );
    const totalInventoryValue = parseFloat(inventoryValueResult.rows[0].total) || 0;

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      todayRevenue,
      lowStockProducts,
      totalInventoryValue,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      lowStockProducts: 0,
      totalInventoryValue: 0,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to LearnWithAnaGH Admin</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Value of all stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products with stock &lt; 10 units
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/orders/new"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold">Create Order</h3>
              <p className="text-sm text-gray-600">Create a new order</p>
            </a>
            <a
              href="/products/new"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold">Add New Product</h3>
              <p className="text-sm text-gray-600">Create a new product listing</p>
            </a>
            <a
              href="/inventory"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold">Manage Inventory</h3>
              <p className="text-sm text-gray-600">Update stock levels</p>
            </a>
            <a
              href="/discounts"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold">Create Discount</h3>
              <p className="text-sm text-gray-600">Set up promotions</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

