import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { createProduct, getProductById, updateProduct } from "@/services/productServices";
import type { Product } from "@/type/salesProduct";


interface UseProductProps {
  productId?: string;
  duplicateProduct?: Product; // Type should be more specific, assuming it's a Product object
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export const useProduct = ({ productId, duplicateProduct, onSuccess, onError }: UseProductProps) => {
  // const navigate = useNavigate();
  const isEditMode = !!productId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuth();
  const slug = auth?.slug;

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);

  const {
  register,
  handleSubmit,
  watch,
  setValue,
  reset,
  control,
  formState: { errors },
} = useForm<Product>({
  defaultValues: {
    id: "",
    productName: "",
    productCode: "",
    sku: "",
    productType: "SaaS",
    softwareCategory: "",
    subCategory: "",
    status: "Active",
    description: "",
    version: "",
    releaseChannel: "Stable",
    licenseType: "One Time",
    activationType: "License Key",
    validityDays: 0,
    maxUsers: 0,
    maxDevices: 0,
    platformSupport: [],
    softwareDownloadUrl: "",
    documentationUrl: "",
    demoUrl: "",
    releaseNotesUrl: "",
    logoUrl: "",
    bannerUrl: "",
    screenshotUrls: [],
    videoUrl: "",
    features: [],
    plans: [],
    costPrice: 0,
    sellingPrice: 0,
    tags: [],
    availableForSale: true,
    tax: 18,
    discount: 0,
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    createdAt: "",
    updatedAt: "",
    images: [],
  },
});

  // Fetch Product Data if in Edit Mode
  useEffect(() => {
    if (isEditMode && productId && slug) {
      const fetchProduct = async () => {
        try {
          const product = await getProductById(productId, slug);
          if (product) {
            reset({ ...product });
            if (product.logoUrl) {
              setImagePreviews([product.logoUrl]);
            } else if (product.images && product.images.length > 0) {
              setImagePreviews( product.images
    ?.filter((img): img is string => typeof img === "string") ?? []);
            }
          }
        } catch (error) {
          console.error(error)
        }
      };
      fetchProduct();
    } else if (duplicateProduct && !isEditMode) {
      reset({
        ...duplicateProduct,
      id: "",
    createdAt: "",
    updatedAt: "",
    productName: `${duplicateProduct.productName} (Copy)`,
    productCode: `${duplicateProduct.productCode}-COPY`, // Assuming productCode exists on duplicateProduct
      });
      if (duplicateProduct.imageUrl) {
        setImagePreviews([duplicateProduct.imageUrl]);
      } else if (duplicateProduct.images && duplicateProduct.images.length > 0) {
        setImagePreviews(
  duplicateProduct.images?.filter(
    (img): img is string => typeof img === "string"
  ) ?? []
);
      }
    }
  }, [isEditMode, productId, slug, reset, duplicateProduct, onError]);

  // Watches for Real-Time UI Updates
  const profitMargin = (watch("sellingPrice") || 0) - (watch("costPrice") || 0);

  const handleAutoGenerateCode = useCallback(() => {
    const code = `PRD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    setValue("productCode", code);
  }, [setValue]);

  const loadTemplate = useCallback((type: "Software" | "Electronics" | "Services") => {
    if (type === "Software") {
      setValue("productType", "SaaS");
      setValue("tax", 18); // Default tax for software
      setValue("licenseType", "Monthly Subscription");
    }
  }, [setValue]);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Maximum 5 images allowed.");
        return;
      }
      const validFiles = newFiles.filter(f => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
      setImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleImageDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Maximum 5 images allowed.");
        return;
      }
      const validFiles = newFiles.filter(f => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
      setImages(prev => [...prev, ...validFiles]);
      setImagePreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  }, [images.length]);

  const handleDocChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validDocs = Array.from(e.target.files).filter(f => 
        f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".xlsx")
      );
      setDocuments(prev => [...prev, ...validDocs]);
    }
  }, []);

  const removeDoc = useCallback((index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

 const onSubmit = useCallback(async (data: Product) => {
    if (!slug) {
      onError?.("Authentication slug is missing.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach(item => {
    if (item instanceof File) {
        formData.append(key, item);
    } else {
        formData.append(key, String(item));
    }
});
          } else {
            formData.append(key, String(value));
          }
        }
      });

      images.forEach((img) => formData.append("images", img));
      documents.forEach((doc) => formData.append("documents", doc));

      const existingImageUrls = imagePreviews.filter(src => src.startsWith('http'));
      if (existingImageUrls.length > 0) {
        // Assuming the backend expects an array of image URLs for existing images
        // If the backend expects a single main image URL, this logic might need adjustment
        existingImageUrls.forEach(url => formData.append("images", url)); // Append existing URLs to the 'images' field
      }

      let response: any;
      if (isEditMode && productId) {
        response = await updateProduct(productId, formData, slug);
      } else {
        response = await createProduct(formData, slug);
      }

      // Make the success check more specific based on your API's consistent response structure.
      // For example, if your API consistently returns { data: { success: true, ... } }
      const isSuccess = response?.data?.success === true || response?.success === true || response?._id || response?.id;

      if (isSuccess) {
        onSuccess?.(isEditMode ? "Product updated successfully!" : "Product created successfully!");
      } else {
        onError?.(response?.data?.message || response?.message || `Failed to ${isEditMode ? "update" : "create"} product.`);
      }
    } catch (error: any) {
      onError?.(error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? "update" : "create"} product.`);
    } finally {
      setIsSubmitting(false);
    }
  }, [slug, images, documents, imagePreviews, isEditMode, productId, onSuccess, onError]);

  return {
       register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    errors,
    isSubmitting,
    images,
    imagePreviews,
    documents,
    profitMargin,
    // Removed unused variables from the old spec
    handleAutoGenerateCode,
    loadTemplate,
    handleImageChange,
    removeImage,
    handleImageDragOver,
    handleImageDrop,
    handleDocChange,
    removeDoc,
    onSubmit
  };
};