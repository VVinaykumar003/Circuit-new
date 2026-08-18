import React from "react";
import { MdWarning, MdCheckCircle } from "react-icons/md";
import type { Product } from "@/type/salesProduct";

interface ProductModalsProps {
  // Quick Stock Modal
  stockModalOpen: boolean;
  setStockModalOpen: (open: boolean) => void;
  stockUpdateProduct: Product | null;
  stockAdjustmentType: string;
  setStockAdjustmentType: (type: string) => void;
  stockAdjustmentQuantity: number | "";
  setStockAdjustmentQuantity: (qty: number | "") => void;
  handleStockUpdate: () => Promise<void>;

  // Delete Confirmation Modal
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  productToDelete: string | null;
  confirmDelete: () => Promise<void>;
  selectedProductName: string | undefined; // For displaying in delete modal

  // Success Modal
  successModalOpen: boolean;
  setSuccessModalOpen: (open: boolean) => void;
  successMessage: string;

  // Bulk Status Modal
  bulkStatusModalOpen: boolean;
  setBulkStatusModalOpen: (open: boolean) => void;
  newStatus: string;
  setNewStatus: (status: string) => void;
  handleBulkStatusUpdate: () => Promise<void>;

  // Bulk Category Modal
  bulkCategoryModalOpen: boolean;
  setBulkCategoryModalOpen: (open: boolean) => void;
  newCategory: string;
  softwareCategory: string;
  setSoftwareCategory: (category: string) => void;
  handleBulkCategoryUpdate: () => Promise<void>;

  // Bulk Delete Confirmation Modal
  bulkDeleteModalOpen: boolean;
  setBulkDeleteModalOpen: (open: boolean) => void;
  selectedRowCount: number; // For displaying count in bulk delete
  handleBulkDelete: () => Promise<void>;
}

export const ProductModals: React.FC<ProductModalsProps> = ({
  stockModalOpen,
  setStockModalOpen,
  stockUpdateProduct,
  stockAdjustmentType,
  setStockAdjustmentType,
  stockAdjustmentQuantity,
  setStockAdjustmentQuantity,
  handleStockUpdate,
  deleteModalOpen,
  setDeleteModalOpen,
  // productToDelete,
  confirmDelete,
  selectedProductName,
  successModalOpen,
  setSuccessModalOpen,
  successMessage,
  bulkStatusModalOpen,
  setBulkStatusModalOpen,
  newStatus,
  setNewStatus,
  handleBulkStatusUpdate,
  bulkCategoryModalOpen,
  setBulkCategoryModalOpen,
  softwareCategory,
  setSoftwareCategory,
  handleBulkCategoryUpdate,
  bulkDeleteModalOpen,
  setBulkDeleteModalOpen,
  selectedRowCount,
  handleBulkDelete,
}) => {
  return (
    <>


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
          <p className="py-4 text-base-content/80">Are you sure you want to delete {selectedProductName ? <strong>{selectedProductName}</strong> : "this product"}? This action cannot be undone.</p>
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
            <input type="text" className="input input-bordered w-full" placeholder="Enter category name" value={softwareCategory} onChange={(e) => setSoftwareCategory(e.target.value)} />
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
          <p className="py-4 text-base-content/80">Are you sure you want to delete {selectedRowCount} selected products? This action cannot be undone.</p>
          <div className="modal-action">
            <button className="btn btn-ghost" onClick={() => setBulkDeleteModalOpen(false)}>Cancel</button>
            <button className="btn btn-error text-white" onClick={handleBulkDelete}>Yes, Delete All</button>
          </div>
        </div>
      </dialog>
    </>
  );
};