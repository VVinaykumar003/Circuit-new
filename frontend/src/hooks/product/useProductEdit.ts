
import { toast } from "react-toastify";
import { updateProduct } from "@/services/productServices";
import type { Product } from "@/type/salesProduct";

interface UseProductEditProps {
  slug: string;
  setEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  setSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedProduct: Product | null;
}

export const useProductEdit = ({
  slug,
  setEditModalOpen,
  setProducts,
  setSelectedProduct,
  setSuccessModalOpen,
  setSuccessMessage
  ,selectedProduct
}: UseProductEditProps ) =>{





 // handleEditSubmit now receives the editedProduct directly from the modal
  const handleEditSubmit = async (editedProduct: Product) => { 
    try {
      await updateProduct(editedProduct.id, editedProduct, slug || "default-tenant");
      setProducts(prev => prev.map(p => p.id === editedProduct.id ? editedProduct : p));
      setEditModalOpen(false);
      if (selectedProduct?.id === editedProduct.id) {
         setSelectedProduct(editedProduct);
      }
      setSuccessMessage("Product updated successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product.");
    }
    setEditModalOpen(false); // Close modal regardless of success/failure
  };


  return{
handleEditSubmit
  }
}