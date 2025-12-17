"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
}

interface DiscountFormProps {
  products: Product[];
  discount?: {
    id: string;
    productId: string | null;
    discountType: string;
    value: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function DiscountForm({
  products,
  discount,
  onSubmit,
  onCancel,
}: DiscountFormProps) {
  const [productId, setProductId] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (discount) {
      setProductId(discount.productId || "");
      setDiscountType(discount.discountType);
      setValue(discount.value.toString());
      setStartDate(new Date(discount.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(discount.endDate).toISOString().split("T")[0]);
      setIsActive(discount.isActive);
    }
  }, [discount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      productId: productId || null,
      discountType,
      value,
      startDate,
      endDate,
      isActive,
    };

    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Product (Optional - leave empty for global discount)</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Select product or leave empty for global" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Global Discount</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discountType">Discount Type</Label>
        <Select value={discountType} onValueChange={setDiscountType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">
          Discount Value{" "}
          {discountType === "percentage"
            ? "(0-100)"
            : "(Fixed amount in currency)"}
        </Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : discount
            ? "Update Discount"
            : "Create Discount"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

