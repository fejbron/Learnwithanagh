import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get("barcode");

    if (!barcode) {
      return NextResponse.json({ error: "Barcode is required" }, { status: 400 });
    }

    const productResult = await query(
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
      WHERE p.barcode = $1
      GROUP BY p.id`,
      [barcode]
    );

    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = {
      ...productResult.rows[0],
      discounts: productResult.rows[0].discounts || [],
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product by barcode:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

