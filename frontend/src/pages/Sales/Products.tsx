import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdSave, MdContentCopy, MdAttachment, MdDelete, MdAdd, MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {useAuth} from "@/auth/AuthContext";
import { createProduct, getProductById, updateProduct } from "@/services/productServices";

/* ─────────────────────────── types ─────────────────────────── */
const productSchema = z.object({
  // Basic
  productGroup: z.string().min(1, "Product Group is required"),
  productName: z.string().min(1, "Product Name is required").max(200),
  productCode: z.string().min(1, "Product Code is required"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  status: z.enum(["Active", "Inactive", "Discontinued"]).default("Active"),
  description: z.string().optional(),
  
  // Pricing
  costPrice: z.coerce.number().min(0, "Must be a positive number"),
  sellingPrice: z.coerce.number().min(0, "Must be a positive number"),
  tax: z.coerce.number().min(0).max(100).default(18),
  discount: z.coerce.number().min(0).max(100).default(0),
  
  // Inventory
  stockTracking: z.boolean().default(true),
  openingStock: z.coerce.number().min(0, "Cannot be negative").default(0),
  reorderLevel: z.coerce.number().min(0, "Cannot be negative").default(0),
  uom: z.string().optional(),
  warehouse: z.string().optional(),
  
  // Categorization
  brand: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  
  // Sales Config
  availableForSale: z.boolean().default(true),
  allowDiscount: z.boolean().default(true),
  minQty: z.coerce.number().min(0, "Cannot be negative").default(0),
  maxQty: z.coerce.number().min(0).optional(),
  commission: z.coerce.number().min(0).max(100).default(0),
  
  // SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.maxQty !== undefined && data.maxQty > 0 && data.maxQty <= data.minQty) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum Quantity must be greater than Minimum Quantity",
      path: ["maxQty"],
    });
  }
});

type ProductFormValues = z.infer<typeof productSchema>;

/* ── Shared Component: Form Row ── */
const FormRow = ({ label, required, error, children }: { label: string, required?: boolean, error?: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
    <label className="text-sm font-medium text-base-content/80 pt-2.5">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="w-full">
      {children}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  </div>
);

/* ─────────────────────────── component ─────────────────────── */
export default function NewProduct() { 
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const duplicateProduct = location.state?.duplicateProduct;
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { auth } = useAuth();
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Custom Brands and Categories State
  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [newBrandInput, setNewBrandInput] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: "Active",
      stockTracking: true,
      tax: 18,
      discount: 0,
      openingStock: 0,
      reorderLevel: 0,
      availableForSale: true,
      allowDiscount: true,
      minQty: 0,
      commission: 0,
      costPrice: 0,
      sellingPrice: 0,
    }
  });

  /* ── Fetch Product Data if in Edit Mode ── */
  useEffect(() => {
    if (isEditMode && id && auth?.slug) {
      const fetchProduct = async () => {
        try {
          const product = await getProductById(id, auth.slug);
          if (product) {
            // Map backend product structure to form values
            reset({ ...product });
            
            if (product.imageUrl) {
              setImagePreviews([product.imageUrl]);
            } else if (product.images && product.images.length > 0) {
              setImagePreviews(product.images);
            }
          }
        } catch (error: unknown) {
          toast.error("Failed to load product details.",error);
        }
      };
      fetchProduct();
    } else if (duplicateProduct && !isEditMode) {
      // Hydrate form using the duplicated product data
      reset({
        ...duplicateProduct,
        productName: `${duplicateProduct.productName} (Copy)`,
        productCode: `${duplicateProduct.productCode}-COPY`,
      });
      if (duplicateProduct.imageUrl) {
        setImagePreviews([duplicateProduct.imageUrl]);
      } else if (duplicateProduct.images && duplicateProduct.images.length > 0) {
        setImagePreviews(duplicateProduct.images);
      }
    }
  }, [isEditMode, id, auth?.slug, reset, duplicateProduct]);

  // Watches for Real-Time UI Updates
  const wCostPrice = watch("costPrice") || 0;
  const wSellingPrice = watch("sellingPrice") || 0;
  const profitMargin = wSellingPrice - wCostPrice;

  const wProductGroup = watch("productGroup");
  const wProductCode = watch("productCode");
  const wStatus = watch("status");
  const wStock = watch("openingStock");
  const wBrand = watch("brand");

  /* ── Smart Features ── */
  const handleAutoGenerateCode = () => {
    const code = `PRD-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    setValue("productCode", code);
  };

  const loadTemplate = (type: string) => {
    if (type === "Electronics") {
      setValue("productGroup", "Electronics");
      setValue("tax", 18);
      setValue("uom", "Piece");
    }
  };

  const handleAddBrand = () => {
    if (newBrandInput.trim()) {
      setCustomBrands(prev => [...prev, newBrandInput.trim()]);
      setValue("brand", newBrandInput.trim());
      setNewBrandInput("");
      (document.getElementById('add_brand_modal') as HTMLDialogElement).close();
    }
  };

  const handleAddCategory = () => {
    if (newCategoryInput.trim()) {
      setCustomCategories(prev => [...prev, newCategoryInput.trim()]);
      setValue("category", newCategoryInput.trim());
      setNewCategoryInput("");
      (document.getElementById('add_category_modal') as HTMLDialogElement).close();
    }
  };

  /* ── Auto Save Draft ── */
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Product Draft auto-saved...");
    }, 60000); // Save draft every 60 seconds
    return () => clearInterval(interval);
  }, []);

  /* ── File Uploads ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Maximum 5 images allowed.");
        return;
      }
      const validFiles = newFiles.filter(f => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
      setImages([...images, ...validFiles]);
      setImagePreviews([...imagePreviews, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      if (images.length + newFiles.length > 5) {
        toast.error("Maximum 5 images allowed.");
        return;
      }
      const validFiles = newFiles.filter(f => ["image/jpeg", "image/png", "image/webp"].includes(f.type));
      setImages([...images, ...validFiles]);
      setImagePreviews([...imagePreviews, ...validFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validDocs = Array.from(e.target.files).filter(f => 
        f.name.endsWith(".pdf") || f.name.endsWith(".docx") || f.name.endsWith(".xlsx")
      );
      setDocuments([...documents, ...validDocs]);
    }
  };

  const removeDoc = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  /* ── Submit Handler ── */
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert form data and files into a multipart/form-data payload
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((val) => formData.append(key, val));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      images.forEach((img) => formData.append("images", img));
      documents.forEach((doc) => formData.append("documents", doc));

      // Append existing image URLs if any (useful for duplicate)
      const existingImages = imagePreviews.filter(src => src.startsWith('http'));
      if (existingImages.length > 0) {
        formData.append("imageUrl", existingImages[0]);
      }

      let response: { 
        success?: boolean; 
        status?: number; 
        data?: { success?: boolean; message?: string }; 
        _id?: string; 
        id?: string; 
        error?: string | boolean; 
        message?: string; 
      } | undefined;
      if (isEditMode && id) {
        response = await updateProduct(id, formData as any, auth.slug || "default-tenant");
      } else {
        console.log(formData)
        response = await createProduct(formData as any, auth.slug || "default-tenant");
      }
      
      // Check for common backend success indicators (success boolean, HTTP status, or returned IDs)
      const isSuccess = response && (
        response.success === true || 
        response.status === 200 || 
        response.status === 201 || 
        response.data?.success === true || 
        response._id || 
        response.id ||
        isEditMode // Assume implicit success on edit if no error is thrown
      );
      // If there's no success property but also no error/message, assume it's implicitly successful
      const isImplicitSuccess = response && response.success === undefined && !response.error && !response.message;

      if (isSuccess || isImplicitSuccess) {
        setSuccessMessage(isEditMode ? "Product updated successfully!" : "Product created successfully!");
        setSuccessModalOpen(true);
      } else {
        toast.error(response?.data?.message || response?.message || `Failed to ${isEditMode ? "update" : "create"} product.`);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || `Failed to ${isEditMode ? "update" : "create"} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">{isEditMode ? "Edit Product" : "Add Product"}</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Products</li>
              <li className="font-semibold text-primary">{isEditMode ? "Edit Product" : "Add Product"}</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => loadTemplate("Electronics")}>
            <MdContentCopy size={16} /> Load Template
          </button>
          <button type="button" className="btn btn-outline btn-sm gap-2">
            <MdSave size={16} /> Save Draft
          </button>
          <button onClick={() => navigate(-1)} type="button" className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Basic Product Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              1. Basic Product Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Product Group" required error={errors.productGroup?.message}>
                <select {...register("productGroup")} className={`select select-bordered w-full ${errors.productGroup ? "select-error" : ""}`}>
                  <option value="">-Select Group-</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Software">Software</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Services">Services</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </FormRow>
              
              <FormRow label="Product Name" required error={errors.productName?.message}>
                <input {...register("productName")} className={`input input-bordered w-full ${errors.productName ? "input-error" : ""}`} placeholder="Enter product name" />
              </FormRow>
              
              <FormRow label="Product Code" required error={errors.productCode?.message}>
                <div className="flex gap-2">
                  <input {...register("productCode")} className={`input input-bordered w-full ${errors.productCode ? "input-error" : ""}`} placeholder="e.g. PRD-001" />
                  <button type="button" onClick={handleAutoGenerateCode} className="btn btn-outline btn-primary whitespace-nowrap">Auto Generate</button>
                </div>
              </FormRow>

              <FormRow label="Product SKU" error={errors.sku?.message}>
                <input {...register("sku")} className="input input-bordered w-full" placeholder="Stock Keeping Unit" />
              </FormRow>

              <FormRow label="Barcode" error={errors.barcode?.message}>
                <input {...register("barcode")} className="input input-bordered w-full" placeholder="Enter barcode / UPC" />
              </FormRow>

              <FormRow label="Product Status">
                <select {...register("status")} className="select select-bordered w-full max-w-xs">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </FormRow>

              <FormRow label="Description" error={errors.description?.message}>
                <textarea {...register("description")} className="textarea textarea-bordered w-full" rows={4} placeholder="Product description..."></textarea>
              </FormRow>
            </div>
          </div>

          {/* 2. Pricing Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              2. Pricing Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Cost Price" required error={errors.costPrice?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                  <input {...register("costPrice")} type="number" step="0.01" className={`input input-bordered w-full pl-8 ${errors.costPrice ? "input-error" : ""}`} placeholder="0.00" />
                </div>
              </FormRow>

              <FormRow label="Selling Price" required error={errors.sellingPrice?.message}>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                  <input {...register("sellingPrice")} type="number" step="0.01" className={`input input-bordered w-full pl-8 ${errors.sellingPrice ? "input-error" : ""}`} placeholder="0.00" />
                </div>
              </FormRow>

              <FormRow label="Tax Percentage (%)" error={errors.tax?.message}>
                <input {...register("tax")} type="number" className="input input-bordered w-full max-w-xs" placeholder="18" />
              </FormRow>

              <FormRow label="Discount Percentage (%)" error={errors.discount?.message}>
                <input {...register("discount")} type="number" className="input input-bordered w-full max-w-xs" placeholder="0" />
              </FormRow>

              <FormRow label="Profit Margin">
                <div className="relative">
                  <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                  <input type="number" readOnly value={profitMargin > 0 ? profitMargin : 0} className="input input-bordered w-full max-w-xs pl-8 bg-base-200 text-success font-bold" />
                </div>
                <p className="text-xs text-base-content/50 mt-1">Calculated automatically (Selling Price - Cost Price)</p>
              </FormRow>
            </div>
          </div>

          {/* 3. Inventory Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              3. Inventory Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Stock Tracking">
                <input type="checkbox" {...register("stockTracking")} className="toggle toggle-success" />
              </FormRow>

              <FormRow label="Opening Stock" error={errors.openingStock?.message}>
                <input {...register("openingStock")} type="number" className="input input-bordered w-full max-w-xs" />
              </FormRow>

              <FormRow label="Reorder Level" error={errors.reorderLevel?.message}>
                <input {...register("reorderLevel")} type="number" className="input input-bordered w-full max-w-xs" />
              </FormRow>

              <FormRow label="Unit of Measure" error={errors.uom?.message}>
                <select {...register("uom")} className="select select-bordered w-full max-w-xs">
                  <option value="">-Select UOM-</option>
                  <option value="Piece">Piece</option>
                  <option value="Box">Box</option>
                  <option value="Kg">Kg</option>
                  <option value="Gram">Gram</option>
                  <option value="Liter">Liter</option>
                  <option value="Meter">Meter</option>
                </select>
              </FormRow>

              <FormRow label="Warehouse" error={errors.warehouse?.message}>
                <select {...register("warehouse")} className="select select-bordered w-full max-w-xs">
                  <option value="">-Select Warehouse-</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Secondary Depot">Secondary Depot</option>
                </select>
              </FormRow>
            </div>
          </div>

          {/* 4. Product Categorization */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              4. Product Categorization
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Brand" error={errors.brand?.message}>
                <div className="flex gap-2 max-w-xs">
                  <select {...register("brand")} className="select select-bordered w-full">
                    <option value="">-Select Brand-</option>
                    <option value="Sony">Sony</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Apple">Apple</option>
                    {customBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <button type="button" onClick={() => (document.getElementById('add_brand_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-square"><MdAdd size={18} /></button>
                </div>
              </FormRow>

              <FormRow label="Category" error={errors.category?.message}>
                <div className="flex gap-2 max-w-xs">
                  <select {...register("category")} className="select select-bordered w-full">
                    <option value="">-Select Category-</option>
                    <option value="Audio">Audio</option>
                    <option value="Laptops">Laptops</option>
                    {customCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button type="button" onClick={() => (document.getElementById('add_category_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-square"><MdAdd size={18} /></button>
                </div>
              </FormRow>

              <FormRow label="Sub Category" error={errors.subCategory?.message}>
                <select {...register("subCategory")} className="select select-bordered w-full max-w-xs">
                  <option value="">-Select Sub Category-</option>
                  <option value="Headphones">Headphones</option>
                  <option value="Gaming Laptops">Gaming Laptops</option>
                </select>
              </FormRow>

              <FormRow label="Tags">
                <select {...register("tags")} multiple className="select select-bordered w-full h-24">
                  <option value="Best Seller">Best Seller</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Featured">Featured</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Seasonal">Seasonal</option>
                </select>
                <p className="text-xs text-base-content/50 mt-1">Hold Ctrl (or Cmd) to select multiple tags.</p>
              </FormRow>
            </div>
          </div>

          {/* 5. Sales Configuration */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              5. Sales Configuration
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Available For Sale">
                <input type="checkbox" {...register("availableForSale")} className="toggle toggle-success" />
              </FormRow>

              <FormRow label="Allow Discount">
                <input type="checkbox" {...register("allowDiscount")} className="toggle toggle-success" />
              </FormRow>

              <FormRow label="Minimum Sale Qty" error={errors.minQty?.message}>
                <input {...register("minQty")} type="number" className="input input-bordered w-full max-w-xs" />
              </FormRow>

              <FormRow label="Maximum Sale Qty" error={errors.maxQty?.message}>
                <input {...register("maxQty")} type="number" className={`input input-bordered w-full max-w-xs ${errors.maxQty ? "input-error" : ""}`} />
              </FormRow>

              <FormRow label="Sales Commission (%)" error={errors.commission?.message}>
                <input {...register("commission")} type="number" className="input input-bordered w-full max-w-xs" />
              </FormRow>
            </div>
          </div>

          {/* 6. Product Images */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              6. Product Images
            </div>
            <div className="collapse-content pt-5">
              <div 
                onClick={() => fileInputRef.current?.click()}
        onDragOver={handleImageDragOver}
        onDrop={handleImageDrop}
                className="border-2 border-dashed border-base-300 rounded-xl p-8 text-center hover:bg-base-200/50 transition-colors cursor-pointer"
              >
                <MdAttachment className="mx-auto text-base-content/40 mb-2" size={32} />
                <p className="text-sm font-medium text-base-content/70">Drag & Drop images or click to upload</p>
                <p className="text-xs text-base-content/50 mt-1">Allowed: JPG, PNG, WEBP. Max 5 images.</p>
                <input 
                  type="file" 
                  multiple 
                  accept=".jpg,.jpeg,.png,.webp" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                />
              </div>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-base-300 shadow-sm">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeImage(idx)} 
                        className="absolute top-1 right-1 bg-error text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 7. Documents */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              7. Documents
            </div>
            <div className="collapse-content pt-5">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => docInputRef.current?.click()} className="btn btn-outline btn-sm">Upload Documents</button>
                <span className="text-xs text-base-content/50">Allow: PDF, DOCX, XLSX</span>
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf,.docx,.xlsx" 
                  className="hidden" 
                  ref={docInputRef} 
                  onChange={handleDocChange} 
                />
              </div>
              
              {documents.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {documents.map((doc, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300">
                      <span className="text-sm font-medium truncate max-w-xs">{doc.name}</span>
                      <button type="button" onClick={() => removeDoc(idx)} className="text-error hover:text-error/70">
                        <MdDelete size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 8. SEO Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              8. SEO Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Meta Title" error={errors.metaTitle?.message}>
                <input {...register("metaTitle")} className="input input-bordered w-full" placeholder="Enter SEO Title" />
              </FormRow>
              <FormRow label="Meta Description" error={errors.metaDescription?.message}>
                <textarea {...register("metaDescription")} className="textarea textarea-bordered w-full" rows={3} placeholder="SEO description..."></textarea>
              </FormRow>
              <FormRow label="Keywords" error={errors.keywords?.message}>
                <input {...register("keywords")} className="input input-bordered w-full" placeholder="Comma separated keywords" />
              </FormRow>
            </div>
          </div>

          {/* 9. Audit Information (Read-only visible if Edit Mode theoretically) */}
          <div className="collapse bg-base-100 border border-base-300 rounded-xl opacity-60">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              9. Audit Information (Read-Only)
            </div>
            <div className="collapse-content pt-5">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Created By:</span> Admin User</div>
                  <div><span className="font-medium">Created On:</span> {new Date().toLocaleDateString()}</div>
                  <div><span className="font-medium">Updated By:</span> -</div>
                  <div><span className="font-medium">Updated On:</span> -</div>
               </div>
            </div>
          </div>

        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">Product Summary</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Status</span>
                <div className="mt-1">
                  <div className={`badge ${wStatus === 'Active' ? 'badge-success text-white' : wStatus === 'Inactive' ? 'badge-warning' : 'badge-error text-white'} badge-lg font-bold`}>
                    {wStatus || "Active"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Product Group</span>
                <p className="font-medium text-base-content mt-1">{wProductGroup || "Uncategorized"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Product Code</span>
                <p className="font-mono text-primary font-bold mt-1">{wProductCode || "Pending..."}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Selling Price</span>
                <p className="font-medium text-success text-lg mt-1">₹{wSellingPrice.toLocaleString()}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Current Stock</span>
                <p className="font-medium mt-1">{wStock} units</p>
              </div>
              
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Brand</span>
                <p className="font-medium mt-1">{wBrand || "No Brand"}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-sm">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (isEditMode ? "Update Product" : "Save Product")}
              </button>
              <button type="button" onClick={() => reset()} className="btn btn-outline w-full shadow-sm">
                Reset
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Modals ── */}
      <dialog id="add_brand_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Brand</h3>
          <input type="text" value={newBrandInput} onChange={(e) => setNewBrandInput(e.target.value)} className="input input-bordered w-full mt-4" placeholder="Enter Brand Name" />
          <div className="modal-action flex gap-2">
            <form method="dialog">
              <button className="btn btn-ghost" onClick={() => setNewBrandInput("")}>Cancel</button>
            </form>
            <button type="button" className="btn btn-primary" onClick={handleAddBrand}>Save Brand</button>
          </div>
        </div>
      </dialog>

      <dialog id="add_category_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Category</h3>
          <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} className="input input-bordered w-full mt-4" placeholder="Enter Category Name" />
          <div className="modal-action flex gap-2">
            <form method="dialog">
              <button className="btn btn-ghost" onClick={() => setNewCategoryInput("")}>Cancel</button>
            </form>
            <button type="button" className="btn btn-primary" onClick={handleAddCategory}>Save Category</button>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">{successMessage}</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => { setSuccessModalOpen(false); navigate("/sales/products"); }}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}

/* ─────────────────────────── usage example ─────────────────────

import NewProduct from "./NewProduct";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function NewProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/sales/products", data);
      toast.success("Product created!");
      navigate("/sales/products");
    } catch (err) {
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NewProduct
      productGroups={["Electronics", "Software", "Hardware"]}
      onSubmit={handleSubmit}
      isLoading={loading}
    />
  );
}

──────────────────────────────────────────────────────────────── */