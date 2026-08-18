import { useCallback } from "react";
import { toast } from "react-toastify";
import type { Product } from "@/type/salesProduct";
import { updateProduct } from "@/services/productServices";

interface StockUpdateProductProps {
  slug: string;

  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  setStockModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  setSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;

  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;

  selectedProduct: Product | null;

  setSelectedProduct: React.Dispatch<
    React.SetStateAction<Product | null>
  >;

  stockUpdateProduct: Product | null;

  stockAdjustmentQuantity: string;

  stockAdjustmentType: string;

  setStockAdjustmentQuantity: React.Dispatch<
    React.SetStateAction<string>
  >;

  setStockAdjustmentType: React.Dispatch<
    React.SetStateAction<string>
  >;
}

export const useStockUpdateProduct = ({
  slug,
  setProducts,
  setStockModalOpen,
  setSuccessModalOpen,
  setSuccessMessage,
  selectedProduct,
  setSelectedProduct,
  stockUpdateProduct,
  stockAdjustmentQuantity,
  stockAdjustmentType,
  setStockAdjustmentQuantity,
  setStockAdjustmentType,
}: StockUpdateProductProps) => {
  const handleStockUpdate = useCallback(async () => {
    if (!stockUpdateProduct) {
      toast.warning("No product selected.");
      return;
    }

    const qty = Number(stockAdjustmentQuantity);

    if (!stockAdjustmentQuantity || Number.isNaN(qty) || qty <= 0) {
      toast.warning("Please enter a valid quantity.");
      return;
    }

    try {
      const currentStock = stockUpdateProduct.stockQuantity ?? 0;

      let newStock = currentStock;

      if (stockAdjustmentType === "Add Stock") {
        newStock = currentStock + qty;
      } else if (stockAdjustmentType === "Remove Stock") {
        newStock = currentStock - qty;

        // Prevent negative stock
        if (newStock < 0) {
          toast.warning("Stock quantity cannot be negative.");
          return;
        }
      } else if (stockAdjustmentType === "Set Stock") {
        newStock = qty;
      }

      const updatedProduct: Product = {
        ...stockUpdateProduct,
        stockQuantity: newStock,
      };

      await updateProduct(
        stockUpdateProduct.id,
        updatedProduct,
        slug
      );

      // Update product list
      setProducts((prev) =>
        prev.map((product) =>
          product.id === stockUpdateProduct.id
            ? updatedProduct
            : product
        )
      );

      // Update selected product if currently selected
      if (selectedProduct?.id === stockUpdateProduct.id) {
        setSelectedProduct(updatedProduct);
      }

      // Close modal
      setStockModalOpen(false);

      // Reset stock form
      setStockAdjustmentQuantity("");
      setStockAdjustmentType("Add Stock");

      // Success message
      setSuccessMessage("Stock updated successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Error updating stock:", error);

      const err = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update stock."
      );
    }
  }, [
    stockUpdateProduct,
    stockAdjustmentQuantity,
    stockAdjustmentType,
    slug,
    selectedProduct,
    setProducts,
    setStockModalOpen,
    setSuccessModalOpen,
    setSuccessMessage,
    setSelectedProduct,
    setStockAdjustmentQuantity,
    setStockAdjustmentType,
  ]);

  return {
    handleStockUpdate,
  };
};