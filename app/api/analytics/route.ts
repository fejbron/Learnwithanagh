import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Total revenue
    const totalRevenueResult = await query(
      'SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Order"'
    );
    const totalRevenue = parseFloat(totalRevenueResult.rows[0].total) || 0;

    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenueResult = await query(
      'SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Order" WHERE "createdAt" >= $1',
      [todayStart]
    );
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].total) || 0;

    // This month's revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthRevenueResult = await query(
      'SELECT COALESCE(SUM("totalAmount"), 0) as total FROM "Order" WHERE "createdAt" >= $1',
      [monthStart]
    );
    const monthRevenue = parseFloat(monthRevenueResult.rows[0].total) || 0;

    // Orders by date (for chart)
    const ordersResult = await query(
      `SELECT o."createdAt", o."totalAmount",
        COALESCE(
          json_agg(
            json_build_object('quantity', oi.quantity, 'productId', oi."productId")
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      WHERE o."createdAt" >= $1
      GROUP BY o.id, o."createdAt", o."totalAmount"
      ORDER BY o."createdAt" ASC`,
      [startDate]
    );

    // Top selling products
    const topProductsResult = await query(
      `SELECT oi."productId",
        SUM(oi.quantity) as total_quantity,
        COUNT(oi.id) as order_count
      FROM "OrderItem" oi
      INNER JOIN "Order" o ON oi."orderId" = o.id
      WHERE o."createdAt" >= $1
      GROUP BY oi."productId"
      ORDER BY total_quantity DESC
      LIMIT 10`,
      [startDate]
    );

    const topProductsWithDetails = await Promise.all(
      topProductsResult.rows.map(async (item: any) => {
        const productResult = await query(
          'SELECT name, price FROM "Product" WHERE id = $1',
          [item.productId]
        );
        const product = productResult.rows[0] || { name: "Unknown", price: 0 };
        return {
          productId: item.productId,
          productName: product.name,
          totalQuantity: parseInt(item.total_quantity) || 0,
          orderCount: parseInt(item.order_count) || 0,
          revenue: (parseInt(item.total_quantity) || 0) * (parseFloat(product.price) || 0),
        };
      })
    );

    return NextResponse.json({
      totalRevenue,
      todayRevenue,
      monthRevenue,
      ordersByDate: ordersResult.rows,
      topProducts: topProductsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

