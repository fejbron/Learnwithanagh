"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
}

export default function NewDiscountPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push("/discounts");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create discount");
      }
    } catch (error) {
      console.error("Error creating discount:", error);
      alert("Failed to create discount");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Discount</h1>
        <p className="text-gray-600">Set up a new discount or promotion</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount Details</CardTitle>
          <CardDescription>Enter the discount information below</CardDescription>
        </CardHeader>
        <CardContent>
          <DiscountForm
            products={products}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

