import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  MdSearch,
  MdFilterList,
  MdAdd,
  MdMoreVert,
  MdRefresh,
  MdViewList,
  MdViewModule,
  MdClose,
  MdEdit,
  MdContentCopy,
  MdArchive,
  MdDelete,
  MdInventory,
} from "react-icons/md";
import { createProduct } from "@/services/productServices";
import { useAuth } from "@/auth/useAuth";
import ImportExportActions from "@/components/import-export/ImportExportActions";
import { EditProductModal } from "@/components/sales/Product/EditProductModal";
import { ProductModals } from "@/components/sales/Product/ProductModals";
import  { type Product , productColumns } from "@/type/salesProduct";
import { useProducts } from "@/hooks/product/newGetProducts";
import Loader from "@/components/ui/Loader";
import { useProductDelete } from "@/hooks/product/useProductDelete";
import { useProductBulkActions } from "@/hooks/product/useProductBulkActions";
import { useProductEdit } from "@/hooks/product/useProductEdit";
import { importProductSubmit } from "@/hooks/product/useProductImport";
import { useStockUpdateProduct } from "@/hooks/product/stockUpadteProduct";
import { useProductActions } from "@/hooks/product/newArchiveProduct";




/* ─────────────────────────── types ─────────────────────────── */

interface AllProductsProps {
  products?: Product[];
  onAddProduct?: () => void;
}

/* ─────────────────────────── component ─────────────────────── */
export default function AllProducts({ onAddProduct }: AllProductsProps) {
  const navigate = useNavigate();

  // State

  const [view, setView] = useState<"table" | "card">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Quick Stock Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockUpdateProduct, setStockUpdateProduct] = useState<Product | null>(
    null,
  );
  const [stockAdjustmentType, setStockAdjustmentType] = useState("Add Stock");
  const [stockAdjustmentQuantity, setStockAdjustmentQuantity] = useState<
    number | ""
  >("");

  const [productToEdit, setProductToEdit] = useState<Product | null>(null); // For Edit Modal

  // const [refreshFlag ,setRefreshFlag] = useState(0);
  const [softwareCategory, setSoftwareCategory] = useState("");

  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Bulk Action Modal State
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [bulkCategoryModalOpen, setBulkCategoryModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // Re-added edit modal state
  const [newStatus, setNewStatus] =
  useState<Product["status"]>("Active");

  const { auth } = useAuth();
  const slug = auth.slug || "default-tenant";

  const { products, fetchProducts, loading, error, setProducts } =
    useProducts();
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        (p.productName?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.productCode?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.sku?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.brand?.toLowerCase() || "").includes(search.toLowerCase()),
    );
  }, [products, search]);
  const {
    deleteModalOpen,
    setDeleteModalOpen,
    initiateDelete,
    confirmDelete,
    productToDelete,
  } = useProductDelete({ slug: slug, setProducts });

  const {
    getSelectedProducts,
    handleBulkDelete,
    handleBulkStatusUpdate,
    handleBulkCategoryUpdate,
  } = useProductBulkActions({
    slug: slug,
    filteredProducts,
    rowSelection,
    setProducts,
    setRowSelection,
    newStatus 
  });

  const { handleEditSubmit } = useProductEdit({
    slug: slug,
    setEditModalOpen,
    setProducts,
    setSelectedProduct,
    setSuccessModalOpen,
    setSuccessMessage,
    selectedProduct,
  });

  const { handleImportSubmit } = importProductSubmit({
    slug: auth.slug,
    createProduct,
  });

  const { handleStockUpdate } = useStockUpdateProduct({
    slug: slug,

    setProducts,

    setStockModalOpen,

    setSuccessModalOpen,

    setSuccessMessage,

    selectedProduct,

    setSelectedProduct,

    stockUpdateProduct,

    stockAdjustmentQuantity,

    stockAdjustmentType,

    setStockAdjustmentQuantity,

    setStockAdjustmentType,
  });

  const { handleArchive } = useProductActions({
    slug: slug,

    setProducts,

    selectedProduct,

    setSelectedProduct,

    setSuccessMessage,

    setSuccessModalOpen,
  });

  // Stats Calculation
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.status === "Active").length,
      inactive: products.filter((p) => p.status !== "Active").length,
      lowStock: products.filter((p) => p.stockStatus === "Low Stock").length,
      outOfStock: products.filter((p) => p.stockStatus === "Out Of Stock")
        .length,
      inventoryValue: products.reduce(
        (sum, p) => sum + p.costPrice * p.stockQuantity,
        0,
      ),
      categories: new Set(products.map((p) => p.softwareCategory)).size,
      brands: new Set(products.map((p) => p.brand)).size,
    };
  }, [products]);

  // TanStack Table Setup
  const columnHelper = createColumnHelper<Product>();
  const columns = useMemo(
    () => [
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
              <img
                src={info.row.original.imageUrl}
                alt="Product"
                className="w-full h-full object-cover"
              />
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
            <span className="text-xs font-mono font-bold text-base-content">
              {info.getValue()}
            </span>
            <span className="text-[10px] text-base-content/60 font-mono">
              {info.row.original.sku}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor("productType", {
        // Changed from productGroup
        header: "Type & Category", // Changed from Group & Category
        cell: (info) => (
          <div className="flex flex-col gap-1 items-start">
            <span className="badge badge-sm badge-ghost font-medium">
              {info.getValue()}
            </span>
            <span className="text-xs text-base-content/70">
              {info.row.original.softwareCategory}
            </span>{" "}
            {/* Changed from category */}
          </div>
        ),
      }),
      // columnHelper.accessor("brand", {
      //   header: "Brand",
      // }),
      // columnHelper.accessor("unitPrice", {
      //   header: "Unit Price",
      //   cell: (info) => (
      //     <span className="font-semibold text-success">
      //       ₹{info.getValue()?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      //     </span>
      //   ),
      // }),
      // columnHelper.accessor("stockQuantity", {
      //   header: "Stock",
      //   cell: (info) => <span className="font-medium">{info.getValue()?.toLocaleString()}</span>,
      // }),
      // columnHelper.accessor("stockStatus", {
      //   header: "Stock Status",
      //   cell: (info) => {
      //     const val = info.getValue();
      //     const badgeClass =
      //       val === "In Stock" ? "badge-success text-white" : val === "Low Stock" ? "badge-warning" : "badge-error text-white";
      //     return <span className={`badge badge-sm font-semibold border-none ${badgeClass}`}>{val}</span>;
      //   },
      // }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const val = info.getValue();
          const badgeClass =
            val === "Active"
              ? "badge-primary"
              : val === "Inactive"
                ? "badge-ghost"
                : "badge-neutral";
          return (
            <span className={`badge badge-sm badge-outline ${badgeClass}`}>
              {val}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div
            className="dropdown dropdown-end"
            onClick={(e) => e.stopPropagation()}
          >
            <button tabIndex={0} className="btn btn-ghost btn-xs btn-square">
              <MdMoreVert size={16} />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-2 shadow bg-base-100 rounded-box w-44 border border-base-200"
            >
              <li>
                <a onClick={() => setSelectedProduct(row.original)}>
                  <MdViewList /> View Details
                </a>
              </li>{" "}
              {/* Keep view details */}
              <li>
                <a
                  onClick={() => {
                    setProductToEdit(row.original);
                    setEditModalOpen(true);
                  }}
                >
                  <MdEdit /> Edit Product
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    setStockUpdateProduct(row.original);
                    setStockModalOpen(true);
                  }}
                >
                  <MdInventory /> Quick Stock Update
                </a>
              </li>
              <li>
                <a
                  onClick={() =>
                    navigate("/sales/products/new", {
                      state: { duplicateProduct: row.original },
                    })
                  }
                >
                  <MdContentCopy /> Duplicate
                </a>
              </li>
              <li>
                <a onClick={() => handleArchive(row.original)}>
                  <MdArchive /> Archive
                </a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a
                  className="text-error"
                  onClick={() => initiateDelete(row.original.id)}
                >
                  <MdDelete /> Delete
                </a>
              </li>
            </ul>
          </div>
        ),
      }),
    ],
    [navigate, initiateDelete],
  );

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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 font-sans flex flex-col h-full overflow-hidden relative">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Products
          </h1>
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
          <button
            onClick={fetchProducts}
            className="btn btn-outline btn-sm btn-square"
          >
            <MdRefresh size={16} />
          </button>
          <button
            onClick={() =>
              onAddProduct ? onAddProduct() : navigate("/sales/products/new")
            }
            className="btn btn-primary btn-sm gap-2 shadow-sm"
          >
            <MdAdd size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {[
          {
            label: "Total Products",
            value: stats.total,
            color: "text-base-content",
          },
          { label: "Active", value: stats.active, color: "text-primary" },
          {
            label: "Inactive",
            value: stats.inactive,
            color: "text-base-content/50",
          },
          { label: "Low Stock", value: stats.lowStock, color: "text-warning" },
          {
            label: "Out of Stock",
            value: stats.outOfStock,
            color: "text-error",
          },
          {
            label: "Inventory Value",
            value: `₹${(stats.inventoryValue / 1000).toFixed(1)}k`,
            color: "text-success",
          },
          { label: "Categories", value: stats.categories, color: "text-info" },
          { label: "Brands", value: stats.brands, color: "text-base-content" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-base-100 border border-base-300 rounded-xl p-4 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
          >
            <span className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-xs text-base-content/60 mt-1 text-center font-medium uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-base-100 p-3 rounded-xl border border-base-300 shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, SKU, code, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 focus:outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm ${showFilters ? "btn-primary" : "btn-outline"} gap-2`}
          >
            <MdFilterList size={16} /> Filters
          </button>
        </div>

        <div className="flex bg-base-200 p-1 rounded-lg border border-base-300">
          <button
            onClick={() => setView("table")}
            className={`btn btn-sm btn-ghost px-3 ${view === "table" ? "bg-base-100 shadow-sm" : ""}`}
          >
            <MdViewList size={18} /> Table
          </button>
          <button
            onClick={() => setView("card")}
            className={`btn btn-sm btn-ghost px-3 ${view === "card" ? "bg-base-100 shadow-sm" : ""}`}
          >
            <MdViewModule size={18} /> Grid
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-base-100 border border-base-300 rounded-xl p-5 mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 shadow-sm animate-fade-in-down">
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Product Group
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Electronics</option>
              <option>Software</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Category
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Audio</option>
              <option>Enterprise</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Brand
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Sony</option>
              <option>Logitech</option>
            </select>
          </div>
          {/* <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">Stock Status</label>
            <select className="select select-sm select-bordered w-full"><option>All</option><option>In Stock</option><option>Low Stock</option><option>Out Of Stock</option></select>
          </div> */}
          <div>
            <label className="text-xs font-semibold text-base-content/70 mb-1 block">
              Warehouse
            </label>
            <select className="select select-sm select-bordered w-full">
              <option>All</option>
              <option>Main Warehouse</option>
            </select>
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
          <span className="text-sm font-semibold text-primary">
            {Object.keys(rowSelection).length} products selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setBulkStatusModalOpen(true)}
              className="btn btn-xs btn-primary"
            >
              Change Status
            </button>
            <button
              onClick={() => setBulkCategoryModalOpen(true)}
              className="btn btn-xs btn-outline bg-base-100"
            >
              Assign Category
            </button>
            <button className="btn btn-xs btn-outline bg-base-100">
              Export Selected
            </button>
            <button
              onClick={() => setBulkDeleteModalOpen(true)}
              className="btn btn-xs btn-error btn-outline"
            >
              Delete
            </button>
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-base-200/50 text-base-content/70"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="font-semibold py-3 cursor-pointer select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{ asc: " 🔼", desc: " 🔽" }[
                          header.column.getIsSorted() as string
                        ] ?? null}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-base-200/50 transition-colors cursor-pointer border-b border-base-200"
                    onClick={() => setSelectedProduct(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-12 text-base-content/50"
                    >
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
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="card bg-base-100 shadow-sm border border-base-300 hover:border-primary cursor-pointer transition-colors"
                >
                  <figure className="h-40 bg-base-200 border-b border-base-200 relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.productName}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <MdInventory size={48} className="text-base-content/20" />
                    )}
                    {/* Badges on image */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.stockStatus === "Out Of Stock" && (
                        <span className="badge badge-error badge-sm text-white">
                          Out of Stock
                        </span>
                      )}
                      {product.stockStatus === "Low Stock" && (
                        <span className="badge badge-warning badge-sm">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </figure>
                  <div className="card-body p-4">
                    <h2 className="card-title text-sm leading-tight truncate">
                      {product.productName}
                    </h2>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-mono text-base-content/50">
                        {product.productCode}
                      </span>
                      <span className="text-xs text-base-content/70">
                        {product.brand}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <span className="text-lg font-bold text-success">
                        ₹{product.unitPrice?.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-base-content/60">
                        Stock: {product.stockQuantity}
                      </span>
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
              Showing {table.getRowModel().rows.length} of{" "}
              {filteredProducts.length} products
            </span>
            <div className="flex items-center gap-2">
              <select
                className="select select-sm select-bordered"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
              >
                {[10, 25, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  «
                </button>
                <button className="join-item btn btn-sm">
                  Page {table.getState().pagination.pageIndex + 1}
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Product Details Drawer ── */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity ${selectedProduct ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-full md:w-[600px] bg-base-100 shadow-2xl transition-transform duration-300 transform ${selectedProduct ? "translate-x-0" : "translate-x-full"} flex flex-col`}
        >
          {/* Drawer Header */}
          <div className="p-5 border-b border-base-300 flex justify-between items-center bg-base-200/50">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-mono text-xs font-bold text-base-content/50">
                  {selectedProduct?.productCode}
                </span>
                <span
                  className={`badge badge-sm ${selectedProduct?.status === "Active" ? "badge-primary" : "badge-ghost"}`}
                >
                  {selectedProduct?.status}
                </span>
                {/* <span className={`badge badge-sm border-none ${selectedProduct?.stockStatus === 'In Stock' ? 'badge-success text-white' : selectedProduct?.stockStatus === 'Low Stock' ? 'badge-warning' : 'badge-error text-white'}`}>
                  {selectedProduct?.stockStatus}
                </span> */}
              </div>
              <h2 className="text-xl font-bold text-base-content leading-tight">
                {selectedProduct?.productName}
              </h2>
            </div>
            <button
              onClick={() => setSelectedProduct(null)}
              className="btn btn-ghost btn-circle btn-sm"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-base-100">
            {/* Quick Actions */}
            <div className="flex gap-2 pb-6 border-b border-base-200">
              <button
                onClick={() => {
                  setProductToEdit(selectedProduct);
                  setEditModalOpen(true);
                }}
                className="btn btn-sm btn-primary flex-1 gap-2"
              >
                <MdEdit /> Edit
              </button>
              <button
                onClick={() => {
                  setStockUpdateProduct(selectedProduct);
                  setStockModalOpen(true);
                }}
                className="btn btn-sm btn-outline bg-base-100 flex-1 gap-2"
              >
                <MdInventory /> Adjust Stock
              </button>
              <button
                onClick={() => {
                  if (selectedProduct) {
                    initiateDelete(selectedProduct.id);
                  }
                }}
                className="btn btn-sm btn-outline btn-error flex-none px-3"
              >
                <MdDelete />
              </button>
            </div>

            {/* Basic Info */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-base-content/50 mb-1">SKU</p>
                  <p className="font-mono font-semibold">
                    {selectedProduct?.sku}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Barcode</p>
                  <p className="font-mono">{selectedProduct?.barcode || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-base-content/50 mb-1">Description</p>
                  <p className="text-base-content leading-relaxed">
                    {selectedProduct?.description || "No description provided."}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">License Type</p>
                  <p className="font-medium">
                    {selectedProduct?.licenseType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Activation Type</p>
                  <p className="font-medium">
                    {selectedProduct?.activationType || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Validity Days</p>
                  <p className="font-medium">
                    {selectedProduct?.validityDays || 0}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Max Users</p>
                  <p className="font-medium">
                    {selectedProduct?.maxUsers || 0}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Max Devices</p>
                  <p className="font-medium">
                    {selectedProduct?.maxDevices || 0}
                  </p>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
                Pricing
              </h3>
              <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-base-content/50 mb-1">Selling Price</p>
                  <p className="font-bold text-success text-lg">
                    ₹{selectedProduct?.sellingPrice?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Cost Price</p>
                  <p className="font-medium text-base-content/70">
                    ₹{selectedProduct?.costPrice?.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2 divider my-0"></div>
                <div>
                  <p className="text-base-content/50 mb-1">
                    Est. Profit Margin
                  </p>
                  <p className="font-bold text-primary">
                    ₹
                    {(
                      (selectedProduct?.sellingPrice || 0) -
                      (selectedProduct?.costPrice || 0)
                    )?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Tax</p>
                  <p className="font-medium">{selectedProduct?.tax || 18}%</p>
                </div>
              </div>
            </section>

            {/* Inventory */}
            {/* <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Inventory</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div><p className="text-base-content/50 mb-1">Current Stock</p><p className="font-bold text-lg">{selectedProduct?.stockQuantity || 0}</p></div>
                <div><p className="text-base-content/50 mb-1">Reorder Level</p><p className="font-medium">{selectedProduct?.reorderLevel || 0}</p></div>
                <div><p className="text-base-content/50 mb-1">Warehouse</p><p className="font-medium">{selectedProduct?.warehouse || "—"}</p></div>
                <div><p className="text-base-content/50 mb-1">Unit of Measure</p><p className="font-medium">{selectedProduct?.uom || "—"}</p></div>
              </div>
            </section> */}

            {/* Categorization */}
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">
                Categorization
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-base-content/50 mb-1">Product Type</p>
                  <p className="font-medium">{selectedProduct?.productType}</p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Software Category</p>
                  <p className="font-medium">
                    {selectedProduct?.softwareCategory}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/50 mb-1">Brand</p>
                  <p className="font-medium">{selectedProduct?.brand}</p>
                </div>
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
                <p>Last Updated: {selectedProduct?.updatedAt || "—"}</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Product Modals Component */}
      <ProductModals
        stockModalOpen={stockModalOpen}
        setStockModalOpen={setStockModalOpen}
        stockUpdateProduct={stockUpdateProduct}
        stockAdjustmentType={stockAdjustmentType}
        setStockAdjustmentType={setStockAdjustmentType}
        stockAdjustmentQuantity={stockAdjustmentQuantity}
        setStockAdjustmentQuantity={setStockAdjustmentQuantity}
        handleStockUpdate={handleStockUpdate}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        productToDelete={productToDelete}
        confirmDelete={confirmDelete}
        selectedProductName={selectedProduct?.productName}
        successModalOpen={successModalOpen}
        setSuccessModalOpen={setSuccessModalOpen}
        successMessage={successMessage}
        bulkStatusModalOpen={bulkStatusModalOpen}
        setBulkStatusModalOpen={setBulkStatusModalOpen}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        handleBulkStatusUpdate={handleBulkStatusUpdate}
        bulkCategoryModalOpen={bulkCategoryModalOpen}
        setBulkCategoryModalOpen={setBulkCategoryModalOpen}
        setSoftwareCategory={softwareCategory}
        // setNewCategory={setNewCategory}
        handleBulkCategoryUpdate={handleBulkCategoryUpdate}
        bulkDeleteModalOpen={bulkDeleteModalOpen}
        setBulkDeleteModalOpen={setBulkDeleteModalOpen}
        selectedRowCount={Object.keys(rowSelection).length}
        handleBulkDelete={handleBulkDelete}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
        productToEdit={productToEdit}
        setProductToEdit={setProductToEdit}
        handleEditSubmit={handleEditSubmit}
      />
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
