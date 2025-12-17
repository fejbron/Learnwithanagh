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

    // Get products with active discounts
    const productsResult = await query(
      `SELECT p.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', d.id,
              'productId', d."productId",
              'discountType', d."discountType",
              'value', d.value,
              'startDate', d."startDate",
              'endDate', d."endDate",
              'isActive', d."isActive",
              'createdAt', d."createdAt",
              'updatedAt', d."updatedAt"
            )
          ) FILTER (WHERE d.id IS NOT NULL AND d."isActive" = true 
            AND d."startDate" <= NOW() AND d."endDate" >= NOW()),
          '[]'::json
        ) as discounts
      FROM "Product" p
      LEFT JOIN "Discount" d ON p.id = d."productId"
      GROUP BY p.id
      ORDER BY p."createdAt" DESC`
    );

    const products = productsResult.rows.map((row: any) => ({
      ...row,
      discounts: row.discounts || [],
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
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
    const { name, description, price, stock, category, barcode, images } = body;

    const productId = generateId();
    const result = await query(
      `INSERT INTO "Product" (id, name, description, price, stock, category, barcode, images, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [
        productId,
        name,
        description || null,
        parseFloat(price),
        parseInt(stock),
        category || null,
        barcode || null,
        images ? JSON.stringify(images) : null,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    // Return more detailed error message
    const errorMessage = error?.message || "Failed to create product";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

