import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/supabase";
import { generateId } from "@/lib/id";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      `SELECT id, name, stock, category
       FROM "Product"
       ORDER BY name ASC`
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, newStock, changeReason } = body;

    // Get current product
    const productResult = await query(
      'SELECT * FROM "Product" WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productResult.rows[0];

    // Update stock
    const updateResult = await query(
      `UPDATE "Product" 
       SET stock = $1, "updatedAt" = NOW()
       WHERE id = $2
       RETURNING *`,
      [parseInt(newStock), productId]
    );

    // Record inventory history
    const historyId = generateId();
    await query(
      `INSERT INTO "InventoryHistory" (id, "productId", "previousStock", "newStock", "changeReason", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        historyId,
        productId,
        product.stock,
        parseInt(newStock),
        changeReason || "Manual update",
      ]
    );

    return NextResponse.json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

