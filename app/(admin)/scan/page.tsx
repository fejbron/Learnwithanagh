"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarcodeScanner } from "@/components/admin/BarcodeScanner";
import { ScannerErrorBoundary } from "@/components/admin/ScannerErrorBoundary";
import { ProductForm } from "@/components/admin/ProductForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string | null;
  barcode: string | null;
}

export default function ScanPage() {
  const router = useRouter();
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [existingProduct, setExistingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  const handleScan = async (barcode: string) => {
    setScannedBarcode(barcode);
    setError(null);
    setLoading(true);
    setShowScanner(false);

    try {
      // Check if product exists
      const response = await fetch(`/api/products/barcode?barcode=${encodeURIComponent(barcode)}`);
      
      if (response.ok) {
        const product = await response.json();
        setExistingProduct(product);
      } else if (response.status === 404) {
        // Product doesn't exist - show form to create it
        setExistingProduct(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to check product");
      }
    } catch (err) {
      console.error("Error checking product:", err);
      setError("Failed to check product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          barcode: scannedBarcode,
        }),
      });

      if (response.ok) {
        router.push("/products");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product");
    }
  };

  const handleUpdateStock = async (newStock: number) => {
    if (!existingProduct) return;

    try {
      const response = await fetch(`/api/products/${existingProduct.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stock: newStock,
        }),
      });

      if (response.ok) {
        router.push("/products");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update stock");
      }
    } catch (err) {
      console.error("Error updating stock:", err);
      setError("Failed to update stock");
    }
  };

  const resetScan = () => {
    setScannedBarcode(null);
    setExistingProduct(null);
    setError(null);
    setShowScanner(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scan Product</h1>
          <p className="text-gray-600">Scan barcode to add or update products</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showScanner && (
        <ScannerErrorBoundary>
          <BarcodeScanner onScan={handleScan} />
        </ScannerErrorBoundary>
      )}

      {loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking product...</p>
          </CardContent>
        </Card>
      )}

      {!loading && scannedBarcode && existingProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Product Found</CardTitle>
            <CardDescription>Product already exists. Update stock or go to product page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Name:</strong> {existingProduct.name}</p>
              <p><strong>Barcode:</strong> {existingProduct.barcode}</p>
              <p><strong>Current Stock:</strong> {existingProduct.stock}</p>
              <p><strong>Price:</strong> {formatCurrency(existingProduct.price)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleUpdateStock(existingProduct.stock + 1)}
                variant="outline"
              >
                Add 1 to Stock
              </Button>
              <Button
                onClick={() => router.push(`/products/${existingProduct.id}`)}
              >
                Edit Product
              </Button>
              <Button onClick={resetScan} variant="outline">
                Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && scannedBarcode && !existingProduct && (
        <Card>
          <CardHeader>
            <CardTitle>New Product</CardTitle>
            <CardDescription>
              Product with barcode &quot;{scannedBarcode}&quot; not found. Create a new product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProductForm
              onSubmit={handleCreateProduct}
              onCancel={resetScan}
              initialBarcode={scannedBarcode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

