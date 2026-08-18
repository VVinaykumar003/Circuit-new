import { useCallback } from "react";
import { toast } from "react-toastify";
import { updateProduct } from "@/services/productServices";
import type { Product } from "@/type/salesProduct";

interface UseProductActionsProps {
  slug: string;

  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  selectedProduct: Product | null;

  setSelectedProduct: React.Dispatch<
    React.SetStateAction<Product | null>
  >;

  setSuccessMessage: React.Dispatch<
    React.SetStateAction<string>
  >;

  setSuccessModalOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

export const useProductActions = ({
  slug,
  setProducts,
  selectedProduct,
  setSelectedProduct,
  setSuccessMessage,
  setSuccessModalOpen,
}: UseProductActionsProps) => {

  const handleArchive = useCallback(
    async (product: Product) => {
      try {
        const updatedProduct: Product = {
          ...product,
          status: "Inactive",
        };

        await updateProduct(
          product.id,
          updatedProduct,
          slug
        );

        // Update products list
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id
              ? updatedProduct
              : p
          )
        );

        // Update currently selected product
        if (selectedProduct?.id === product.id) {
          setSelectedProduct(updatedProduct);
        }

        setSuccessMessage(
          "Product archived successfully!"
        );

        setSuccessModalOpen(true);

      } catch (error: unknown) {
        console.error(
          "Error archiving product:",
          error
        );

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
          "Failed to archive product."
        );
      }
    },
    [
      slug,
      selectedProduct,
      setProducts,
      setSelectedProduct,
      setSuccessMessage,
      setSuccessModalOpen,
    ]
  );

  return {
    handleArchive,
  };
};