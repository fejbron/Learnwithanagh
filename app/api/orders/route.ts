import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, getClient } from "@/lib/supabase";
import { generateId } from "@/lib/id";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all orders with their items and product details
    const ordersResult = await query(
      `SELECT o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi."productId",
              'quantity', oi.quantity,
              'price', oi.price,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'price', p.price
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM "Order" o
      LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
      LEFT JOIN "Product" p ON oi."productId" = p.id
      GROUP BY o.id
      ORDER BY o."createdAt" DESC`
    );

    const orders = ordersResult.rows.map((row: any) => ({
      ...row,
      items: row.items || [],
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await getClient();
  
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items } = body; // items: [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      let totalAmount = 0;
      const orderItems: any[] = [];

      // Process each item
      for (const item of items) {
        const { productId, quantity } = item;

        if (!productId || !quantity || quantity <= 0) {
          throw new Error(`Invalid item: productId and quantity are required`);
        }

        // Get product details
        const productResult = await client.query(
          'SELECT * FROM "Product" WHERE id = $1',
          [productId]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product not found: ${productId}`);
        }

        const product = productResult.rows[0];

        // Check stock availability
        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
        }

        // Calculate item total (considering discounts if any)
        const itemPrice = parseFloat(product.price);
        const itemTotal = itemPrice * quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId,
          quantity,
          price: itemPrice,
          productName: product.name,
          previousStock: product.stock,
        });
      }

      // Create order
      const orderId = generateId();
      await client.query(
        `INSERT INTO "Order" (id, "orderNumber", "totalAmount", "createdAt")
         VALUES ($1, $2, $3, NOW())`,
        [orderId, orderNumber, totalAmount]
      );

      // Create order items and update stock
      for (const item of orderItems) {
        const orderItemId = generateId();
        
        // Create order item
        await client.query(
          `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderItemId, orderId, item.productId, item.quantity, item.price]
        );

        // Update product stock
        const newStock = item.previousStock - item.quantity;
        await client.query(
          `UPDATE "Product" 
           SET stock = $1, "updatedAt" = NOW()
           WHERE id = $2`,
          [newStock, item.productId]
        );

        // Record inventory history
        const historyId = generateId();
        await client.query(
          `INSERT INTO "InventoryHistory" (id, "productId", "previousStock", "newStock", "changeReason", "createdAt")
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            historyId,
            item.productId,
            item.previousStock,
            newStock,
            `Order ${orderNumber} - Sold ${item.quantity} units`,
          ]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      // Fetch the created order with items
      const orderResult = await query(
        `SELECT o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'productId', oi."productId",
                'quantity', oi.quantity,
                'price', oi.price,
                'product', json_build_object(
                  'id', p.id,
                  'name', p.name,
                  'price', p.price
                )
              )
            ) FILTER (WHERE oi.id IS NOT NULL),
            '[]'::json
          ) as items
        FROM "Order" o
        LEFT JOIN "OrderItem" oi ON o.id = oi."orderId"
        LEFT JOIN "Product" p ON oi."productId" = p.id
        WHERE o.id = $1
        GROUP BY o.id`,
        [orderId]
      );

      return NextResponse.json(orderResult.rows[0], { status: 201 });
    } catch (error: any) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

