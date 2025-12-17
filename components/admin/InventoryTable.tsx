"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  category: string | null;
}

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdate: (productId: string, newStock: number, reason: string) => Promise<void>;
}

export function InventoryTable({ items, onUpdate }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setStockValues({ ...stockValues, [item.id]: item.stock.toString() });
  };

  const handleSave = async (item: InventoryItem) => {
    const newStock = parseInt(stockValues[item.id] || item.stock.toString());
    setLoading(item.id);
    await onUpdate(item.id, newStock, "Manual stock update");
    setEditingId(null);
    setLoading(null);
  };

  const handleCancel = (item: InventoryItem) => {
    setEditingId(null);
    setStockValues({ ...stockValues, [item.id]: item.stock.toString() });
  };

  return (
    <div className="space-y-4">
      {items.filter((item) => item.stock < 10).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {items.filter((item) => item.stock < 10).length} product(s) have
            low stock (less than 10 units)
          </AlertDescription>
        </Alert>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isEditing = editingId === item.id;
                const isLowStock = item.stock < 10;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      {item.category && (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={stockValues[item.id] || item.stock}
                          onChange={(e) =>
                            setStockValues({
                              ...stockValues,
                              [item.id]: e.target.value,
                            })
                          }
                          className="w-24"
                        />
                      ) : (
                        <Badge
                          variant={isLowStock ? "destructive" : "default"}
                        >
                          {item.stock}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(item)}
                            disabled={loading === item.id}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            {loading === item.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(item)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

