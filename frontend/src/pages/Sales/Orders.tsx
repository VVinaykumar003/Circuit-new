import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MdSave, MdSend, MdContentCopy, MdAdd, MdDelete, 
  MdAttachment, MdWarning, MdCalculate,
  MdCheckCircle 
} from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { createOrder, getOrderById, updateOrder } from "@/services/orderServices";
import { getSalesReps } from "@/services/salesRepServices";
import { getAllProducts } from "@/services/productServices";
import { getAllAccounts } from "@/services/salesService";
import { useQuery } from "@tanstack/react-query";

// const productsData = [
//   { id: "PRD-101", name: "Wireless Headphones Pro", sku: "WHP-BLK-01", retail: 4999, cost: 2500, stock: 145 },
//   { id: "PRD-102", name: "ERP Suite License", sku: "ERP-ENT-ANNUAL", retail: 24999, cost: 5000, stock: 9999 },
//   { id: "PRD-103", name: "USB-C Hub 7-in-1", sku: "HUB-7IN1-SLV", retail: 1299, cost: 600, stock: 12 },
// ];

/* ─────────────────────────── Helpers ─────────────────────────── */
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const a = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const format = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + format(n % 100) : "");
    if (n < 100000) return format(Math.floor(n / 1000)) + "Thousand " + (n % 1000 !== 0 ? format(n % 1000) : "");
    if (n < 10000000) return format(Math.floor(n / 100000)) + "Lakh " + (n % 100000 !== 0 ? format(n % 100000) : "");
    return format(Math.floor(n / 10000000)) + "Crore " + (n % 10000000 !== 0 ? format(n % 10000000) : "");
  };
  return "Rupees " + format(Math.floor(num)).trim() + " Only";
};

/* ─────────────────────────── Zod Schema ─────────────────────────── */
const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  sku: z.string(),
  stock: z.number(),
  retailPrice: z.number(),
  costPrice: z.number(),
  sellingPrice: z.coerce.number().min(0.01, "Required"),
  quantity: z.coerce.number().min(1, "Must be > 0"),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  taxPct: z.coerce.number().min(0).max(100).default(0),
  lineTotal: z.number(),
});

const orderSchema = z.object({
  // 1. Order Info
  orderNumber: z.string(),
  salesOwner: z.string().min(1, "Sales Owner is required"),
  orderDate: z.string().min(1, "Order Date is required"),
  deliveryDate: z.string().min(1, "Delivery Date is required"),
  status: z.string(),
  priority: z.string(),

  // 2. Customer Info
  customerId: z.string().min(1, "Customer is required"),
  contactPerson: z.string(),
  phone: z.string(),
  email: z.string(),
  billingAddress: z.string().min(1, "Billing address required"),
  shippingAddress: z.string().min(1, "Shipping address required"),
  sameAsBilling: z.boolean(),

  // 3. Items
  items: z.array(orderItemSchema).min(1, "At least one product is required"),

  // 4. Summary
  subtotal: z.number(),
  summaryDiscount: z.coerce.number().min(0).default(0),
  summaryTax: z.coerce.number().min(0).default(0),
  shippingCharges: z.coerce.number().min(0, "Cannot be negative").default(0),
  adjustment: z.coerce.number().default(0),
  grandTotal: z.number(),

  // 5. Payment
  paymentTerms: z.string(),
  paymentMethod: z.string(),
  advancePayment: z.coerce.number().min(0).default(0),

  // 6. Delivery
  deliveryMethod: z.string(),
  deliveryInstructions: z.string(),
  trackingNumber: z.string(),
  expectedDeliveryDate: z.string(),

  // 7. Notes
  internalNotes: z.string(),
  customerNotes: z.string(),

  // 8. Approval
  requiresApproval: z.boolean(),
  approver: z.string(),
  approvalStatus: z.string(),
}).superRefine((data, ctx) => {
  if (new Date(data.deliveryDate) < new Date(data.orderDate)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Delivery Date must be after Order Date", path: ["deliveryDate"] });
  }
  if (data.advancePayment > data.grandTotal) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Advance cannot exceed Grand Total", path: ["advancePayment"] });
  }
});

type OrderFormValues = z.infer<typeof orderSchema>;

/* ── FormRow Helper ── */
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

/* ─────────────────────────── Component ─────────────────────────── */
export default function NewOrderForm() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { auth } = useAuth();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [productsData, setProductsData] = useState<any[]>([]);

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth?.slug],
    queryFn: () => getSalesReps(auth?.slug || "default-tenant"),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts", auth?.slug],
    queryFn: () => getAllAccounts(auth?.slug || "default-tenant"),
  });

  const { data: products } = useQuery({
    queryKey: ["products", auth?.slug],
    queryFn: () => getAllProducts(auth?.slug || "default-tenant"),
  });

  console.log("Product : ", productsData)

  useEffect(() => {
    if (products?.data) {
      const mappedProducts = products.data.map((p: any) => ({
        id: p._id || p.id,
        name: p.productName || p.name,
        sku: p.sku || "",
        stock: p.stockQuantity ?? p.openingStock ?? 0,
        retail: p.sellingPrice || p.unitPrice || 0,
        cost: p.costPrice || 0,
      }));
      setProductsData(mappedProducts);
    }
  }, [products]);

  const customers = useMemo(() => {
    return accountsData?.data?.data?.map((acc: any) => ({
      id: acc._id,
      name: acc.accountName,
      contact: `${acc.primaryContact?.firstName || ""} ${acc.primaryContact?.lastName || ""}`.trim(),
      phone: `${acc.primaryContact?.phone?.countryCode || ""} ${acc.primaryContact?.phone?.number || ""}`.trim(),
      email: acc.primaryContact?.email || "",
      billing: `${acc.billingAddress?.addressLine1 || ""}, ${acc.billingAddress?.city || ""}`,
      shipping: `${acc.shippingAddress?.addressLine1 || ""}, ${acc.shippingAddress?.city || ""}`
    })) || [];
  }, [accountsData]);

  const salesReps = useMemo(() => {
    return repsData?.data?.map((r: any) => r.memberId?.name || r.name || r.fullName).filter(Boolean) || [];
  }, [repsData]);

  const filteredOwners = useMemo(() => {
    if (!ownerSearch) return salesReps;
    return salesReps.filter(rep => rep?.toLowerCase().includes(ownerSearch.toLowerCase()));
  }, [salesReps, ownerSearch]);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      salesOwner: "",
      orderDate: new Date().toISOString().split("T")[0],
      status: "Draft",
      priority: "Medium",
      sameAsBilling: true,
      items: [{ productId: "", sku: "", stock: 0, retailPrice: 0, costPrice: 0, sellingPrice: 0, quantity: 1, discountPct: 0, taxPct: 0, lineTotal: 0 }],
      summaryDiscount: 0, summaryTax: 0, shippingCharges: 0, adjustment: 0, advancePayment: 0,
      paymentTerms: "Immediate", paymentMethod: "Bank Transfer",
      deliveryMethod: "Courier", approvalStatus: "Pending", requiresApproval: false
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Live Watches
  const wItems = watch("items");
  const wSubDisc = watch("summaryDiscount");
  const wSubTax = watch("summaryTax");
  const wShipping = watch("shippingCharges");
  const wAdjustment = watch("adjustment");
  const wAdvance = watch("advancePayment");
  const wCustomer = watch("customerId");
  const wSameAsBilling = watch("sameAsBilling");
  const wBilling = watch("billingAddress");
  const wSalesOwner = watch("salesOwner");

  // Summary Calculations
  const calculatedSubtotal = useMemo(() => {
    return wItems.reduce((sum, item) => {
      const sp = item.sellingPrice || 0;
      const qty = item.quantity || 0;
      const base = sp * qty;
      const afterDisc = base - (base * (item.discountPct || 0) / 100);
      const afterTax = afterDisc + (afterDisc * (item.taxPct || 0) / 100);
      return sum + afterTax;
    }, 0);
  }, [wItems]);

  const grandTotal = Math.max(0, calculatedSubtotal - (wSubDisc || 0) + (wSubTax || 0) + (wShipping || 0) + (wAdjustment || 0));
  const outstanding = Math.max(0, grandTotal - (wAdvance || 0));
  const amountInWords = useMemo(() => numberToWords(grandTotal), [grandTotal]);

  // Sync Calculations to Form State
  useEffect(() => {
    setValue("subtotal", calculatedSubtotal);
    setValue("grandTotal", grandTotal);
  }, [calculatedSubtotal, grandTotal, setValue]);

  // Sync Same As Billing
  useEffect(() => {
    if (wSameAsBilling) setValue("shippingAddress", wBilling);
  }, [wSameAsBilling, wBilling, setValue]);

  // Auto Save Draft
  useEffect(() => {
    const interval = setInterval(() => console.log("Order Draft saved..."), 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch data if editing
  useEffect(() => {
    if (orderId && auth.slug) {
      const fetchOrder = async () => {
        try {
          const res = await getOrderById(orderId, auth.slug as string);
          if (res.success && res.data) {
            const o = res.data;
            const matchedCustomer = customers.find(c => c.name === o.customerName);
            reset({
              orderNumber: o.orderNumber,
              salesOwner: o.salesRep || "V VINAY Kumar",
              orderDate: o.orderDate ? new Date(o.orderDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              deliveryDate: o.deliveryDate ? new Date(o.deliveryDate).toISOString().split("T")[0] : "",
              status: o.orderStatus,
              priority: o.priority,
              customerId: matchedCustomer?.id || "",
              contactPerson: o.contactPerson || "",
              phone: o.phone || "",
              email: o.email || "",
              billingAddress: o.billingAddress || "",
              shippingAddress: o.shippingAddress || "",
              sameAsBilling: o.billingAddress === o.shippingAddress,
              items: o.products?.map(p => ({
                productId: p.productId,
                sku: p.sku || "",
                stock: productsData.find(mp => mp.id === p.productId)?.stock || 999,
                retailPrice: p.price,
                costPrice: p.price * 0.8,
                sellingPrice: p.price,
                quantity: p.quantity || (p as any).qty || 1,
                discountPct: p.discount || 0,
                taxPct: p.tax || 0,
                lineTotal: p.total
              })) || [],
              subtotal: o.orderValue || 0,
              summaryDiscount: 0,
              summaryTax: 0,
              shippingCharges: 0,
              adjustment: 0,
              grandTotal: o.orderValue || 0,
              paymentTerms: o.paymentTerms || "Immediate",
              paymentMethod: "Bank Transfer",
              advancePayment: 0,
              deliveryMethod: "Courier",
              deliveryInstructions: "",
              trackingNumber: "",
              expectedDeliveryDate: "",
              internalNotes: o.notes?.internal || "",
              customerNotes: o.notes?.customer || "",
              requiresApproval: false,
              approver: "",
              approvalStatus: "Pending"
            });
          }
        } catch (err) {
          toast.error("Failed to load order details.");
        }
      };
      if (customers.length > 0 || accountsData) fetchOrder();
    }
  }, [orderId, auth.slug, reset, customers, accountsData]);

  /* ── Handlers ── */
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setValue("customerId", cid);
    const customer = customers.find(c => c.id === cid);
    if (customer) {
      setValue("contactPerson", customer.contact);
      setValue("phone", customer.phone);
      setValue("email", customer.email);
      setValue("billingAddress", customer.billing);
      if (wSameAsBilling) setValue("shippingAddress", customer.billing);
      else setValue("shippingAddress", customer.shipping);
    }
  };

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const pid = e.target.value;
    setValue(`items.${index}.productId`, pid);
    const product = productsData.find(p => p.id === pid);
    if (product) {
      setValue(`items.${index}.sku`, product.sku);
      setValue(`items.${index}.stock`, product.stock);
      setValue(`items.${index}.retailPrice`, product.retail);
      setValue(`items.${index}.costPrice`, product.cost);
      setValue(`items.${index}.sellingPrice`, product.retail);
      setValue(`items.${index}.quantity`, 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachments([...attachments, ...Array.from(e.target.files)]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const loadTemplate = (type: string) => {
    if (type === "Retail") {
      setValue("paymentTerms", "Immediate");
      setValue("deliveryMethod", "Pickup");
    }
  };

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        customerName: customers.find(c => c.id === data.customerId)?.name || "Unknown Customer",
        products: data.items.map(item => {
           const sp = item.sellingPrice || 0;
           const qty = item.quantity || 0;
           const base = sp * qty;
           const afterDisc = base - (base * (item.discountPct || 0) / 100);
           const lineTotal = afterDisc + (afterDisc * (item.taxPct || 0) / 100);
           return {
             productId: item.productId,
             productName: productsData.find(p => p.id === item.productId)?.name || "Unknown",
             sku: item.sku,
             price: item.sellingPrice,
             quantity: item.quantity,
             discount: item.discountPct,
             tax: item.taxPct,
             total: lineTotal
           }
        }),
        orderValue: data.grandTotal,
        orderStatus: data.status,
        notes: { internal: data.internalNotes, customer: data.customerNotes }
      };

      if (orderId) {
        await updateOrder(orderId, payload as any, auth.slug || "default-tenant");
        setSuccessMessage("Sales Order updated successfully!");
      } else {
        await createOrder(auth.slug || "default-tenant", payload as any);
        setSuccessMessage("Sales Order created successfully!");
      }
      setSuccessModalOpen(true);
    } catch (err: unknown) {
      toast.error(`Failed to ${orderId ? 'update' : 'create'} order.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">{orderId ? "Edit Sales Order" : "Create Sales Order"}</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Orders</li>
              <li className="font-semibold text-primary">{orderId ? "Edit Order" : "Create Order"}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="dropdown dropdown-end">
            <button tabIndex={0} type="button" className="btn btn-outline btn-sm gap-2"><MdContentCopy size={16} /> Load Template</button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 mt-1 border border-base-200">
              <li><a onClick={() => loadTemplate("Retail")}>Retail Order</a></li>
              <li><a>Wholesale Order</a></li>
            </ul>
          </div>
          <button type="button" className="btn btn-outline btn-sm gap-2"><MdSave size={16} /> Save Draft</button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Order Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">1. Order Information</div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Order Number">
                <input {...register("orderNumber")} className="input input-bordered w-full bg-base-200 font-mono font-bold text-primary" readOnly />
              </FormRow>
              <FormRow label="Sales Owner" required error={errors.salesOwner?.message}>
                <div className="dropdown w-full">
                  <label tabIndex={0} className={`btn btn-outline bg-base-100 justify-start font-normal w-full ${errors.salesOwner ? "border-error" : "border-base-300"}`}>
                    {wSalesOwner || "-Select Owner-"}
                  </label>
                  <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="input input-sm input-bordered w-full mb-2"
                      value={ownerSearch}
                      onChange={e => setOwnerSearch(e.target.value)}
                    />
                    <ul className="max-h-60 overflow-y-auto">
                      {filteredOwners.map((rep) => (
                        <li key={rep}>
                          <a onClick={() => { setValue("salesOwner", rep, { shouldValidate: true }); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FormRow>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Order Date" required error={errors.orderDate?.message}>
                  <input type="date" {...register("orderDate")} className="input input-bordered w-full" />
                </FormRow>
                <FormRow label="Delivery Date" required error={errors.deliveryDate?.message}>
                  <input type="date" {...register("deliveryDate")} className={`input input-bordered w-full ${errors.deliveryDate ? 'input-error' : ''}`} />
                </FormRow>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Order Status">
                  <select {...register("status")} className="select select-bordered w-full">
                    <option>Draft</option><option>Pending</option><option>Confirmed</option>
                    <option>Processing</option><option>Delivered</option><option>Cancelled</option>
                  </select>
                </FormRow>
                <FormRow label="Priority">
                  <select {...register("priority")} className="select select-bordered w-full">
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </FormRow>
              </div>
            </div>
          </div>

          {/* 2. Customer Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">2. Customer Information</div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Customer Account" required error={errors.customerId?.message}>
                <div className="flex gap-2">
                  <select className={`select select-bordered w-full ${errors.customerId ? 'select-error' : ''}`} onChange={handleCustomerChange} value={wCustomer}>
                    <option value="">-Select Customer-</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" onClick={() => (document.getElementById('add_customer_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-square"><MdAdd size={18} /></button>
                </div>
              </FormRow>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Contact Person</label>
                  <input {...register("contactPerson")} className="input input-sm input-bordered bg-base-200" readOnly />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Phone</label>
                  <input {...register("phone")} className="input input-sm input-bordered bg-base-200" readOnly />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Email</label>
                  <input {...register("email")} className="input input-sm input-bordered bg-base-200" readOnly />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="label font-medium">Billing Address *</label>
                  <textarea {...register("billingAddress")} className={`textarea textarea-bordered w-full ${errors.billingAddress ? 'textarea-error' : ''}`} rows={3}></textarea>
                  {errors.billingAddress && <p className="text-xs text-error mt-1">{errors.billingAddress.message}</p>}
                </div>
                <div>
                  <div className="flex justify-between items-center h-[34px]">
                    <label className="label font-medium">Shipping Address *</label>
                    <label className="cursor-pointer label gap-2">
                      <span className="label-text text-xs">Same as Billing</span>
                      <input type="checkbox" {...register("sameAsBilling")} className="checkbox checkbox-xs checkbox-primary" />
                    </label>
                  </div>
                  <textarea {...register("shippingAddress")} disabled={wSameAsBilling} className={`textarea textarea-bordered w-full ${errors.shippingAddress ? 'textarea-error' : ''}`} rows={3}></textarea>
                  {errors.shippingAddress && <p className="text-xs text-error mt-1">{errors.shippingAddress.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sales Items (Dynamic Table) */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl overflow-visible">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">3. Sales Items</div>
            <div className="collapse-content pt-5 overflow-x-auto">
              
              {errors.items?.root && <div className="alert alert-error mb-4 py-2 text-sm">{errors.items.root.message}</div>}
              
              <table className="table table-sm w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-10">#</th>
                    <th className="w-64">Product *</th>
                    <th>SKU / Stock</th>
                    <th>Retail Price</th>
                    <th>Selling Price *</th>
                    <th className="w-24">Qty *</th>
                    <th className="w-20">Disc %</th>
                    <th className="w-20">Tax %</th>
                    <th>Line Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const item = wItems[index];
                    const sp = item.sellingPrice || 0;
                    const qty = item.quantity || 0;
                    const base = sp * qty;
                    const afterDisc = base - (base * (item.discountPct || 0) / 100);
                    const lineTotal = afterDisc + (afterDisc * (item.taxPct || 0) / 100);
                    const profit = (sp - (item.costPrice || 0)) * qty;
                    
                    const stockWarning = item.stock !== undefined && qty > item.stock;

                    return (
                      <React.Fragment key={field.id}>
                        <tr className="hover:bg-base-200/20 border-b border-base-200">
                          <td className="align-top pt-3 font-medium text-base-content/50">{index + 1}</td>
                          <td className="align-top">
                            <select className="select select-sm select-bordered w-full overflow-x-hidden" value={item.productId} onChange={(e) => handleProductChange(index, e)}>
                              <option value="" className="overflow-x-hidden">-Select Product-</option>
                              {productsData.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {errors.items?.[index]?.productId && <p className="text-xs text-error mt-1">{errors.items[index]?.productId?.message}</p>}
                          </td>
                          <td className="align-top pt-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-mono font-semibold">{item.sku || "—"}</span>
                              <span className={`text-[10px] ${stockWarning ? 'text-error font-bold flex items-center gap-1' : 'text-base-content/60'}`}>
                                Stock: {item.stock || 0} {stockWarning && <MdWarning size={12}/>}
                              </span>
                            </div>
                          </td>
                          <td className="align-top pt-3">₹{item.retailPrice?.toLocaleString() || "0.00"}</td>
                          <td className="align-top">
                            <input type="number" step="0.01" {...register(`items.${index}.sellingPrice`)} className="input input-sm input-bordered w-full" />
                            {errors.items?.[index]?.sellingPrice && <p className="text-xs text-error mt-1">Req.</p>}
                          </td>
                          <td className="align-top">
                            <input type="number" {...register(`items.${index}.quantity`)} className={`input input-sm input-bordered w-full ${stockWarning ? 'input-error bg-error/10' : ''}`} />
                            {errors.items?.[index]?.quantity && <p className="text-xs text-error mt-1">Req.</p>}
                          </td>
                          <td className="align-top"><input type="number" {...register(`items.${index}.discountPct`)} className="input input-sm input-bordered w-full" /></td>
                          <td className="align-top"><input type="number" {...register(`items.${index}.taxPct`)} className="input input-sm input-bordered w-full" /></td>
                          <td className="align-top pt-3 font-semibold text-success">
                            ₹{lineTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            {item.productId && <p className="text-[10px] text-base-content/50 font-normal mt-1">Profit: ₹{profit.toLocaleString()}</p>}
                          </td>
                          <td className="align-top pt-2 text-right">
                            <div className="join">
                              <button type="button" onClick={() => append({...item})} className="btn btn-xs btn-ghost join-item" title="Duplicate"><MdContentCopy/></button>
                              <button type="button" onClick={() => remove(index)} className="btn btn-xs btn-ghost text-error hover:bg-error hover:text-white join-item" disabled={fields.length === 1} title="Delete"><MdDelete size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => append({ productId: "", sku: "", stock: 0, retailPrice: 0, costPrice: 0, sellingPrice: 0, quantity: 1, discountPct: 0, taxPct: 0, lineTotal: 0 })} className="btn btn-sm btn-outline btn-primary gap-2">
                  <MdAdd /> Add Row
                </button>
                <button type="button" onClick={() => (document.getElementById('add_product_modal') as HTMLDialogElement).showModal()} className="btn btn-sm btn-ghost gap-2">
                  Quick Add Product
                </button>
              </div>
            </div>
          </div>

          {/* 4. Order Summary */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">4. Order Summary</div>
            <div className="collapse-content pt-5">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* Left side info */}
                <div className="flex-1 bg-base-200/50 p-4 rounded-xl border border-base-200 flex flex-col justify-center items-center text-center">
                  <MdCalculate size={32} className="text-primary/40 mb-2" />
                  <p className="text-sm font-semibold text-base-content/70">Amount In Words</p>
                  <p className="text-primary font-medium mt-1 uppercase text-sm leading-relaxed">{amountInWords}</p>
                </div>

                {/* Right side calculations */}
                <div className="flex-1 space-y-3 md:max-w-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">Subtotal</span>
                    <span className="font-semibold text-base-content">₹{calculatedSubtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">Overall Discount (₹)</span>
                    <input type="number" step="0.01" {...register("summaryDiscount")} className="input input-sm input-bordered w-32 text-right" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">Overall Tax (₹)</span>
                    <input type="number" step="0.01" {...register("summaryTax")} className="input input-sm input-bordered w-32 text-right" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">Shipping Charges</span>
                    <input type="number" step="0.01" {...register("shippingCharges")} className={`input input-sm input-bordered w-32 text-right ${errors.shippingCharges ? 'input-error' : ''}`} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-base-content/70">Adjustment (±)</span>
                    <input type="number" step="0.01" {...register("adjustment")} className="input input-sm input-bordered w-32 text-right" />
                  </div>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Grand Total</span>
                    <span className="text-2xl font-bold text-success">₹{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Payment Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">5. Payment Information</div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormRow label="Payment Terms">
                  <select {...register("paymentTerms")} className="select select-bordered w-full">
                    <option>Immediate</option><option>Net 15</option><option>Net 30</option><option>Net 45</option>
                  </select>
                </FormRow>
                <FormRow label="Payment Method">
                  <select {...register("paymentMethod")} className="select select-bordered w-full">
                    <option>Cash</option><option>Bank Transfer</option><option>Cheque</option><option>Credit Card</option><option>UPI</option>
                  </select>
                </FormRow>
                <FormRow label="Advance Payment" error={errors.advancePayment?.message}>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                    <input type="number" step="0.01" {...register("advancePayment")} className={`input input-bordered w-full pl-8 ${errors.advancePayment ? 'input-error' : ''}`} />
                  </div>
                </FormRow>
                <FormRow label="Outstanding Amount">
                  <input type="text" value={`₹ ${outstanding.toLocaleString(undefined, {minimumFractionDigits:2})}`} className="input input-bordered w-full bg-base-200 font-bold text-error" readOnly />
                </FormRow>
              </div>
            </div>
          </div>

          {/* 6. Delivery Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">6. Delivery Information</div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormRow label="Delivery Method">
                  <select {...register("deliveryMethod")} className="select select-bordered w-full">
                    <option>Pickup</option><option>Courier</option><option>Transport</option>
                  </select>
                </FormRow>
                <FormRow label="Tracking Number">
                  <input {...register("trackingNumber")} className="input input-bordered w-full" placeholder="AWB / Ref Num" />
                </FormRow>
                <div className="md:col-span-2">
                  <FormRow label="Delivery Instructions">
                    <textarea {...register("deliveryInstructions")} className="textarea textarea-bordered w-full" rows={2} placeholder="Any specific instructions for delivery..."></textarea>
                  </FormRow>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Notes & Attachments */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">7. Notes & Attachments</div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="label font-medium"><span className="label-text">Internal Notes</span></label>
                  <textarea {...register("internalNotes")} className="textarea textarea-bordered w-full bg-warning/5 border-warning/30" rows={3} placeholder="Visible only to staff..."></textarea>
                </div>
                <div>
                  <label className="label font-medium"><span className="label-text">Customer Notes</span></label>
                  <textarea {...register("customerNotes")} className="textarea textarea-bordered w-full" rows={3} placeholder="Printed on order/invoice..."></textarea>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center hover:bg-base-200/50 transition-colors">
                <MdAttachment className="mx-auto text-base-content/40 mb-2" size={32} />
                <p className="text-sm font-medium">Drag & Drop files or click to upload</p>
                <p className="text-xs text-base-content/50 mt-1">PDF, DOCX, XLSX, JPG, PNG</p>
                <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} accept=".pdf,.docx,.xlsx,.jpg,.png" />
                <label htmlFor="file-upload" className="btn btn-outline btn-sm mt-4 cursor-pointer">Browse Files</label>
              </div>
              
              {attachments.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {attachments.map((file, i) => (
                    <li key={i} className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <button type="button" onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-error hover:text-error/70"><MdDelete size={18} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 8. Approval Workflow */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">8. Approval Workflow</div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormRow label="Requires Approval">
                  <input type="checkbox" {...register("requiresApproval")} className="toggle toggle-primary" />
                </FormRow>
                {watch("requiresApproval") && (
                  <>
                    <FormRow label="Approver">
                      <select {...register("approver")} className="select select-bordered w-full">
                        <option value="">-Select Approver-</option>
                        <option value="Manager A">Manager A</option>
                        <option value="Director B">Director B</option>
                      </select>
                    </FormRow>
                    <FormRow label="Approval Status">
                      <div className="badge badge-lg badge-outline badge-warning font-bold">Pending</div>
                    </FormRow>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">Order Summary</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Order Number</span>
                <p className="font-mono font-bold text-primary text-sm mt-1">{watch("orderNumber")}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Customer</span>
                <p className="font-medium mt-1 truncate">{wCustomer ? customers.find(c => c.id === wCustomer)?.name : "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-base-content/60 uppercase font-semibold">Total Items</span>
                  <p className="font-medium mt-1">{fields.length}</p>
                </div>
                <div>
                  <span className="text-xs text-base-content/60 uppercase font-semibold">Total Qty</span>
                  <p className="font-medium mt-1">{wItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}</p>
                </div>
              </div>
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Grand Total</span>
                <p className="font-bold text-success text-2xl mt-1">₹{grandTotal.toLocaleString(undefined, {maximumFractionDigits:2})}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Delivery Date</span>
                <p className="font-medium mt-1">{watch("deliveryDate") || "—"}</p>
              </div>
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Order Status</span>
                <div className="mt-1">
                  <span className="badge badge-primary">{watch("status")}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-sm gap-2">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <><MdSend size={18}/> Submit Order</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Modals ── */}
      <dialog id="add_customer_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Customer</h3>
          <input type="text" className="input input-bordered w-full mt-4" placeholder="Company Name" />
          <input type="text" className="input input-bordered w-full mt-2" placeholder="Contact Person" />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Customer</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="add_product_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Product</h3>
          <input type="text" className="input input-bordered w-full mt-4" placeholder="Product Name" />
          <input type="number" className="input input-bordered w-full mt-2" placeholder="Retail Price" />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Product</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">{successMessage}</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => { setSuccessModalOpen(false); navigate("/sales/orders"); }}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}