"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Discount {
  id: string;
  productId: string | null;
  product: { id: string; name: string } | null;
  discountType: string;
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch("/api/discounts");
      if (response.ok) {
        const data = await response.json();
        setDiscounts(data);
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this discount?")) {
      return;
    }

    try {
      const response = await fetch(`/api/discounts/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchDiscounts();
      } else {
        alert("Failed to delete discount");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      alert("Failed to delete discount");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discounts</h1>
          <p className="text-gray-600">Manage product discounts and promotions</p>
        </div>
        <Link href="/discounts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Discount
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
          <CardDescription>View and manage all discounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500">
                      No discounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell>
                        {discount.product ? discount.product.name : "Global"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {discount.discountType === "percentage"
                            ? "Percentage"
                            : "Fixed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {discount.discountType === "percentage"
                          ? `${discount.value}%`
                          : formatCurrency(discount.value)}
                      </TableCell>
                      <TableCell>
                        {new Date(discount.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(discount.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={discount.isActive ? "default" : "secondary"}
                        >
                          {discount.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(discount.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

