import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { generateId } from "@/lib/id";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discountsResult = await query(
      `SELECT d.*, 
        json_build_object('id', p.id, 'name', p.name) as product
      FROM "Discount" d
      LEFT JOIN "Product" p ON d."productId" = p.id
      ORDER BY d."createdAt" DESC`
    );

    return NextResponse.json(discountsResult.rows);
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, discountType, value, startDate, endDate, isActive } = body;

    const discountId = generateId();
    const result = await query(
      `INSERT INTO "Discount" (id, "productId", "discountType", value, "startDate", "endDate", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        discountId,
        productId || null,
        discountType,
        parseFloat(value),
        new Date(startDate),
        new Date(endDate),
        isActive !== undefined ? isActive : true,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}

