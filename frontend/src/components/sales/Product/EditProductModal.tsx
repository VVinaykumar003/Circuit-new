import React from "react";
import type { Product } from "@/type/salesProduct";

interface EditProductModalProps {
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  productToEdit: Product | null; // Keep this as it's used for form values
  setProductToEdit: React.Dispatch<React.SetStateAction<Product | null>>;
  handleEditSubmit: (editedProduct: Product) => Promise<void>; // Updated signature
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  editModalOpen,
  setEditModalOpen,
  productToEdit,
  setProductToEdit,
  handleEditSubmit,
}) => {
  return (
    <dialog className={`modal ${editModalOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">Edit Product</h3>
        {productToEdit && (
          <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(productToEdit); }} className="space-y-4">
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
                <input type="text" className="input input-bordered w-full" value={productToEdit.sku || ""} onChange={(e) => setProductToEdit({...productToEdit, sku: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Barcode</span></label>
                <input type="text" className="input input-bordered w-full" value={productToEdit.barcode || ""} onChange={(e) => setProductToEdit({...productToEdit, barcode: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Product Type</span></label>
                <select className="select select-bordered w-full" value={productToEdit.productType} onChange={(e) => setProductToEdit({...productToEdit, productType: e.target.value as any})}>
                  <option value="ERP">ERP</option>
                  <option value="CRM">CRM</option>
                  <option value="SaaS">SaaS</option>
                  <option value="POS">POS</option>
                  <option value="HRMS">HRMS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Software Category</span></label>
                <input type="text" className="input input-bordered w-full" value={productToEdit.softwareCategory || ""} onChange={(e) => setProductToEdit({...productToEdit, softwareCategory: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Brand</span></label>
                <input type="text" className="input input-bordered w-full" value={productToEdit.brand || ""} onChange={(e) => setProductToEdit({...productToEdit, brand: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Selling Price (₹)</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.sellingPrice || 0} onChange={(e) => setProductToEdit({...productToEdit, sellingPrice: Number(e.target.value)})} required />
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
                <label className="label"><span className="label-text">License Type</span></label>
                <select className="select select-bordered w-full" value={productToEdit.licenseType} onChange={(e) => setProductToEdit({...productToEdit, licenseType: e.target.value as any})}>
                  <option value="One Time">One Time</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Activation Type</span></label>
                <select className="select select-bordered w-full" value={productToEdit.activationType} onChange={(e) => setProductToEdit({...productToEdit, activationType: e.target.value as any})}>
                  <option value="License Key">License Key</option>
                  <option value="Email">Email</option>
                  <option value="Domain">Domain</option>
                  <option value="Device">Device</option>
                  <option value="API Key">API Key</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Validity Days</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.validityDays || 0} onChange={(e) => setProductToEdit({...productToEdit, validityDays: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Max Users</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.maxUsers || 0} onChange={(e) => setProductToEdit({...productToEdit, maxUsers: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Max Devices</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.maxDevices || 0} onChange={(e) => setProductToEdit({...productToEdit, maxDevices: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Tax (%)</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.tax || 0} onChange={(e) => setProductToEdit({...productToEdit, tax: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Discount (%)</span></label>
                <input type="number" className="input input-bordered w-full" value={productToEdit.discount || 0} onChange={(e) => setProductToEdit({...productToEdit, discount: Number(e.target.value)})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Warehouse</span></label>
                <input type="text" className="input input-bordered w-full" value={productToEdit.warehouse || ""} onChange={(e) => setProductToEdit({...productToEdit, warehouse: e.target.value})} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Unit of Measure (UoM)</span></label>
                <input type="text" className="input input-bordered w-full" value={productToEdit.uom || ""} onChange={(e) => setProductToEdit({...productToEdit, uom: e.target.value})} />
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
  );
};