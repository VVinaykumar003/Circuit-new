

interface UseImportProductSubmitProps{
  slug: string;
  setRefreshFlag: React.Dispatch<React.SetStateAction<number>>;
  createProduct: (formData: FormData, slug: string) => Promise<void>;
}

export const importProductSubmit = ({
slug,
setRefreshFlag,
createProduct,
}: UseImportProductSubmitProps ) =>{
  

  const handleImportSubmit = async (validRows: any[]) => {
      await Promise.all(validRows.map(row => {
        const formData = new FormData();
        Object.entries(row).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") formData.append(key, String(value));
        });
        return createProduct(formData as any, slug || "default-tenant");
      }));
      setRefreshFlag(prev => prev + 1);
    };
  return{
handleImportSubmit
  }
}