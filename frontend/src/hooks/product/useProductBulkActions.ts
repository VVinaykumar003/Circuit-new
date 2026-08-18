import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { deleteProduct, updateProduct ,} from "@/services/productServices";
import type { Product , ProductStatus } from "@/type/salesProduct";



interface UseProductBulkActionsProps {
  slug: string;
  filteredProducts: Product[];
  rowSelection: Record<string, boolean>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;

  newStatus: ProductStatus;
  setNewStatus: React.Dispatch<React.SetStateAction<ProductStatus>>;
}

export const useProductBulkActions = ({
  slug,
  filteredProducts,
  rowSelection,
  setProducts,
  setRowSelection,
  newStatus,
}: UseProductBulkActionsProps) => {

  const [category, setCategory] = useState("");


   const getSelectedProducts = useCallback(() => {
       const selectedIndexes = Object.keys(rowSelection).map(Number);
   
       return selectedIndexes.map((index) => filteredProducts[index]);
     }, [rowSelection, filteredProducts]);

   const handleBulkDelete = useCallback(async () => {
    const selected = getSelectedProducts();

    if (!selected.length) return;

    try {
      await Promise.all(
        selected.map((product) => deleteProduct(product.id, slug))
      );

      setProducts((prev) =>
        prev.filter(
          (product) =>
            !selected.some((selectedProduct) => selectedProduct.id === product.id)
        )
      );

      setRowSelection({});

      toast.success(`${selected.length} products deleted.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete products.");
    }
  }, [getSelectedProducts, slug, setProducts, setRowSelection]);

    const handleBulkStatusUpdate = useCallback(async () => {
      const selected = getSelectedProducts();
  
      if (!selected.length) {
        toast.warning("Please select at least one product.");
        return;
      }
  
      try {
        await Promise.all(
          selected.map((product) =>
            updateProduct(
              product.id,
              {
                ...product,
                status : newStatus,
              },
              slug
            )
          )
        );
  
        setProducts((prev) =>
          prev.map((product) =>
            selected.some((selectedProduct) => selectedProduct.id === product.id)
              ? { ...product, status: newStatus || "Inactive" }
              : product
          )
        );
  
        setRowSelection({});
  
        toast.success("Status updated successfully.");
      } catch (err) {
        console.error(err);
        toast.error("Failed to update product status.");
      }
    }, [
      newStatus,
      slug,
      rowSelection,
      filteredProducts,
      setProducts,
      setRowSelection,
    ]);

    const handleBulkCategoryUpdate = useCallback(async () => {
       const selected = getSelectedProducts();
   
       if (!selected.length) {
         toast.warning("Please select at least one product.");
         return;
       }
   
       try {
         await Promise.all(
           selected.map((product) =>
             updateProduct(
               product.id,
               {
                 ...product,
                 softwareCategory: category,
               },
               slug
             )
           )
         );
   
         setProducts((prev) =>
           prev.map((product) =>
             selected.some((selectedProduct) => selectedProduct.id === product.id)
               ? {
                   ...product,
                   softwareCategory: category,
                 }
               : product
           )
         );
   
         setRowSelection({});
   
         toast.success("Category updated successfully.");
       } catch (err) {
         console.error(err);
         toast.error("Failed to update category.");
       }
     }, [
       category,
       slug,
       rowSelection,
       filteredProducts,
       setProducts,
       setRowSelection,
     ]);

    // const handleBulkArchive = async () => {
    //     ...
    // };

    return {
        getSelectedProducts,
        category,
        setCategory,
        handleBulkDelete,
        handleBulkStatusUpdate,
        handleBulkCategoryUpdate,
        
        // handleBulkArchive,
    };
};