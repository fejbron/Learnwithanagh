"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/currency";
import { Plus, Minus, X, ShoppingCart, ArrowLeft, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string | null;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
      category: string | null;
    };
  }>;
}

export default function EditOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      fetchInitialData(params.id as string);
    }
  }, [params.id]);

  const fetchInitialData = async (id: string) => {
    try {
      setLoading(true);
      const [productsRes, orderRes] = await Promise.all([
        fetch("/api/products"),
        fetch(`/api/orders/${id}`),
      ]);

      if (!productsRes.ok) throw new Error("Failed to fetch products");
      if (!orderRes.ok) throw new Error("Failed to fetch order");

      const productsData = await productsRes.json();
      const orderData: Order = await orderRes.json();

      setProducts(productsData);
      setOrderNumber(orderData.orderNumber);
      setOrderItems(
        orderData.items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          stock:
            productsData.find((p: Product) => p.id === item.productId)?.stock ??
            item.quantity, // fallback
        }))
      );
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addProductToOrder = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = orderItems.find((item) => item.productId === product.id);
    if (existingItem) {
      updateQuantity(product.id, existingItem.quantity + 1);
      return;
    }

    if (product.stock > 0) {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          stock: product.stock,
        },
      ]);
      setProductSearch("");
    } else {
      setError(`${product.name} is out of stock`);
    }
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    const item = orderItems.find((item) => item.productId === productId);
    if (!item) return;

    if (newQuantity > item.stock) {
      setError(`Only ${item.stock} units available for ${item.productName}`);
      return;
    }

    setOrderItems(
      orderItems.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      setError("Please add at least one product to the order");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order");
      }

      const order = await response.json();
      setSuccess(true);

      setTimeout(() => {
        router.push(`/orders/${order.id}`);
      }, 1200);
    } catch (err: any) {
      console.error("Error updating order:", err);
      setError(err.message || "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  const availableProducts = products.filter((p) => p.stock > 0);
  const filteredProducts = availableProducts.filter((product) => {
    const searchTerm = productSearch.toLowerCase().trim();
    if (!searchTerm) return false; // only show when typing
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm) ||
      product.id.toLowerCase().includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Order</h1>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Order</h1>
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Order</h1>
          <p className="text-gray-600">Order #{orderNumber}</p>
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

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Order updated successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Products</CardTitle>
            <CardDescription>Adjust items in this order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Type to search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
                {productSearch && filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          addProductToOrder(product.id);
                          setProductSearch("");
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(product.price)} • Stock: {product.stock}
                          {product.category && ` • ${product.category}`}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {productSearch && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProductSearch("")}
                >
                  Clear
                </Button>
              )}
            </div>
            {productSearch && filteredProducts.length === 0 && (
              <p className="text-sm text-gray-500 px-2">
                No products match your search
              </p>
            )}
          </CardContent>
        </Card>

        {orderItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Items ({orderItems.length})
              </CardTitle>
              <CardDescription>Review and adjust quantities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.productName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} each • Stock: {item.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-32 text-right">
                        <p className="font-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={orderItems.length === 0 || submitting}
            className="flex-1"
          >
            {submitting ? "Updating Order..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}


