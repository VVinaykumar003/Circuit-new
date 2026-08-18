import type { ColumnConfig } from "@/type/importExport.types";


export type ProductStatus = "Active" | "Inactive" | "Discontinued" | "undefined";

export interface Product {
  id: string;

  // 1. Software Information
  productName: string;
  productCode: string;
  sku?: string;
  productType: "ERP" | "CRM" | "SaaS" | "POS" | "HRMS" | "Other";
  productGroup?: string; // Added based on AllProducts.tsx
  softwareCategory?: string;
  category?: string; // Added based on AllProducts.tsx
  subCategory?: string;
  brand?: string; // Added based on AllProducts.tsx
  status?: "Active" | "Inactive" | "Discontinued"; // Made optional as it has a default in Zod
  description?: string;
  version?: string;
  releaseChannel?: "Stable" | "Beta" | "Alpha";
  barcode?: string;

  // Licensing
  licenseType?: "One Time" | "Monthly" | "Yearly" | "Lifetime"; // Updated to match backend and Zod

  // Pricing
  costPrice?: number;
  sellingPrice: number;
  unitPrice?: number; // Added based on AllProducts.tsx
  tax?: number;
  discount?: number;
  // Licensing Details
  activationType?: "License Key" | "Email" | "Domain" | "Device" | "API Key"; // Added "API Key"
  validityDays?: number;
  maxUsers?: number; // Consistent with backend
  maxDevices?: number; // Consistent with backend

  // Inventory
  stockQuantity?: number; // Added based on console info
  reorderLevel?: number; // Added based on backend model
  uom?: string; // Added based on backend model
  warehouse?: string; // Added based on backend model
  stockStatus?: string; // Added based on console info

  // Platform Support
  platformSupport?: ("windows" | "macos" | "linux" | "android" | "ios" | "web")[];

  // Download
  softwareDownloadUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
  releaseNotesUrl?: string; // Added based on backend model and Products.tsx

  // Media
  logoUrl?: string;
  bannerUrl?: string;
  screenshotUrls?: string[];
  videoUrl?: string;
  images?: string[]; // Changed to string[] to match backend and Zod
  imageUrl?: string; // Added for frontend display
  documents?: { name: string; url: string }[]; // Added based on backend model

  // Features
  features?: { name: string }[];

  // Plans
  plans?: { name: string; price: number; billingCycle: "Monthly" | "Yearly" | "One Time"; features: string[] }[];

  // SEO
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;

  // Publishing
  availableForSale?: boolean; // Made optional as it has a default in Zod
  featured?: boolean;
  showOnWebsite?: boolean;
  allowTrial?: boolean;
  allowDemo?: boolean;
  publishStatus?: "Published" | "Draft" | "Archived";
  // Audit
  createdAt?: string;
  updatedAt?: string;
}


 export const productColumns: ColumnConfig[] = [
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

/* ─────────────────────────── types ─────────────────────────── */


export interface AllProductsProps {
  products?: Product[];
  onAddProduct?: () => void;
  onRowClick?: (product: Product) => void;
}