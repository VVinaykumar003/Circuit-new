import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

import { useAuth } from "@/auth/AuthContext";
import { getAllProducts } from "@/services/productServices";
import type { Product } from "@/type/salesProduct";
import type { ColumnConfig } from "@/type/importExport.types";


const productColumns: ColumnConfig[] = [
  { key: "productName", label: "Product Name", required: true, type: "string" },
  { key: "productCode", label: "Product Code", required: true, type: "string" },
  { key: "sku", label: "SKU", type: "string" },
  { key: "barcode", label: "Barcode", type: "string" }, // Added
  { key: "productType", label: "Product Type", required: true, type: "string" }, // Changed from productGroup
  { key: "softwareCategory", label: "Category", type: "string" }, // Changed from category
  { key: "brand", label: "Brand", type: "string" }, // Added
  { key: "sellingPrice", label: "Selling Price", type: "number" }, // Changed from unitPrice
  { key: "costPrice", label: "Cost Price", type: "number" }, // Added
  { key: "stockQuantity", label: "Stock Quantity", type: "number" }, // Added
  { key: "reorderLevel", label: "Reorder Level", type: "number" }, // Added
  { key: "stockStatus", label: "Stock Status", type: "string" }, // Added
  { key: "status", label: "Status", type: "string" }, // Added
];

export const useProducts = () => {
  const { auth } = useAuth();
  const slug = auth?.slug;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [stockModalOpen, setStockModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const response = await getAllProducts(slug);

      if (response?.success && response?.data) {
        const mappedProducts = response.data.map(
          (p: Product & { _id?: string; openingStock?: number }) => ({
            ...p,
            id: p._id ?? p.id,
            unitPrice: p.sellingPrice ?? p.unitPrice ?? 0,
            lastUpdated: p.updatedAt
              ? new Date(p.updatedAt).toLocaleDateString()
              : p.lastUpdated,
            stockQuantity: p.stockQuantity ?? p.openingStock ?? 0,
            imageUrl:
              p.images?.length > 0
                ? typeof p.images[0] === "string"
                  ? p.images[0]
                  : URL.createObjectURL(p.images[0] as Blob)
                : p.imageUrl,
          })
        );

        setProducts(mappedProducts);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch products.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshFlag, stockModalOpen]);

  const refreshProducts = () => {
    setRefreshFlag((prev) => prev + 1);
  };

  return {
    products,
    loading,
    error,
    setProducts,

    fetchProducts,
    refreshProducts,

    stockModalOpen,
    setStockModalOpen,

    productColumns,
  };
};