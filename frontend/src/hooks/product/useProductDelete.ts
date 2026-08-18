import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { deleteProduct } from "@/services/productServices";
import type { Product } from "@/type/salesProduct";

interface UseProductDeleteProps {
  slug: string;

  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const useProductDelete = ({
  slug,
  setProducts,
}: UseProductDeleteProps) => {
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const initiateDelete = useCallback((id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(productToDelete, slug);

      setProducts((prev) =>
        prev.filter((product) => product.id !== productToDelete)
      );

      toast.success("Product deleted successfully.");

      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product."
      );
    }
  }, [productToDelete, slug, setProducts]);

  return {
    productToDelete,
    deleteModalOpen,
    setProductToDelete,
    setDeleteModalOpen,

    initiateDelete,
    confirmDelete,
  };
};