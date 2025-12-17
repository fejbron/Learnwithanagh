"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Pencil, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  images?: string | null;
  discounts?: Array<{
    discountType: string;
    value: number;
  }>;
}

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  const calculateDiscountedPrice = (product: Product) => {
    if (!product.discounts || product.discounts.length === 0) {
      return product.price;
    }

    const activeDiscount = product.discounts[0];
    if (activeDiscount.discountType === "percentage") {
      return product.price * (1 - activeDiscount.value / 100);
    } else {
      return Math.max(0, product.price - activeDiscount.value);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discounted Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const discountedPrice = calculateDiscountedPrice(product);
              const hasDiscount = discountedPrice < product.price;
              let imageUrl: string | null = null;
              if (product.images) {
                try {
                  const parsed = JSON.parse(product.images);
                  if (Array.isArray(parsed) && parsed[0]) {
                    imageUrl = parsed[0];
                  }
                } catch {
                  imageUrl = null;
                }
              }

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    {hasDiscount ? (
                      <span className="text-green-600 font-semibold">
                        {formatCurrency(discountedPrice)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.stock > 10 ? "default" : "destructive"}
                    >
                      {product.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/products/${product.id}`}>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

