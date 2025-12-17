import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'::json
        ) as discounts
      FROM "Product" p
      LEFT JOIN "Discount" d ON p.id = d."productId"
      WHERE p.id = $1
      GROUP BY p.id`,
      [params.id]
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
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, stock, category, barcode, images } = body;

    const result = await query(
      `UPDATE "Product" 
       SET name = $1, description = $2, price = $3, stock = $4, 
           category = $5, barcode = $6, images = $7, "updatedAt" = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        name,
        description || null,
        parseFloat(price),
        parseInt(stock),
        category || null,
        barcode || null,
        images ? JSON.stringify(images) : null,
        params.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.stock !== undefined) {
      updates.push(`stock = $${paramIndex++}`);
      values.push(parseInt(body.stock));
    }
    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description);
    }
    if (body.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(parseFloat(body.price));
    }
    if (body.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(body.category);
    }
    if (body.barcode !== undefined) {
      updates.push(`barcode = $${paramIndex++}`);
      values.push(body.barcode || null);
    }
    if (body.images !== undefined) {
      updates.push(`images = $${paramIndex++}`);
      values.push(body.images ? JSON.stringify(body.images) : null);
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(params.id);

    const result = await query(
      `UPDATE "Product" SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await query(
      'DELETE FROM "Product" WHERE id = $1 RETURNING id',
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

