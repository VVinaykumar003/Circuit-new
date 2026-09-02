import React, { useState, useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdSave, MdContentCopy, MdAttachment, MdDelete, MdAdd, MdCheckCircle, MdInfoOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { FaWindows, FaApple, FaLinux, FaAndroid, FaAppleWhole, FaGlobe } from "react-icons/fa6";
import {InfoCard ,FormSection, FormRow,  } from "@/components/sales/Product/ProcductComponent";
import { PageHeader } from "@/components/common";


/* ─────────────────────────── component ─────────────────────── */
export default function NewProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const duplicateProduct = location.state?.duplicateProduct;
  const isEditMode = !!id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState(""); // Added state for newBrandInput
  const [newCategoryInput, setNewCategoryInput] = useState(""); // Added state for newCategoryInput
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  // const docInputRef = useRef<HTMLInputElement>(null);


  const { // Destructure from useProduct
    register,
    handleSubmit,
    watch,
    control,
    reset,
    errors,
    imagePreviews,
    profitMargin,
    // Removed unused variables from the old spec
    handleAutoGenerateCode,
    loadTemplate,
    handleImageChange,
    removeImage,
    handleImageDragOver,
    handleImageDrop,
    onSubmit: hookOnSubmit,
  } = useProduct({
    productId: id,
    duplicateProduct,
    onSuccess: (message) => {
      setSuccessMessage(message);
      setSuccessModalOpen(true);
    },
    onError: (message) => {
      toast.error(message);
    },
  });

  // Placeholder functions for adding brand/category
  const handleAddBrand = () => {
    // Logic to add brand (e.g., API call, update state)
    console.log("Adding brand:", newBrandInput);
  };

  const handleAddCategory = () => {
    // Logic to add category (e.g., API call, update state)
    console.log("Adding category:", newCategoryInput);
  };
  // Use hookIsSubmitting from useProduct for the button disabled state
  const isSubmittingLocal = isSubmitting;

  return (
    <div className="min-h-screen bg-base-200 p-3 md:p-4 lg:p-6 font-sans">
      
      {/* ── Page Header ── */}
      <PageHeader
        title={isEditMode ? "Edit Software Product" : "Add New Software Product"}
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Sales" },
          { label: "Products" },
          { label: isEditMode ? "Edit Product" : "Add Product", active: true },
        ]}
        cancel
        actions={[
          {
            label: "Load Template",
            icon: <MdContentCopy size={14} />,
            variant: "outline",
            onClick: () => loadTemplate("Software"),
          },
          {
            label: "Save Draft",
            icon: <MdSave size={14} />,
            variant: "outline",
          },
        ]}
      />

      <form onSubmit={handleSubmit(hookOnSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* 1. Software Information */}
          <FormSection title="1. Software Information" defaultExpanded>
            <FormRow label="Product Name" required error={errors.productName?.message}>
              <input {...register("productName")} className={`input input-bordered w-full ${errors.productName ? "input-error" : ""}`} placeholder="e.g. Circuit CRM Enterprise" />
            </FormRow>
            
            <FormRow label="Product Code" required error={errors.productCode?.message}>
              <div className="flex gap-2">
                <input {...register("productCode")} className={`input input-bordered w-full ${errors.productCode ? "input-error" : ""}`} placeholder="e.g. CRM-ENT-001" />
                <button type="button" onClick={handleAutoGenerateCode} className="btn btn-outline btn-primary btn-xs whitespace-nowrap">Auto Generate</button>
              </div>
            </FormRow>

            <FormRow label="SKU" error={errors.sku?.message}>
              <input {...register("sku")} className="input input-bordered w-full" placeholder="Stock Keeping Unit (optional)" />
            </FormRow>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <FormRow label="Product Type" required error={errors.productType?.message}>
                <select {...register("productType")} className={`select select-bordered width-full ${errors.productType ? "select-error" : ""}`}>
                  <option value="">-Select Type-</option>
                  <option value="ERP">ERP</option>
                  <option value="CRM">CRM</option>
                  <option value="SaaS">SaaS</option>
                  <option value="POS">POS</option>
                  <option value="HRMS">HRMS</option>
                  <option value="Other">Other</option>
                </select>
              </FormRow>
              
              <FormRow label="Software Category" error={errors.softwareCategory?.message}>
                <select {...register("softwareCategory")} className="select select-bordered width-full">
                  <option value="">-Select Category-</option>
                  <option value="Business Intelligence">Business Intelligence</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Marketing Automation">Marketing Automation</option>
                  <option value="Cloud Storage">Cloud Storage</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </FormRow>
            </div>

            <FormRow label="Sub Category" error={errors.subCategory?.message}>
              <input {...register("subCategory")} className="input input-bordered width-full" placeholder="e.g. Sales CRM, Financial ERP" />
            </FormRow>

            <FormRow label="Status">
              <select {...register("status")} className="select select-bordered width-full max-w-[200px]">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </FormRow>

            <FormRow label="Description" error={errors.description?.message}>
              <textarea {...register("description")} className="textarea textarea-bordered width-full" rows={4} placeholder="Detailed product description..."></textarea>
            </FormRow>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <FormRow label="Version">
                <input {...register("version")} className="input input-bordered width-full" placeholder="e.g. 1.0.0, 2024.Q3" />
              </FormRow>
              <FormRow label="Release Channel">
                <div className="flex gap-[16px] padding-top-[8px]">
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="radio" {...register("releaseChannel")} value="Stable" className="radio radio-primary" />
                    <span className="text-[14px]">Stable</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="radio" {...register("releaseChannel")} value="Beta" className="radio radio-primary" />
                    <span className="text-[14px]">Beta</span>
                  </label>
                  <label className="flex items-center gap-[8px] cursor-pointer">
                    <input type="radio" {...register("releaseChannel")} value="Alpha" className="radio radio-primary" />
                    <span className="text-[14px]">Alpha</span>
                  </label>
                </div>
              </FormRow>
            </div>
          </FormSection>

          {/* 2. Licensing */}
          <FormSection title="2. Licensing">
            <FormRow label="License Type">
              <select {...register("licenseType")} className="select select-bordered width-full max-w-[200px]">
                <option value="One Time">One Time</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="Lifetime">Lifetime</option>
              </select>
            </FormRow>
            <FormRow label="Activation Type">
              <select {...register("activationType")} className="select select-bordered width-full max-w-[200px]">
                <option value="License Key">License Key</option>
                <option value="Email">Email</option>
                <option value="Domain">Domain</option>
                <option value="Device">Device</option>
                <option value="API Key">API Key</option>
              </select>
            </FormRow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <FormRow label="Validity (Days)">
                <input {...register("validityDays")} type="number" className="input input-bordered width-full" placeholder="e.g. 365" />
              </FormRow>
              <FormRow label="Maximum Users">
                <input {...register("maximumUsers")} type="number" className="input input-bordered width-full" placeholder="e.g. 50" />
              </FormRow>
              <FormRow label="Maximum Devices">
                <input {...register("maximumDevices")} type="number" className="input input-bordered width-full" placeholder="e.g. 3" />
              </FormRow>
            </div>
          </FormSection>

          {/* 3. Pricing Information */}
          <FormSection title="3. Pricing Information">
            <FormRow label="Cost Price" error={errors.costPrice?.message}>
              <div className="relative">
                <span className="absolute left-[12px] top-[10px] text-base-content/50">₹</span>
                <input {...register("costPrice")} type="number" step="0.01" className={`input input-bordered width-full padding-left-[32px] ${errors.costPrice ? "input-error" : ""}`} placeholder="0.00" />
              </div>
            </FormRow>

            <FormRow label="Selling Price" required error={errors.sellingPrice?.message}>
              <div className="relative">
                <span className="absolute left-[12px] top-[10px] text-base-content/50">₹</span>
                <input {...register("sellingPrice")} type="number" step="0.01" className={`input input-bordered width-full padding-left-[32px] ${errors.sellingPrice ? "input-error" : ""}`} placeholder="0.00" />
              </div>
            </FormRow>

            <FormRow label="Tax Percentage (%)" error={errors.tax?.message}>
              <input {...register("tax")} type="number" className="input input-bordered width-full max-w-[120px]" placeholder="18" />
            </FormRow>

            <FormRow label="Discount Percentage (%)" error={errors.discount?.message}>
              <input {...register("discount")} type="number" className="input input-bordered width-full max-w-[120px]" placeholder="0" />
            </FormRow>

            <FormRow label="Profit Margin">
              <div className="relative">
                <span className="absolute left-[12px] top-[10px] text-base-content/50">₹</span>
                <input type="number" readOnly value={profitMargin > 0 ? profitMargin : 0} className="input input-bordered width-full max-w-[160px] padding-left-[32px] bg-base-200 text-success font-[700]" />
              </div>
              <p className="text-[12px] text-base-content/50 margin-top-[4px]">Calculated automatically (Selling Price - Cost Price)</p>
            </FormRow>
          </FormSection>

          {/* 4. Platform Support */}
          <FormSection title="4. Platform Support">
            <FormRow label="Supported Platforms">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px]">
                {[
                  { id: "windows", label: "Windows", icon: <FaWindows size={20} /> },
                  { id: "macos", label: "macOS", icon: <FaApple size={20} /> },
                  { id: "linux", label: "Linux", icon: <FaLinux size={20} /> },
                  { id: "android", label: "Android", icon: <FaAndroid size={20} /> },
                  { id: "ios", label: "iOS", icon: <FaAppleWhole size={20} /> },
                  { id: "web", label: "Web", icon: <FaGlobe size={20} /> },
                ].map((platform) => (
                  <label key={platform.id} className="flex items-center gap-[8px] cursor-pointer bg-base-200/50 padding-[12px] rounded-[10px] border border-base-200 hover:border-primary transition-all duration-200">
                    <input
                      type="checkbox"
                      {...register("platformSupport")}
                      value={platform.id}
                      className="checkbox checkbox-primary"
                    />
                    {platform.icon}
                    <span className="text-[14px] font-[500]">{platform.label}</span>
                  </label>
                ))}
              </div>
            </FormRow>
          </FormSection>

          {/* 5. Downloads */}
          <FormSection title="5. Downloads">
            <FormRow label="Software Download URL">
              <input {...register("softwareDownloadUrl")} type="url" className={`input input-bordered width-full ${errors.softwareDownloadUrl ? "input-error" : ""}`} placeholder="https://yourproduct.com/download" />
              {errors.softwareDownloadUrl && <p className="text-error text-[12px] margin-top-[4px]">{errors.softwareDownloadUrl.message}</p>}
            </FormRow>
            <FormRow label="Documentation URL">
              <input {...register("documentationUrl")} type="url" className={`input input-bordered width-full ${errors.documentationUrl ? "input-error" : ""}`} placeholder="https://yourproduct.com/docs" />
              {errors.documentationUrl && <p className="text-error text-[12px] margin-top-[4px]">{errors.documentationUrl.message}</p>}
            </FormRow>
            <FormRow label="Demo URL">
              <input {...register("demoUrl")} type="url" className={`input input-bordered width-full ${errors.demoUrl ? "input-error" : ""}`} placeholder="https://yourproduct.com/demo" />
              {errors.demoUrl && <p className="text-error text-[12px] margin-top-[4px]">{errors.demoUrl.message}</p>}
            </FormRow>
            <FormRow label="Release Notes URL">
              <input {...register("releaseNotesUrl")} type="url" className={`input input-bordered width-full ${errors.releaseNotesUrl ? "input-error" : ""}`} placeholder="https://yourproduct.com/releases" />
              {errors.releaseNotesUrl && <p className="text-error text-[12px] margin-top-[4px]">{errors.releaseNotesUrl.message}</p>}
            </FormRow>
          </FormSection>

          {/* 6. Media */}
          <FormSection title="6. Media">
            <FormRow label="Logo Upload">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleImageDragOver}
                onDrop={handleImageDrop}
                className="border-[2px] border-dashed border-base-300 rounded-[12px] padding-[24px] text-center hover:bg-base-200/50 transition-all duration-200 cursor-pointer"
              >
                <MdAttachment className="mx-auto text-base-content/40 margin-bottom-[8px]" size={32} />
                <p className="text-[14px] font-[500] text-base-content/70">Drag & Drop Logo or click to upload</p>
                <p className="text-[12px] text-base-content/50 margin-top-[4px]">Allowed: JPG, PNG, WEBP. Max 1 image.</p>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-[16px] margin-top-[16px]">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="relative group w-[96px] h-[96px] rounded-[10px] overflow-hidden border border-base-300 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                      <img src={src} alt="Preview" className="w-full h-full object-cover block" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-[4px] right-[4px] bg-error text-white rounded-full padding-[4px] opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <MdDelete size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormRow>
            {/* Add similar FormRows for Banner, Screenshots, Video URL */}
          </FormSection>

          {/* 7. Features */}
          <FormSection title="7. Features">
            <DynamicListInput
              label="Product Features"
              name="features"
              control={control}
              register={register}
              errors={errors}
              placeholder="e.g. AI Reports, Inventory Management"
            />
          </FormSection>

          {/* 8. Plans */}
          <FormSection title="8. Plans">
            <PlanEditor control={control} register={register} watch={watch} errors={errors} />
          </FormSection>

          {/* 9. SEO Information */}
          <FormSection title="9. SEO Information">
            <FormRow label="Meta Title" error={errors.metaTitle?.message}>
              <input {...register("metaTitle")} className="input input-bordered width-full" placeholder="Enter SEO Title" />
            </FormRow>
            <FormRow label="Meta Description" error={errors.metaDescription?.message}>
              <textarea {...register("metaDescription")} className="textarea textarea-bordered width-full" rows={3} placeholder="SEO description..."></textarea>
            </FormRow>
            <FormRow label="Keywords" error={errors.keywords?.message}>
              <input {...register("keywords")} className="input input-bordered width-full" placeholder="Comma separated keywords" />
            </FormRow>
            <FormRow label="Tags">
              <select {...register("tags")} multiple className="select select-bordered width-full height-[96px]">
                <option value="SaaS">SaaS</option>
                <option value="CRM">CRM</option>
                <option value="ERP">ERP</option>
                <option value="Cloud">Cloud</option>
                <option value="Business">Business</option>
              </select>
              <p className="text-[12px] text-base-content/50 margin-top-[4px]">Hold Ctrl (or Cmd) to select multiple tags.</p>
            </FormRow>
          </FormSection>

          {/* 10. Publishing */}
          <FormSection title="10. Publishing">
            <FormRow label="Available For Sale">
              <input type="checkbox" {...register("availableForSale")} className="toggle toggle-success" />
            </FormRow>
            <FormRow label="Featured Product">
              <input type="checkbox" {...register("featured")} className="toggle toggle-primary" />
            </FormRow>
            <FormRow label="Show On Website">
              <input type="checkbox" {...register("showOnWebsite")} className="toggle toggle-primary" />
            </FormRow>
            <FormRow label="Allow Trial">
              <input type="checkbox" {...register("allowTrial")} className="toggle toggle-info" />
            </FormRow>
            <FormRow label="Allow Demo">
              <input type="checkbox" {...register("allowDemo")} className="toggle toggle-info" />
            </FormRow>
            <FormRow label="Publish Status">
              <select {...register("publishStatus")} className="select select-bordered width-full max-w-[160px]">
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </FormRow>
          </FormSection>

          {/* Audit Information (Read-only visible if Edit Mode theoretically) */}
          <div className="collapse bg-base-100 border border-base-300 rounded-[12px] opacity-60 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <input type="checkbox" />
            <div className="collapse-title text-[18px] font-[600] border-b border-base-200">
              Audit Information (Read-Only)
            </div>
            <div className="collapse-content padding-top-[20px]">
               <div className="grid grid-cols-2 gap-[16px] text-[14px]">
                  <div><span className="font-[500]">Created By:</span> Admin User</div>
                  <div><span className="font-[500]">Created On:</span> {new Date().toLocaleDateString()}</div>
                  <div><span className="font-[500]">Updated By:</span> -</div>
                  <div><span className="font-[500]">Updated On:</span> -</div>
               </div>
            </div>
          </div>


        </div>

       {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4 px-[16px] lg:px-0">
          <div className="bg-base-100 border border-base-300 rounded-[12px] p-[20px] sticky top-[96px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <h3 className="font-bold text-[18px] mb-[15px] pb-[8px] border-b border-base-200">Product Summary</h3>
            
            <div className="space-y-[16px] text-[14px]">
              <InfoCard title="Software Logo" value={
                imagePreviews.length > 0 ? (
                  <img src={imagePreviews[0]} alt="Logo" className="w-[48px] h-[48px] rounded-[8px] object-cover" />
                ) : (
                  <MdInfoOutline size={24} className="text-base-content/30" />
                )
              } />
              <InfoCard title="Product Name" value={watch("productName") || "N/A"} />
              <InfoCard title="Version" value={watch("version") || "N/A"} />
              <InfoCard title="Status" value={
                <div className={`badge ${watch("status") === 'Active' ? 'badge-success text-white' : watch("status") === 'Inactive' ? 'badge-warning' : 'badge-error text-white'} badge-lg font-[700]`}>
                  {watch("status") || "Active"}
                </div>
              } />
              <InfoCard title="License Type" value={watch("licenseType") || "N/A"} />
              <InfoCard title="Selling Price" value={`₹${watch("sellingPrice")?.toLocaleString() || '0.00'}`} />
              <InfoCard title="Supported Platforms" value={
                <div className="flex flex-wrap gap-[8px]">
                  {watch("platformSupport")?.map(p => (
                    <span key={p} className="badge badge-outline badge-primary text-[12px]">{p}</span>
                  ))}
                </div>
              } />
              <InfoCard title="Plan Count" value={watch("plans")?.length || 0} />
              <InfoCard title="Feature Count" value={watch("features")?.length || 0} />
              <InfoCard title="Publish Status" value={
                <div className={`badge ${watch("publishStatus") === 'Published' ? 'badge-primary' : watch("publishStatus") === 'Draft' ? 'badge-neutral' : 'badge-error'} badge-lg font-[700]`}>
                  {watch("publishStatus") || "Draft"}
                </div>
              } />
            </div>

            <div className="mt-[24px] pt-[16px] border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmittingLocal} className="btn btn-primary w-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : (isEditMode ? "Update Product" : "Save Product")}
              </button>
              <button type="button" onClick={() => reset()} className="btn btn-outline w-full shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                Reset
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Modals ── */}
      <dialog id="add_brand_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-[700] text-[18px]">Quick Add Brand</h3>
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
          <h3 className="font-[700] text-[18px]">Quick Add Category</h3>
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
          <MdCheckCircle className="text-success width-[64px] height-[64px] margin-bottom-[16px]" />
          <h3 className="font-[700] text-[20px] text-center margin-bottom-[8px]">Success!</h3>
          <p className="text-base-content/80 text-center">{successMessage}</p>
          <div className="modal-action margin-top-[24px] width-full justify-center">
            <button className="btn btn-primary padding-left-[32px] padding-right-[32px]" onClick={() => { setSuccessModalOpen(false); navigate("/sales/products"); }}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}

/* ── DynamicListInput Component (for Features) ── */
const DynamicListInput = ({ label, name, control, register, errors, placeholder }: any) => {
  const { fields, append, remove } = useFieldArray({
    control: control, // Explicitly pass control
    name: name,
  });

  return (
    <FormRow label={label} error={errors[name]?.message}>
      <div className="space-y-[8px]">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-[8px] items-center">
            <input
              {...register(`${name}.${index}.name` as const, { required: "Required" })}
              className={`input input-bordered width-full ${errors[name]?.[index]?.name ? "input-error" : ""}`}
              placeholder={placeholder}
            />
            <button type="button" onClick={() => remove(index)} className="btn btn-outline btn-square btn-error">
              <MdDelete size={18} />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: "" })} className="btn btn-outline btn-primary btn-sm gap-[8px]">
          <MdAdd size={18} /> Add Item
        </button>
      </div>
    </FormRow>
  );
};

/* ── PlanEditor Component ── */
const PlanEditor = ({ control, register, watch, errors }: any) => {
  const { fields, append, remove } = useFieldArray({
    control: control, // Explicitly pass control
    name: "plans",
  });

  const allFeatures = watch("features")?.map((f: any) => f.name) || [];

  return (
    <FormRow label="Pricing Plans" error={errors.plans?.message}>
      <div className="space-y-[16px]">
        {fields.map((plan, index) => (
          <div key={plan.id} className="bg-base-200/50 padding-[16px] rounded-[12px] border border-base-200 space-y-[12px]">
            <div className="flex justify-between items-center margin-bottom-[8px]">
              <h4 className="font-[600] text-[16px]">Plan #{index + 1}</h4>
              <button type="button" onClick={() => remove(index)} className="btn btn-ghost btn-square btn-sm text-error">
                <MdDelete size={18} />
              </button>
            </div>
            <FormRow label="Plan Name" required error={errors.plans?.[index]?.name?.message}>
              <input {...register(`plans.${index}.name` as const, { required: "Plan name is required" })} className={`input input-bordered width-full ${errors.plans?.[index]?.name ? "input-error" : ""}`} placeholder="e.g. Starter, Professional" />
            </FormRow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
              <FormRow label="Price" required error={errors.plans?.[index]?.price?.message}>
                <div className="relative">
                  <span className="absolute left-[12px] top-[10px] text-base-content/50">₹</span>
                  <input {...register(`plans.${index}.price` as const, { required: "Price is required" })} type="number" step="0.01" className={`input input-bordered width-full padding-left-[32px] ${errors.plans?.[index]?.price ? "input-error" : ""}`} placeholder="0.00" />
                </div>
              </FormRow>
              <FormRow label="Billing Cycle">
                <select {...register(`plans.${index}.billingCycle` as const)} className="select select-bordered width-full">
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="One Time">One Time</option>
                </select>
              </FormRow>
            </div>
            <FormRow label="Included Features">
              <select {...register(`plans.${index}.features` as const)} multiple className="select select-bordered width-full height-[120px]">
                {allFeatures.map((feature: string) => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
              <p className="text-[12px] text-base-content/50 margin-top-[4px]">Select features from the "Features" section above.</p>
            </FormRow>
          </div>
        ))}
        <button type="button" onClick={() => append({ name: "", price: 0, billingCycle: "Monthly", features: [] })} className="btn btn-outline btn-primary btn-sm gap-[8px]">
          <MdAdd size={18} /> Add Plan
        </button>
      </div>
    </FormRow>
  );
};
