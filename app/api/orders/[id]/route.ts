import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query, getClient } from "@/lib/supabase";
import { generateId } from "@/lib/id";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get order with items and product details
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
                'price', p.price,
                'category', p.category
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
      [params.id]
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = {
      ...orderResult.rows[0],
      items: orderResult.rows[0].items || [],
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await client.query("BEGIN");

    // Get existing order and items
    const orderRes = await client.query(
      'SELECT * FROM "Order" WHERE id = $1',
      [params.id]
    );

    if (orderRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderRes.rows[0];

    const existingItemsRes = await client.query(
      `SELECT oi.*, p.stock, p.name
       FROM "OrderItem" oi
       JOIN "Product" p ON p.id = oi."productId"
       WHERE oi."orderId" = $1`,
      [params.id]
    );

    // Restore stock from existing items
    for (const item of existingItemsRes.rows) {
      const restoredStock = item.stock + item.quantity;
      await client.query(
        `UPDATE "Product" SET stock = $1, "updatedAt" = NOW() WHERE id = $2`,
        [restoredStock, item.productId]
      );
      const historyId = generateId();
      await client.query(
        `INSERT INTO "InventoryHistory" (id, "productId", "previousStock", "newStock", "changeReason", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          historyId,
          item.productId,
          item.stock,
          restoredStock,
          `Order ${order.orderNumber} edit - restore stock`,
        ]
      );
    }

    // Remove existing order items
    await client.query('DELETE FROM "OrderItem" WHERE "orderId" = $1', [
      params.id,
    ]);

    // Add new items and update stock
    let totalAmount = 0;

    for (const newItem of items) {
      const { productId, quantity } = newItem;
      if (!productId || !quantity || quantity <= 0) {
        throw new Error("Invalid item payload");
      }

      const productRes = await client.query(
        'SELECT id, name, price, stock FROM "Product" WHERE id = $1',
        [productId]
      );

      if (productRes.rows.length === 0) {
        throw new Error(`Product not found: ${productId}`);
      }

      const product = productRes.rows[0];

      if (product.stock < quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
        );
      }

      const itemTotal = parseFloat(product.price) * quantity;
      totalAmount += itemTotal;

      const orderItemId = generateId();
      await client.query(
        `INSERT INTO "OrderItem" (id, "orderId", "productId", quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderItemId, params.id, productId, quantity, product.price]
      );

      const newStock = product.stock - quantity;
      await client.query(
        `UPDATE "Product"
         SET stock = $1, "updatedAt" = NOW()
         WHERE id = $2`,
        [newStock, productId]
      );

      const historyId = generateId();
      await client.query(
        `INSERT INTO "InventoryHistory" (id, "productId", "previousStock", "newStock", "changeReason", "createdAt")
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          historyId,
          productId,
          product.stock,
          newStock,
          `Order ${order.orderNumber} edit - adjust stock`,
        ]
      );
    }

    // Update order total
    await client.query(
      `UPDATE "Order" SET "totalAmount" = $1 WHERE id = $2`,
      [totalAmount, params.id]
    );

    await client.query("COMMIT");

    // Return updated order
    const updatedOrder = await query(
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
                'price', p.price,
                'category', p.category
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
      [params.id]
    );

    return NextResponse.json(updatedOrder.rows[0]);
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

