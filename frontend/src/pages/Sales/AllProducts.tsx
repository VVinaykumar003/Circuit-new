import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
type  SortingState,
} from "@tanstack/react-table";
import {
  MdSearch,
  MdFilterList,
  MdAdd,
  MdMoreVert,
  MdDownload,
  MdUpload,
  MdRefresh,
  MdViewList,
  MdViewModule,
  MdClose,
  MdEdit,
  MdContentCopy,
  MdArchive,
  MdDelete,
  MdInventory,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import { getAllProducts, deleteProduct, updateProduct, createProduct } from "@/services/productServices";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import type { ColumnConfig } from "@/type/importExport.types";

const productColumns: ColumnConfig[] = [
  { key: "productName", label: "Product Name", required: true, type: "string" },
  { key: "productCode", label: "Product Code", required: true, type: "string" },
  { key: "sku", label: "SKU", type: "string" },
  { key: "barcode", label: "Barcode", type: "string" },
  { key: "productGroup", label: "Product Group", required: true, type: "string" },
  { key: "category", label: "Category", type: "string" },
  { key: "brand", label: "Brand", type: "string" },
  { key: "unitPrice", label: "Unit Price", type: "number" },
  { key: "costPrice", label: "Cost Price", type: "number" },
  { key: "stockQuantity", label: "Stock Quantity", type: "number" },
  { key: "reorderLevel", label: "Reorder Level", type: "number" },
  { key: "stockStatus", label: "Stock Status", type: "string" },
  { key: "status", label: "Status", type: "string" },
];

/* ─────────────────────────── types ─────────────────────────── */
export interface Product {
  id: string;
  productName: string;
  productCode: string;
  sku: string;
  barcode?: string;
  productGroup: string;
  category: string;
  brand: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  stockStatus: "In Stock" | "Low Stock" | "Out Of Stock";
  status: "Active" | "Inactive" | "Discontinued";
  lastUpdated: string;
  imageUrl?: string;
  description?: string;
  warehouse?: string;
  uom?: string;
  availableForSale?: boolean;
  sellingPrice?: number;
  updatedAt?: string;
  images?: (string | File)[];
}

interface AllProductsProps {
  products?: Product[];
  onAddProduct?: () => void;
  onRowClick?: (product: Product) => void;
}

/* ─────────────────────────── sample data ───────────────────── */
// const SAMPLE: Product[] = [
//   {
//     id: "PRD-1001",
//     productName: "Wireless Headphones Pro",
//     productCode: "WHP-2024-001",
//     sku: "WHP-BLK-01",
//     productGroup: "Electronics",
//     category: "Audio",
//     brand: "Sony",
//     unitPrice: 4999.99,
//     costPrice: 2500.00,
//     stockQuantity: 145,
//     reorderLevel: 50,
//     stockStatus: "In Stock",
//     status: "Active",
//     lastUpdated: "2026-05-28",
//     description: "Premium noise-cancelling wireless headphones.",
//     uom: "Piece",
//     warehouse: "Main Warehouse",
//     availableForSale: true,
//   },
//   {
//     id: "PRD-1002",
//     productName: "ERP Suite License",
//     productCode: "ERP-LIC-2024",
//     sku: "ERP-ENT-ANNUAL",
//     productGroup: "Software",
//     category: "Enterprise",
//     brand: "Circuit ERP",
//     unitPrice: 24999.0,
//     costPrice: 5000.00,
//     stockQuantity: 9999,
//     reorderLevel: 0,
//     stockStatus: "In Stock",
//     status: "Active",
//     lastUpdated: "2026-06-01",
//     description: "Annual enterprise software license.",
//     uom: "License",
//     warehouse: "Digital",
//     availableForSale: true,
//   },
//   {
//     id: "PRD-1003",
//     productName: "USB-C Hub 7-in-1",
//     productCode: "USB-HUB-001",
//     sku: "HUB-7IN1-SLV",
//     productGroup: "Accessories",
//     category: "Computer Peripherals",
//     brand: "Anker",
//     unitPrice: 1299.0,
//     costPrice: 600.00,
//     stockQuantity: 12,
//     reorderLevel: 20,
//     stockStatus: "Low Stock",
//     status: "Active",
//     lastUpdated: "2026-05-15",
//     description: "Multi-port USB-C hub with HDMI and SD card.",
//     uom: "Piece",
//     warehouse: "Main Warehouse",
//     availableForSale: true,
//   },
//   {
//     id: "PRD-1004",
//     productName: "Mechanical Keyboard",
//     productCode: "MK-87-RGB",
//     sku: "MK-87-RED",
//     productGroup: "Hardware",
//     category: "Input Devices",
//     brand: "Logitech",
//     unitPrice: 3499.0,
//     costPrice: 2000.00,
//     stockQuantity: 0,
//     reorderLevel: 15,
//     stockStatus: "Out Of Stock",
//     status: "Inactive",
//     lastUpdated: "2026-04-10",
//     description: "87-key mechanical keyboard with red switches.",
//     uom: "Piece",
//     warehouse: "Secondary Depot",
//     availableForSale: false,
//   },
// ];



/* ─────────────────────────── component ─────────────────────── */
export default function AllProducts({
  products: propProducts,
  onAddProduct,
}: AllProductsProps) {
  const navigate = useNavigate(); 

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [view, setView] = useState<"table" | "card">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Quick Stock Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(null);
  const [stockAdjustmentType, setStockAdjustmentType] = useState("Add Stock");
  const [stockAdjustmentQuantity, setStockAdjustmentQuantity] = useState<number | "">("");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Bulk Action Modal State
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkCategoryModalOpen, setBulkCategoryModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Active");
  const [newCategory, setNewCategory] = useState("");

  const { auth } = useAuth();
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts(auth.slug || "default-tenant");
        
        if (response?.success && response?.data) {
          const mappedProducts = response.data.map((p: Product & { _id?: string; openingStock?: number }) => ({
            ...p,
            id: p._id || p.id, // Map MongoDB _id to the frontend id
            unitPrice: p.sellingPrice || p.unitPrice || 0, // Map backend 'sellingPrice' to 'unitPrice'
            lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : p.lastUpdated, // Map 'updatedAt' to 'lastUpdated'
            stockQuantity: p.stockQuantity ?? p.openingStock ?? 0, // Ensure stock fallback
            imageUrl: p.images && p.images.length > 0 ? (typeof p.images[0] === 'string' ? p.images[0] : URL.createObjectURL(p.images[0] as Blob)) : p.imageUrl // Map the first image
          }));
          // console.log("Mapped Products:", mappedProducts);
          setProducts(mappedProducts);
        }
      } catch (error: unknown) {
        console.error("Error fetching products:", error);
      }
    };
    
    if (!propProducts) {
      fetchProducts();
    }
  }, [propProducts, stockModalOpen, auth.slug, refreshFlag]);

  const initiateDelete = useCallback((id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete, auth.slug || "default-tenant");
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
      setDeleteModalOpen(false);
      if (selectedProduct?.id === productToDelete) {
        setSelectedProduct(null);
      }
      setProductToDelete(null);
      setSuccessMessage("Product deleted successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete product.");
    }
  };

  const handleStockUpdate = async () => {
    if (!stockUpdateProduct) return;
    try {
      let newStock = stockUpdateProduct.stockQuantity;
      const qty = Number(stockAdjustmentQuantity);
      if (stockAdjustmentType === "Add Stock") newStock += qty;
      else if (stockAdjustmentType === "Remove Stock") newStock -= qty;
      else newStock = qty;

      const updatedProduct = { ...stockUpdateProduct, stockQuantity: newStock };
      await updateProduct(stockUpdateProduct.id, updatedProduct, auth.slug || "default-tenant");
      
      setProducts(prev => prev.map(p => p.id === stockUpdateProduct.id ? updatedProduct : p));
      setStockModalOpen(false);
      if (selectedProduct?.id === stockUpdateProduct.id) {
        setSelectedProduct(updatedProduct);
      }
      setStockAdjustmentQuantity("");
      setStockAdjustmentType("Add Stock");
      setSuccessMessage("Stock updated successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to update stock.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;
    try {
      await updateProduct(productToEdit.id, productToEdit, auth.slug || "default-tenant");
      setProducts(prev => prev.map(p => p.id === productToEdit.id ? productToEdit : p));
      setEditModalOpen(false);
      if (selectedProduct?.id === productToEdit.id) {
         setSelectedProduct(productToEdit);
      }
      setSuccessMessage("Product updated successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to update product.",error);
    }
  };

  const handleArchive = async (product: Product) => {
    try {
      const updatedProduct = { ...product, status: "Inactive" as const };
      await updateProduct(product.id, updatedProduct, auth.slug || "default-tenant");
      setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
      if (selectedProduct?.id === product.id) {
         setSelectedProduct(updatedProduct);
      }
      setSuccessMessage("Product archived successfully!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to archive product.");
    }
  };

  const handleImportSubmit = async (validRows: any[]) => {
    await Promise.all(validRows.map(row => {
      const formData = new FormData();
      Object.entries(row).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") formData.append(key, String(value));
      });
      return createProduct(formData as any, auth.slug || "default-tenant");
    }));
    setRefreshFlag(prev => prev + 1);
  };

  const getSelectedProducts = () => {
    const selectedIndices = Object.keys(rowSelection).map(Number);
    return selectedIndices.map(index => filteredProducts[index]);
  };

  const handleBulkStatusUpdate = async () => {
    const selected = getSelectedProducts();
    try {
      await Promise.all(selected.map(p => updateProduct(p.id, { ...p, status: newStatus as any }, auth.slug || "default-tenant")));
      setProducts(prev => prev.map(p => selected.find(sp => sp.id === p.id) ? { ...p, status: newStatus as any } : p));
      setBulkStatusModalOpen(false);
      setRowSelection({});
      setSuccessMessage("Status updated for selected products!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to update status for some products.",error);
    }
  };

  const handleBulkCategoryUpdate = async () => {
    const selected = getSelectedProducts();
    try {
      await Promise.all(selected.map(p => updateProduct(p.id, { ...p, category: newCategory }, auth.slug || "default-tenant")));
      setProducts(prev => prev.map(p => selected.find(sp => sp.id === p.id) ? { ...p, category: newCategory } : p));
      setBulkCategoryModalOpen(false);
      setRowSelection({});
      setSuccessMessage("Category updated for selected products!");
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to update category for some products.",error);
    }
  };

  const handleBulkDelete = async () => {
    const selected = getSelectedProducts();
    try {
      await Promise.all(selected.map(p => deleteProduct(p.id, auth.slug || "default-tenant")));
      setProducts(prev => prev.filter(p => !selected.find(sp => sp.id === p.id)));
      setBulkDeleteModalOpen(false);
      setRowSelection({});
      if (selectedProduct && selected.find(sp => sp.id === selectedProduct.id)) {
        setSelectedProduct(null);
      }
      setSuccessMessage(`${selected.length} products deleted successfully!`);
      setSuccessModalOpen(true);
    } catch (error: unknown) {
      toast.error("Failed to delete some products.",error);
    }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.status === "Active").length,
      inactive: products.filter(p => p.status !== "Active").length,
      lowStock: products.filter(p => p.stockStatus === "Low Stock").length,
      outOfStock: products.filter(p => p.stockStatus === "Out Of Stock").length,
      inventoryValue: products.reduce((sum, p) => sum + (p.costPrice * p.stockQuantity), 0),
      categories: new Set(products.map(p => p.category)).size,
      brands: new Set(products.map(p => p.brand)).size,
    };
  }, [products]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<Product>();
  const columns = useMemo(() => [
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    }),
    columnHelper.display({
      id: "image",
      header: "Image",
      cell: (info) => (
        <div className="w-10 h-10 rounded-md bg-base-200 border border-base-300 flex items-center justify-center overflow-hidden">
          {info.row.original.imageUrl ? (
            <img src={info.row.original.imageUrl} alt="Product" className="w-full h-full object-cover" />
          ) : (
            <MdInventory className="text-base-content/30" size={20} />
          )}
        </div>
      ),
    }),
    columnHelper.accessor("productName", {
      header: "Product Name",
      cell: (info) => (
        <span className="font-semibold text-primary hover:underline cursor-pointer">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("productCode", {
      header: "Code / SKU",
      cell: (info) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold text-base-content">{info.getValue()}</span>
          <span className="text-[10px] text-base-content/60 font-mono">{info.row.original.sku}</span>
        </div>
      ),
    }),
    columnHelper.accessor("productGroup", {
      header: "Group & Category",
      cell: (info) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="badge badge-sm badge-ghost font-medium">{info.getValue()}</span>
          <span className="text-xs text-base-content/70">{info.row.original.category}</span>
        </div>
      ),
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
    }),
    columnHelper.accessor("unitPrice", {
      header: "Unit Price",
      cell: (info) => (
        <span className="font-semibold text-success">
          ₹{info.getValue()?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      ),
    }),
    columnHelper.accessor("stockQuantity", {
      header: "Stock",
      cell: (info) => <span className="font-medium">{info.getValue()?.toLocaleString()}</span>,
    }),
    columnHelper.accessor("stockStatus", {
      header: "Stock Status",
      cell: (info) => {
        const val = info.getValue();
        const badgeClass =
          val === "In Stock" ? "badge-success text-white" : val === "Low Stock" ? "badge-warning" : "badge-error text-white";
        return <span className={`badge badge-sm font-semibold border-none ${badgeClass}`}>{val}</span>;
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const val = info.getValue();
        const badgeClass =
          val === "Active" ? "badge-primary" : val === "Inactive" ? "badge-ghost" : "badge-neutral";
        return <span className={`badge badge-sm badge-outline ${badgeClass}`}>{val}</span>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
          <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
            <MdMoreVert size={16} />
          </button>
          <ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow bg-base-100 rounded-box w-44 border border-base-200">
            <li><a onClick={() => setSelectedProduct(row.original)}><MdViewList /> View Details</a></li>
            <li><a onClick={() => { setProductToEdit(row.original); setEditModalOpen(true); }}><MdEdit /> Edit Product</a></li>
            <li>
              <a onClick={() => { setStockUpdateProduct(row.original); setStockModalOpen(true); }}>
                <MdInventory /> Quick Stock Update
              </a>
            </li>
            <li><a onClick={() => navigate("/sales/products/new", { state: { duplicateProduct: row.original } })}><MdContentCopy /> Duplicate</a></li>
            <li><a onClick={() => handleArchive(row.original)}><MdArchive /> Archive</a></li>
            <div className="divider my-1"></div>
            <li><a className="text-error" onClick={() => initiateDelete(row.original.id)}><MdDelete /> Delete</a></li>
          </ul>
        </div>
      ),
    }),
  ], [navigate, initiateDelete]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.productName.toLowerCase().includes(search.toLowerCase()) || 
      p.productCode.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Products</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li className="font-semibold text-primary">Products</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ImportExportActions
            moduleName="Products"
            columns={productColumns}
            data={filteredProducts}
            selectedData={getSelectedProducts()}
            onImportSubmit={handleImportSubmit}
          />
          <button onClick={() => setRefreshFlag(prev => prev + 1)} className="btn btn-outline btn-sm btn-square">
            <MdRefresh size={16} />
          </button>
          <button onClick={() => onAddProduct ? onAddProduct() : navigate("/sales/products/new")} className="btn btn-primary btn-sm gap-2 shadow-sm">
            <MdAdd size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          { label: "Total Products", value: stats.total, color: "text-base-content" },
          { label: "Active", value: stats.active, color: "text-primary" },
          { label: "Inactive", value: stats.inactive, color: "text-base-content/50" },
          { label: "Low Stock", value: stats.lowStock, color: "text-warning" },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-error" },
          { label: "Inventory Value", value: `₹${(stats.inventoryValue/1000).toFixed(1)}k`, color: "text-success" },
          { label: "Categories", value: stats.categories, color: "text-info" },
          { label: "Brands", value: stats.brands, color: "text-base-content" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow">
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-base-content/60 mt-1 text-center font-medium uppercase">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
            <input
              type="text"
              placeholder="Search by name, SKU, code, brand..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline"} gap-2`}>
            <MdFilterList size={16} /> Filters
          </button>
        </div>

        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button onClick={() => setView("table")} className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}>
            <MdViewList size={18} /> Table
          </button>
          <button onClick={() => setView("card")} className={`btn btn-sm btn-ghost px-3 ${view === "card" ? "bg-base-100 shadow-sm" : ""}`}>
            <MdViewModule size={18} /> Grid
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Product Group</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Electronics</option><option>Software</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Category</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Audio</option><option>Enterprise</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Brand</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Sony</option><option>Logitech</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Stock Status</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>In Stock</option><option>Low Stock</option><option>Out Of Stock</option></select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Warehouse</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>Main Warehouse</option></select>
          </div>
          <div className="col-span-1 md:col-span-4 lg:col-span-5 flex justify-end gap-2 mt-2">
            <button className="btn btn-sm btn-ghost">Reset Filters</button>
            <button className="btn btn-sm btn-primary">Apply Filters</button>
          </div>
        </div>
      )}

      {/* ── Bulk Actions ── */}
      {Object.keys(rowSelection).length > 0 && view === "table" && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4 flex items-center justify-between shadow-sm animate-fade-in-up">
          <span className="text-sm font-semibold text-primary">{Object.keys(rowSelection).length} products selected</span>
          <div className="flex gap-2">
            <button onClick={() => setBulkStatusModalOpen(true)} className="btn btn-xs btn-primary">Change Status</button>
            <button onClick={() => setBulkCategoryModalOpen(true)} className="btn btn-xs btn-outline bg-base-100">Assign Category</button>
            <button className="btn btn-xs btn-outline bg-base-100">Export Selected</button>
            <button onClick={() => setBulkDeleteModalOpen(true)} className="btn btn-xs btn-error btn-outline">Delete</button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 bg-base-100 border border-base-300 rounded-xl overflow-hidden shadow-sm flex flex-col relative">
        
        {/* View 1: Table */}
        {view === "table" && (
          <div className="flex-1 overflow-auto">
            <table className="table table-pin-rows table-pin-cols w-full text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-base-200/50 text-base-content/70">
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="font-semibold py-3 cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted() as string] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200"
                    onClick={() => setSelectedProduct(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-base-content/50">
                      No products found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View 2: Card/Grid */}
        {view === "card" && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/30">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedProduct(product)}
                  className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary cursor-pointer transition-colors"
                >
                  <figure className="h-40 bg-base-200 border-b border-base-200 relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="object-cover w-full h-full" />
                    ) : (
                      <MdInventory size={48} className="text-base-content/20" />
                    )}
                    {/* Badges on image */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.stockStatus === "Out Of Stock" && <span className="badge badge-error badge-sm text-white">Out of Stock</span>}
                      {product.stockStatus === "Low Stock" && <span className="badge badge-warning badge-sm">Low Stock</span>}
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h2 className="card-title text-sm leading-tight truncate">{product.productName}</h2>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-mono text-base-content/50">{product.productCode}</span>
                      <span className="text-xs text-base-content/70">{product.brand}</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-lg font-bold text-success">₹{product.unitPrice?.toLocaleString()}</span>
                      <span className="text-xs font-medium text-base-content/60">Stock: {product.stockQuantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Pagination Footer */}
        {view === "table" && (
          <div className="border-t border-base-300 p-3 bg-base-100 flex items-center justify-between text-sm">
            <span className="text-base-content/60">
              Showing {table.getRowModel().rows.length} of {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-2">
              <select 
                className="select select-sm select-bordered"
                value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map(pageSize => (
                  <option key={pageSize} value={pageSize}>Show {pageSize}</option>
                ))}
              </select>
              <div className="join">
                <button className="join-item btn btn-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>«</button>
                <button className="join-item btn btn-sm">Page {table.getState().pagination.pageIndex + 1}</button>
                <button className="join-item btn btn-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>»</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Details Drawer ── */}
      <div className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedProduct ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className={`absolute right-0 top-0 h-full w-full md:w-[600px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedProduct ? "translate-x-0" : "translate-x-full"} flex flex-col`}>
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-base-300 flex justify-between items-center bg-base-200/50">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs font-bold text-base-content/50">{selectedProduct?.productCode}</span>
                <span className={`badge badge-sm ${selectedProduct?.status === 'Active' ? 'badge-primary' : 'badge-ghost'}`}>
                  {selectedProduct?.status}
                </span>
                <span className={`badge badge-sm border-none ${selectedProduct?.stockStatus === 'In Stock' ? 'badge-success text-white' : selectedProduct?.stockStatus === 'Low Stock' ? 'badge-warning' : 'badge-error text-white'}`}>
                  {selectedProduct?.stockStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-base-content leading-tight">{selectedProduct?.productName}</h2>
            </div>
            <button onClick={() => setSelectedProduct(null)} className="btn btn-ghost btn-circle btn-sm">
              <MdClose size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-100">
            
            {/* Quick Actions */}
            <div className="flex gap-2 pb-6 border-b border-base-200">
              <button onClick={() => { setProductToEdit(selectedProduct); setEditModalOpen(true); }} className="btn btn-sm btn-primary flex-1 gap-2"><MdEdit /> Edit</button>
              <button onClick={() => { setStockUpdateProduct(selectedProduct); setStockModalOpen(true); }} className="btn btn-sm btn-outline bg-base-100 flex-1 gap-2"><MdInventory /> Adjust Stock</button>
              <button onClick={() => { if(selectedProduct) { initiateDelete(selectedProduct.id); } }} className="btn btn-sm btn-outline btn-error flex-none px-3"><MdDelete /></button>
            </div>

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">SKU</p><p className="font-mono font-semibold">{selectedProduct?.sku}</p></div>
                <div><p className="text-base-content/50 mb-1">Barcode</p><p className="font-mono">{selectedProduct?.barcode || "—"}</p></div>
                <div className="col-span-2"><p className="text-base-content/50 mb-1">Description</p><p className="text-base-content leading-relaxed">{selectedProduct?.description || "No description provided."}</p></div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Pricing</h3>
              <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-base-content/50 mb-1">Selling Price</p><p className="font-bold text-success text-lg">₹{selectedProduct?.
sellingPrice?.toLocaleString()}</p></div>
                <div><p className="text-base-content/50 mb-1">Cost Price</p><p className="font-medium text-base-content/70">₹{selectedProduct?.costPrice?.toLocaleString()}</p></div>
                <div className="col-span-2 divider my-0"></div>
                <div>
                  <p className="text-base-content/50 mb-1">Est. Profit Margin</p>
                  <p className="font-bold text-primary">₹{((selectedProduct?.sellingPrice || 0) - (selectedProduct?.costPrice || 0))?.toLocaleString()}</p>
                </div>
                <div><p className="text-base-content/50 mb-1">Tax</p><p className="font-medium">{selectedProduct?.tax || 18}%</p></div>
              </div>
            </section>

            {/* Inventory */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Inventory</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">Current Stock</p><p className="font-bold text-lg">{selectedProduct?.stockQuantity}</p></div>
                <div><p className="text-base-content/50 mb-1">Reorder Level</p><p className="font-medium">{selectedProduct?.reorderLevel}</p></div>
                <div><p className="text-base-content/50 mb-1">Warehouse</p><p className="font-medium">{selectedProduct?.warehouse || "—"}</p></div>
                <div><p className="text-base-content/50 mb-1">Unit of Measure</p><p className="font-medium">{selectedProduct?.uom || "—"}</p></div>
              </div>
            </section>

            {/* Categorization */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Categorization</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">Product Group</p><p className="font-medium">{selectedProduct?.productGroup}</p></div>
                <div><p className="text-base-content/50 mb-1">Category</p><p className="font-medium">{selectedProduct?.category}</p></div>
                <div><p className="text-base-content/50 mb-1">Brand</p><p className="font-medium">{selectedProduct?.brand}</p></div>
                <div>
                  <p className="text-base-content/50 mb-1">Tags</p>
                  <div className="flex gap-1 mt-1">
                    <span className="badge badge-sm badge-ghost">Featured</span>
                    <span className="badge badge-sm badge-ghost">New</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Audit Info */}
            <section className="bg-base-200/30 p-4 rounded-xl border border-base-200 text-xs">
              <div className="grid grid-cols-2 gap-2 text-base-content/60">
                <p>Created By: Admin</p>
                <p>Created On: 2026-01-10</p>
                <p>Updated By: V VINAY Kumar</p>
                <p>Last Updated: {selectedProduct?.lastUpdated}</p>
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* ── Quick Stock Modal ── */}
      <dialog id="stock_update_modal" className={`modal ${stockModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box ">
          <h3 className="font-bold text-lg">Quick Stock Update</h3>
          <p className="py-2 text-sm text-base-content/70 ">Adjust inventory for <span className="font-bold">{stockUpdateProduct?.productName}</span>.</p>
          
          <div className="form-control w-full mt-4">
            <label className="label "><span className="label-text font-semibold">Adjustment Type</span></label>
            <select className="select select-bordered ml-2" value={stockAdjustmentType} onChange={(e) => setStockAdjustmentType(e.target.value)}>
              <option value="Add Stock">Add Stock</option>
              <option value="Remove Stock">Remove Stock</option>
              <option value="Set Absolute Quantity">Set Absolute Quantity</option>
            </select>
          </div>

          <div className="form-control w-full mt-4">
            <label className="label"><span className="label-text font-semibold">Quantity</span></label>
            <input type="number" className="input input-bordered ml-17" placeholder="Enter quantity" value={stockAdjustmentQuantity} onChange={(e) => setStockAdjustmentQuantity(e.target.value ? Number(e.target.value) : "")} />
          </div>
          
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setStockModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleStockUpdate}>Update Stock</button>
          </div>
        </div>
      </dialog>

      {/* Delete Confirmation Modal */}
      <dialog className={`modal ${deleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Delete</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to delete this product? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={confirmDelete}>Yes, Delete</button>
          </div>
        </div>
      </dialog>

      {/* Success Modal */}
      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">{successMessage}</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => setSuccessModalOpen(false)}>Close</button>
          </div>
        </div>
      </dialog>

      {/* Edit Modal */}
      <dialog className={`modal ${editModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Edit Product</h3>
          {productToEdit && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text">Product Name</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.productName} onChange={(e) => setProductToEdit({...productToEdit, productName: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Product Code</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.productCode} onChange={(e) => setProductToEdit({...productToEdit, productCode: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">SKU</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.sku || ""} onChange={(e) => setProductToEdit({...productToEdit, sku: e.target.value})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Barcode</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.barcode || ""} onChange={(e) => setProductToEdit({...productToEdit, barcode: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Product Group</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.productGroup || ""} onChange={(e) => setProductToEdit({...productToEdit, productGroup: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Category</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.category || ""} onChange={(e) => setProductToEdit({...productToEdit, category: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Brand</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.brand || ""} onChange={(e) => setProductToEdit({...productToEdit, brand: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Unit Price (₹)</span></label>
                  <input type="number" className="input input-bordered w-full" value={productToEdit.unitPrice || productToEdit.sellingPrice || 0} onChange={(e) => setProductToEdit({...productToEdit, unitPrice: Number(e.target.value), sellingPrice: Number(e.target.value)})} required />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Cost Price (₹)</span></label>
                  <input type="number" className="input input-bordered w-full" value={productToEdit.costPrice || 0} onChange={(e) => setProductToEdit({...productToEdit, costPrice: Number(e.target.value)})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Stock Quantity</span></label>
                  <input type="number" className="input input-bordered w-full" value={productToEdit.stockQuantity || 0} onChange={(e) => setProductToEdit({...productToEdit, stockQuantity: Number(e.target.value)})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Reorder Level</span></label>
                  <input type="number" className="input input-bordered w-full" value={productToEdit.reorderLevel || 0} onChange={(e) => setProductToEdit({...productToEdit, reorderLevel: Number(e.target.value)})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Stock Status</span></label>
                  <select className="select select-bordered w-full" value={productToEdit.stockStatus} onChange={(e) => setProductToEdit({...productToEdit, stockStatus: e.target.value as any})}>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out Of Stock">Out Of Stock</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Status</span></label>
                  <select className="select select-bordered w-full" value={productToEdit.status} onChange={(e) => setProductToEdit({...productToEdit, status: e.target.value as any})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Warehouse</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.warehouse || ""} onChange={(e) => setProductToEdit({...productToEdit, warehouse: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text">Unit of Measure (UoM)</span></label>
                  <input type="text" className="input input-bordered w-full" value={productToEdit.uom || ""} onChange={(e) => setProductToEdit({...productToEdit, uom: e.target.value})} />
                </div>
                <div className="form-control flex flex-row items-center gap-4 mt-8">
                  <label className="label cursor-pointer gap-2 p-0">
                    <input type="checkbox" className="checkbox checkbox-primary" checked={productToEdit.availableForSale ?? true} onChange={(e) => setProductToEdit({...productToEdit, availableForSale: e.target.checked})} />
                    <span className="label-text font-medium">Available for Sale</span>
                  </label>
                </div>
                <div className="form-control col-span-1 md:col-span-2">
                  <label className="label"><span className="label-text">Description</span></label>
                  <textarea className="textarea textarea-bordered w-full" value={productToEdit.description || ""} onChange={(e) => setProductToEdit({...productToEdit, description: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          )}
        </div>
      </dialog>

      {/* Bulk Status Modal */}
      <dialog className={`modal ${bulkStatusModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Update Status for Selected Products</h3>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-semibold">New Status</span></label>
            <select className="select select-bordered ml-3" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkStatusModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkStatusUpdate}>Update Status</button>
          </div>
        </div>
      </dialog>

      {/* Bulk Category Modal */}
      <dialog className={`modal ${bulkCategoryModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Assign Category to Selected Products</h3>
          <div className="form-control w-full">
            <label className="label"><span className="label-text font-semibold">New Category</span></label>
            <input type="text" className="input input-bordered w-full" placeholder="Enter category name" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
          </div>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkCategoryModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleBulkCategoryUpdate}>Update Category</button>
          </div>
        </div>
      </dialog>

      {/* Bulk Delete Confirmation Modal */}
      <dialog className={`modal ${bulkDeleteModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex items-center gap-2"><MdWarning /> Confirm Bulk Delete</h3>
          <p className="py-4 text-base-content/80">Are you sure you want to delete {Object.keys(rowSelection).length} selected products? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={handleBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>
    </div>
   
  );
}

/* ─────────────────────────── usage example ─────────────────────

import AllProducts from "./AllProducts";
import { useNavigate } from "react-router-dom";

export default function AllProductsPage() {
  const navigate = useNavigate();
  const { data: products } = useProducts(); // your hook/query

  return (
    <AllProducts
      products={products ?? []}
      onAddProduct={() => navigate("/sales/products/new")}
      onRowClick={(p) => navigate(`/sales/products/${p.id}`)}
    />
  );
}

──────────────────────────────────────────────────────────────── */