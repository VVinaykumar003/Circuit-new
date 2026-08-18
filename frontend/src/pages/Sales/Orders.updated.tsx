import React, { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  MdAdd,
  MdAttachment,
  MdCalculate,
  MdCheckCircle,
  MdContentCopy,
  MdDelete,
  MdSave,
  MdSend,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import {
  createOrder,
  getOrderById,
  updateOrder,
} from "@/services/orderServices";
import { getSalesReps } from "@/services/salesRepServices";
import { getAllProducts } from "@/services/productServices";
import { getAllAccounts } from "@/services/salesService";
import { useQuery } from "@tanstack/react-query";

/* ============================================================
   Types
   ============================================================ */

type Platform =
  | "windows"
  | "macos"
  | "linux"
  | "android"
  | "ios"
  | "web";

type BillingCycle = "Monthly" | "Yearly" | "One Time";

type LicenseType =
  | "One Time"
  | "Monthly"
  | "Yearly"
  | "Lifetime";

type ActivationType =
  | "License Key"
  | "Email"
  | "Domain"
  | "Device"
  | "API Key";

interface ProductPlan {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  features?: string[];
}

interface SoftwareProduct {
  _id?: string;
  id?: string;
  productName: string;
  productCode: string;
  sku?: string;
  productType: "ERP" | "CRM" | "SaaS" | "POS" | "HRMS" | "Other";
  status: "Active" | "Inactive" | "Discontinued";
  version?: string;
  licenseType?: LicenseType;
  activationType?: ActivationType;
  validityDays?: number;
  maxUsers?: number;
  maxDevices?: number;
  platformSupport?: Platform[];
  costPrice?: number;
  sellingPrice?: number;
  tax?: number;
  discount?: number;
  plans?: ProductPlan[];
}

interface CustomerOption {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  billing: string;
}

/* ============================================================
   Helpers
   ============================================================ */

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const format = (value: number): string => {
    if (value < 20) return ones[value];

    if (value < 100) {
      return (
        tens[Math.floor(value / 10)] +
        (value % 10 !== 0 ? ` ${ones[value % 10]}` : "")
      );
    }

    if (value < 1000) {
      return (
        ones[Math.floor(value / 100)] +
        "Hundred " +
        (value % 100 !== 0 ? `and ${format(value % 100)}` : "")
      );
    }

    if (value < 100000) {
      return (
        format(Math.floor(value / 1000)) +
        "Thousand " +
        (value % 1000 !== 0 ? format(value % 1000) : "")
      );
    }

    if (value < 10000000) {
      return (
        format(Math.floor(value / 100000)) +
        "Lakh " +
        (value % 100000 !== 0 ? format(value % 100000) : "")
      );
    }

    return (
      format(Math.floor(value / 10000000)) +
      "Crore " +
      (value % 10000000 !== 0 ? format(value % 10000000) : "")
    );
  };

  return `Rupees ${format(Math.floor(num)).trim()} Only`;
};

/* ============================================================
   Zod Schema
   Matches the new software Order model
   ============================================================ */

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  productName: z.string(),
  productCode: z.string(),
  sku: z.string(),

  productType: z.enum([
    "ERP",
    "CRM",
    "SaaS",
    "POS",
    "HRMS",
    "Other",
  ]),

  planId: z.string().optional(),
  planName: z.string().optional(),

  billingCycle: z
    .enum(["Monthly", "Yearly", "One Time"])
    .optional(),

  licenseType: z
    .enum(["One Time", "Monthly", "Yearly", "Lifetime"])
    .optional(),

  activationType: z
    .enum([
      "License Key",
      "Email",
      "Domain",
      "Device",
      "API Key",
    ])
    .optional(),

  validityDays: z.coerce.number().min(0),
  maxUsers: z.coerce.number().min(0),
  maxDevices: z.coerce.number().min(0),

  platformSupport: z.array(
    z.enum([
      "windows",
      "macos",
      "linux",
      "android",
      "ios",
      "web",
    ])
  ),

  unitPrice: z.coerce.number().min(0),
  quantity: z.coerce.number().min(1, "Must be at least 1"),

  discountPct: z.coerce.number().min(0).max(100),
  taxPct: z.coerce.number().min(0).max(100),

  lineSubtotal: z.number(),
  lineDiscount: z.number(),
  lineTax: z.number(),
  lineTotal: z.number(),
});

const orderSchema = z
  .object({
    orderNumber: z.string(),
    salesOwner: z.string().min(1, "Sales Owner is required"),
    orderDate: z.string().min(1, "Order Date is required"),

    status: z.enum([
      "Draft",
      "Pending",
      "Pending Approval",
      "Approved",
      "Processing",
      "Awaiting Payment",
      "Completed",
      "Cancelled",
      "On Hold",
    ]),

    priority: z.enum([
      "Low",
      "Medium",
      "High",
      "Urgent",
    ]),

    customerId: z.string().min(1, "Customer is required"),
    customerName: z.string(),
    contactPerson: z.string(),
    phone: z.string(),
    email: z.string(),

    billingAddress: z.string().min(
      1,
      "Billing address is required"
    ),

    deliveryType: z.enum([
      "Instant Download",
      "Email",
      "License Key",
      "Domain Activation",
      "Manual Activation",
      "Account Provisioning",
    ]),

    deliveryEmail: z.string(),
    activationDomain: z.string(),

    items: z
      .array(orderItemSchema)
      .min(1, "At least one software product is required"),

    subtotal: z.number(),
    summaryDiscount: z.coerce.number().min(0),
    summaryTax: z.coerce.number().min(0),
    adjustment: z.coerce.number(),

    grandTotal: z.number(),

    paymentTerms: z.string(),
    paymentMethod: z.string(),
    advancePayment: z.coerce.number().min(0),

    paymentStatus: z.enum([
      "Unpaid",
      "Partially Paid",
      "Paid",
      "Refunded",
      "Partially Refunded",
    ]),

    provisioningStatus: z.enum([
      "Pending",
      "Processing",
      "Provisioned",
      "Failed",
    ]),

    provisionedAt: z.string().optional(),

    internalNotes: z.string(),
    customerNotes: z.string(),

    requiresApproval: z.boolean(),
    approver: z.string(),
    approvalStatus: z.enum([
      "Pending",
      "Approved",
      "Rejected",
      "N/A",
    ]),
  })
  .superRefine((data, ctx) => {
    if (data.advancePayment > data.grandTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Advance cannot exceed Grand Total",
        path: ["advancePayment"],
      });
    }

    if (
      data.deliveryType === "Domain Activation" &&
      !data.activationDomain.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Activation domain is required for domain activation.",
        path: ["activationDomain"],
      });
    }

    if (
      data.deliveryType === "Email" &&
      !data.deliveryEmail.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Delivery email is required for email delivery.",
        path: ["deliveryEmail"],
      });
    }
  });

type OrderFormValues = z.infer<typeof orderSchema>;

/* ============================================================
   Form Row
   ============================================================ */

const FormRow = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[180px_1fr]">
    <label className="pt-2.5 text-sm font-medium text-base-content/80">
      {label}{" "}
      {required && (
        <span className="text-error">*</span>
      )}
    </label>

    <div className="w-full">
      {children}

      {error && (
        <p className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  </div>
);

/* ============================================================
   Empty Software Item
   ============================================================ */

const createEmptyItem = (): OrderFormValues["items"][number] => ({
  productId: "",
  productName: "",
  productCode: "",
  sku: "",
  productType: "Other",

  planId: "",
  planName: "",
  billingCycle: undefined,

  licenseType: undefined,
  activationType: undefined,

  validityDays: 0,
  maxUsers: 0,
  maxDevices: 0,

  platformSupport: [],

  unitPrice: 0,
  quantity: 1,

  discountPct: 0,
  taxPct: 0,

  lineSubtotal: 0,
  lineDiscount: 0,
  lineTax: 0,
  lineTotal: 0,
});

/* ============================================================
   Component
   ============================================================ */

export default function NewOrderForm() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { auth } = useAuth();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [successModalOpen, setSuccessModalOpen] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [attachments, setAttachments] =
    useState<File[]>([]);

  const [ownerSearch, setOwnerSearch] =
    useState("");

  const [productsData, setProductsData] =
    useState<SoftwareProduct[]>([]);

  /* ==========================================================
     Queries
     ========================================================== */

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth?.slug],
    queryFn: () =>
      getSalesReps(
        auth?.slug || "default-tenant"
      ),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts", auth?.slug],
    queryFn: () =>
      getAllAccounts(
        auth?.slug || "default-tenant"
      ),
  });

  const { data: products } = useQuery({
    queryKey: ["products", auth?.slug],
    queryFn: () =>
      getAllProducts(
        auth?.slug || "default-tenant"
      ),
  });

  /* ==========================================================
     Product Mapping
     ========================================================== */

  useEffect(() => {
    if (!products?.data) return;

    const mappedProducts: SoftwareProduct[] =
      products.data.map((product: any) => ({
        _id: product._id,
        id: product._id || product.id,

        productName: product.productName || "",
        productCode: product.productCode || "",
        sku: product.sku || "",

        productType:
          product.productType ||
          product.productGroup ||
          "Other",

        status: product.status || "Inactive",

        version: product.version || "",

        licenseType:
          product.licenseType || undefined,

        activationType:
          product.activationType || undefined,

        validityDays:
          Number(product.validityDays) || 0,

        maxUsers:
          Number(product.maxUsers) || 0,

        maxDevices:
          Number(product.maxDevices) || 0,

        platformSupport:
          product.platformSupport || [],

        costPrice:
          Number(product.costPrice) || 0,

        sellingPrice:
          Number(product.sellingPrice) || 0,

        tax:
          Number(product.tax) || 0,

        discount:
          Number(product.discount) || 0,

        plans: Array.isArray(product.plans)
          ? product.plans
          : [],
      }));

    setProductsData(mappedProducts);
  }, [products]);

  /* ==========================================================
     Customers
     ========================================================== */

  const customers = useMemo<CustomerOption[]>(() => {
    return (
      accountsData?.data?.data?.map(
        (account: any) => ({
          id: account._id,

          name:
            account.accountName || "",

          contact:
            `${account.primaryContact?.firstName || ""} ${
              account.primaryContact?.lastName || ""
            }`.trim(),

          phone:
            `${account.primaryContact?.phone?.countryCode || ""} ${
              account.primaryContact?.phone?.number || ""
            }`.trim(),

          email:
            account.primaryContact?.email || "",

          billing:
            [
              account.billingAddress?.addressLine1,
              account.billingAddress?.city,
              account.billingAddress?.state,
              account.billingAddress?.postalCode,
            ]
              .filter(Boolean)
              .join(", "),
        })
      ) || []
    );
  }, [accountsData]);

  /* ==========================================================
     Sales Reps
     ========================================================== */

  const salesReps = useMemo(() => {
    return (
      repsData?.data
        ?.map(
          (rep: any) =>
            rep.memberId?.name ||
            rep.name ||
            rep.fullName
        )
        .filter(Boolean) || []
    );
  }, [repsData]);

  const filteredOwners = useMemo(() => {
    if (!ownerSearch) return salesReps;

    return salesReps.filter((rep: string) =>
      rep
        .toLowerCase()
        .includes(ownerSearch.toLowerCase())
    );
  }, [salesReps, ownerSearch]);

  /* ==========================================================
     Form
     ========================================================== */

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),

    defaultValues: {
      orderNumber: `SO-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 10000
      )
        .toString()
        .padStart(5, "0")}`,

      salesOwner: "",

      orderDate: new Date()
        .toISOString()
        .split("T")[0],

      status: "Draft",
      priority: "Medium",

      customerId: "",
      customerName: "",
      contactPerson: "",
      phone: "",
      email: "",
      billingAddress: "",

      deliveryType: "Account Provisioning",
      deliveryEmail: "",
      activationDomain: "",

      items: [createEmptyItem()],

      subtotal: 0,
      summaryDiscount: 0,
      summaryTax: 0,
      adjustment: 0,
      grandTotal: 0,

      paymentTerms: "Immediate",
      paymentMethod: "Bank Transfer",
      advancePayment: 0,
      paymentStatus: "Unpaid",

      provisioningStatus: "Pending",
      provisionedAt: "",

      internalNotes: "",
      customerNotes: "",

      requiresApproval: false,
      approver: "",
      approvalStatus: "N/A",
    },
  });

  const { fields, append, remove } =
    useFieldArray({
      control,
      name: "items",
    });

  /* ==========================================================
     Watches
     ========================================================== */

  const watchedItems = watch("items");
  const watchedCustomer = watch("customerId");
  const watchedBillingAddress =
    watch("billingAddress");

  const watchedDeliveryType =
    watch("deliveryType");

  const watchedAdvance =
    watch("advancePayment");

  const watchedSummaryDiscount =
    watch("summaryDiscount");

  const watchedSummaryTax =
    watch("summaryTax");

  const watchedAdjustment =
    watch("adjustment");

  const watchedSalesOwner =
    watch("salesOwner");

  const watchedRequiresApproval =
    watch("requiresApproval");

  /* ==========================================================
     Calculations
     ========================================================== */

  const calculatedItems =
    useMemo(() => {
      return watchedItems.map((item) => {
        const unitPrice =
          Number(item.unitPrice) || 0;

        const quantity =
          Number(item.quantity) || 0;

        const subtotal =
          unitPrice * quantity;

        const discount =
          subtotal *
          ((Number(item.discountPct) || 0) /
            100);

        const taxableAmount =
          subtotal - discount;

        const tax =
          taxableAmount *
          ((Number(item.taxPct) || 0) /
            100);

        const total =
          taxableAmount + tax;

        return {
          ...item,
          lineSubtotal: subtotal,
          lineDiscount: discount,
          lineTax: tax,
          lineTotal: total,
        };
      });
    }, [watchedItems]);

  const calculatedSubtotal =
    calculatedItems.reduce(
      (sum, item) =>
        sum + item.lineSubtotal,
      0
    );

  const calculatedLineDiscount =
    calculatedItems.reduce(
      (sum, item) =>
        sum + item.lineDiscount,
      0
    );

  const calculatedLineTax =
    calculatedItems.reduce(
      (sum, item) =>
        sum + item.lineTax,
      0
    );

  const grandTotal = Math.max(
    0,
    calculatedSubtotal -
      calculatedLineDiscount -
      (Number(watchedSummaryDiscount) || 0) +
      calculatedLineTax +
      (Number(watchedSummaryTax) || 0) +
      (Number(watchedAdjustment) || 0)
  );

  const outstanding = Math.max(
    0,
    grandTotal -
      (Number(watchedAdvance) || 0)
  );

  const amountInWords = useMemo(
    () => numberToWords(grandTotal),
    [grandTotal]
  );

  /* ==========================================================
     Sync Calculations
     ========================================================== */

  useEffect(() => {
    setValue(
      "subtotal",
      calculatedSubtotal,
      {
        shouldValidate: false,
      }
    );

    setValue(
      "grandTotal",
      grandTotal,
      {
        shouldValidate: false,
      }
    );

    calculatedItems.forEach(
      (item, index) => {
        setValue(
          `items.${index}.lineSubtotal`,
          item.lineSubtotal,
          {
            shouldValidate: false,
          }
        );

        setValue(
          `items.${index}.lineDiscount`,
          item.lineDiscount,
          {
            shouldValidate: false,
          }
        );

        setValue(
          `items.${index}.lineTax`,
          item.lineTax,
          {
            shouldValidate: false,
          }
        );

        setValue(
          `items.${index}.lineTotal`,
          item.lineTotal,
          {
            shouldValidate: false,
          }
        );
      }
    );
  }, [
    calculatedItems,
    calculatedSubtotal,
    grandTotal,
    setValue,
  ]);

  /* ==========================================================
     Load Existing Order
     ========================================================== */

  useEffect(() => {
    if (!orderId || !auth.slug) return;

    const fetchOrder = async () => {
      try {
        const response =
          await getOrderById(
            orderId,
            auth.slug as string
          );

        if (!response.success || !response.data) {
          return;
        }

        const order = response.data;

        const matchedCustomer =
          customers.find(
            (customer) =>
              customer.id ===
                order.customerId ||
              customer.name ===
                order.customerName
          );

        const existingItems =
          Array.isArray(order.items)
            ? order.items.map(
                (item: any) => ({
                  productId:
                    item.productId?._id ||
                    item.productId ||
                    "",

                  productName:
                    item.productName || "",

                  productCode:
                    item.productCode || "",

                  sku: item.sku || "",

                  productType:
                    item.productType ||
                    "Other",

                  planId:
                    item.planId || "",

                  planName:
                    item.planName || "",

                  billingCycle:
                    item.billingCycle,

                  licenseType:
                    item.licenseType,

                  activationType:
                    item.activationType,

                  validityDays:
                    Number(
                      item.validityDays
                    ) || 0,

                  maxUsers:
                    Number(item.maxUsers) || 0,

                  maxDevices:
                    Number(
                      item.maxDevices
                    ) || 0,

                  platformSupport:
                    item.platformSupport ||
                    [],

                  unitPrice:
                    Number(
                      item.unitPrice
                    ) || 0,

                  quantity:
                    Number(item.quantity) ||
                    1,

                  discountPct:
                    Number(
                      item.discountPct
                    ) || 0,

                  taxPct:
                    Number(item.taxPct) ||
                    0,

                  lineSubtotal:
                    Number(
                      item.lineSubtotal
                    ) || 0,

                  lineDiscount:
                    Number(
                      item.lineDiscount
                    ) || 0,

                  lineTax:
                    Number(item.lineTax) ||
                    0,

                  lineTotal:
                    Number(
                      item.lineTotal
                    ) || 0,
                })
              )
            : [];

        reset({
          orderNumber:
            order.orderNumber || "",

          salesOwner:
            order.salesOwner ||
            order.salesRep ||
            "",

          orderDate: order.orderDate
            ? new Date(order.orderDate)
                .toISOString()
                .split("T")[0]
            : new Date()
                .toISOString()
                .split("T")[0],

          status:
            order.status ||
            "Draft",

          priority:
            order.priority ||
            "Medium",

          customerId:
            matchedCustomer?.id ||
            order.customerId ||
            "",

          customerName:
            order.customerName || "",

          contactPerson:
            order.contactPerson || "",

          phone: order.phone || "",

          email: order.email || "",

          billingAddress:
            order.billingAddress || "",

          deliveryType:
            order.deliveryType ||
            "Account Provisioning",

          deliveryEmail:
            order.deliveryEmail ||
            "",

          activationDomain:
            order.activationDomain ||
            "",

          items:
            existingItems.length > 0
              ? existingItems
              : [createEmptyItem()],

          subtotal:
            Number(order.subtotal) || 0,

          summaryDiscount:
            Number(
              order.summaryDiscount
            ) || 0,

          summaryTax:
            Number(order.summaryTax) || 0,

          adjustment:
            Number(order.adjustment) || 0,

          grandTotal:
            Number(order.grandTotal) || 0,

          paymentTerms:
            order.paymentTerms ||
            "Immediate",

          paymentMethod:
            order.paymentMethod ||
            "Bank Transfer",

          advancePayment:
            Number(
              order.advancePayment
            ) || 0,

          paymentStatus:
            order.paymentStatus ||
            "Unpaid",

          provisioningStatus:
            order.provisioningStatus ||
            "Pending",

          provisionedAt:
            order.provisionedAt || "",

          internalNotes:
            order.internalNotes ||
            order.notes?.internal ||
            "",

          customerNotes:
            order.customerNotes ||
            order.notes?.customer ||
            "",

          requiresApproval:
            Boolean(
              order.requiresApproval
            ),

          approver:
            order.approver || "",

          approvalStatus:
            order.approvalStatus ||
            "N/A",
        });
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to load order details."
        );
      }
    };

    if (
      customers.length > 0 ||
      accountsData
    ) {
      fetchOrder();
    }
  }, [
    orderId,
    auth.slug,
    reset,
    customers,
    accountsData,
  ]);

  /* ==========================================================
     Customer Change
     ========================================================== */

  const handleCustomerChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const customerId =
      event.target.value;

    setValue(
      "customerId",
      customerId,
      {
        shouldValidate: true,
      }
    );

    const customer =
      customers.find(
        (item) =>
          item.id === customerId
      );

    if (!customer) return;

    setValue(
      "customerName",
      customer.name
    );

    setValue(
      "contactPerson",
      customer.contact
    );

    setValue(
      "phone",
      customer.phone
    );

    setValue(
      "email",
      customer.email
    );

    setValue(
      "billingAddress",
      customer.billing
    );
  };

  /* ==========================================================
     Product Change
     ========================================================== */

  const handleProductChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const productId =
      event.target.value;

    const product =
      productsData.find(
        (item) =>
          (item._id || item.id) ===
          productId
      );

    setValue(
      `items.${index}.productId`,
      productId,
      {
        shouldValidate: true,
      }
    );

    if (!product) {
      return;
    }

    const firstPlan =
      product.plans?.[0];

    const defaultPrice =
      firstPlan?.price ??
      product.sellingPrice ??
      0;

    const defaultBilling =
      firstPlan?.billingCycle;

    setValue(
      `items.${index}.productName`,
      product.productName
    );

    setValue(
      `items.${index}.productCode`,
      product.productCode
    );

    setValue(
      `items.${index}.sku`,
      product.sku || ""
    );

    setValue(
      `items.${index}.productType`,
      product.productType
    );

    setValue(
      `items.${index}.planId`,
      firstPlan?._id ||
        firstPlan?.id ||
        ""
    );

    setValue(
      `items.${index}.planName`,
      firstPlan?.name || ""
    );

    setValue(
      `items.${index}.billingCycle`,
      defaultBilling
    );

    setValue(
      `items.${index}.licenseType`,
      product.licenseType
    );

    setValue(
      `items.${index}.activationType`,
      product.activationType
    );

    setValue(
      `items.${index}.validityDays`,
      product.validityDays || 0
    );

    setValue(
      `items.${index}.maxUsers`,
      product.maxUsers || 0
    );

    setValue(
      `items.${index}.maxDevices`,
      product.maxDevices || 0
    );

    setValue(
      `items.${index}.platformSupport`,
      product.platformSupport || []
    );

    setValue(
      `items.${index}.unitPrice`,
      defaultPrice
    );

    setValue(
      `items.${index}.taxPct`,
      product.tax || 0
    );

    setValue(
      `items.${index}.discountPct`,
      product.discount || 0
    );

    setValue(
      `items.${index}.quantity`,
      1
    );
  };

  /* ==========================================================
     Plan Change
     ========================================================== */

  const handlePlanChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const planId =
      event.target.value;

    const item =
      watchedItems[index];

    const product =
      productsData.find(
        (product) =>
          (product._id ||
            product.id) ===
          item.productId
      );

    const plan =
      product?.plans?.find(
        (currentPlan) =>
          (currentPlan._id ||
            currentPlan.id) ===
          planId
      );

    setValue(
      `items.${index}.planId`,
      planId
    );

    if (!plan) return;

    setValue(
      `items.${index}.planName`,
      plan.name
    );

    setValue(
      `items.${index}.billingCycle`,
      plan.billingCycle
    );

    setValue(
      `items.${index}.unitPrice`,
      Number(plan.price) || 0
    );
  };

  /* ==========================================================
     File Handling
     ========================================================== */

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    setAttachments((current) => [
      ...current,
      ...Array.from(event.target.files),
    ]);
  };

  /* ==========================================================
     Submit
     ========================================================== */

  const onSubmit = async (
    data: OrderFormValues
  ) => {
    setIsSubmitting(true);

    try {
      const customer =
        customers.find(
          (item) =>
            item.id === data.customerId
        );

      const payload = {
        ...data,

        customerName:
          customer?.name ||
          data.customerName ||
          "Unknown Customer",

        items: calculatedItems.map(
          (item) => ({
            productId: item.productId,

            productName:
              item.productName,

            productCode:
              item.productCode,

            sku: item.sku,

            productType:
              item.productType,

            planId:
              item.planId || undefined,

            planName:
              item.planName || undefined,

            billingCycle:
              item.billingCycle,

            licenseType:
              item.licenseType,

            activationType:
              item.activationType,

            validityDays:
              item.validityDays,

            maxUsers:
              item.maxUsers,

            maxDevices:
              item.maxDevices,

            platformSupport:
              item.platformSupport,

            unitPrice:
              item.unitPrice,

            quantity:
              item.quantity,

            discountPct:
              item.discountPct,

            taxPct:
              item.taxPct,

            lineSubtotal:
              item.lineSubtotal,

            lineDiscount:
              item.lineDiscount,

            lineTax:
              item.lineTax,

            lineTotal:
              item.lineTotal,
          })
        ),

        subtotal:
          calculatedSubtotal,

        grandTotal:
          grandTotal,

        paymentStatus:
          data.advancePayment >=
          grandTotal &&
          grandTotal > 0
            ? "Paid"
            : data.advancePayment > 0
            ? "Partially Paid"
            : "Unpaid",
      };

      if (orderId) {
        await updateOrder(
          orderId,
          payload as any,
          auth.slug ||
            "default-tenant"
        );

        setSuccessMessage(
          "Software order updated successfully!"
        );
      } else {
        await createOrder(
          auth.slug ||
            "default-tenant",
          payload as any
        );

        setSuccessMessage(
          "Software order created successfully!"
        );
      }

      setSuccessModalOpen(true);
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        `Failed to ${
          orderId ? "update" : "create"
        } software order.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ==========================================================
     Render
     ========================================================== */

  return (
    <div className="min-h-screen bg-base-200 p-4 font-sans md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            {orderId
              ? "Edit Software Order"
              : "Create Software Order"}
          </h1>

          <div className="breadcrumbs mt-1 text-sm text-base-content/60">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Orders</li>
              <li className="font-semibold text-primary">
                {orderId
                  ? "Edit Order"
                  : "Create Order"}
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2"
            onClick={() =>
              reset({
                ...watch(),
                status: "Draft",
              })
            }
          >
            <MdSave size={16} />
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-4"
      >
        {/* Main */}
        <div className="space-y-4 lg:col-span-3">
          {/* ==================================================
              1. Order Information
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              1. Order Information
            </div>

            <div className="collapse-content space-y-4 pt-5">
              <FormRow label="Order Number">
                <input
                  {...register(
                    "orderNumber"
                  )}
                  className="input input-bordered w-full bg-base-200 font-mono font-bold text-primary"
                  readOnly
                />
              </FormRow>

              <FormRow
                label="Sales Owner"
                required
                error={
                  errors.salesOwner?.message
                }
              >
                <div className="dropdown w-full">
                  <label
                    tabIndex={0}
                    className={`btn btn-outline w-full justify-start bg-base-100 font-normal ${
                      errors.salesOwner
                        ? "border-error"
                        : "border-base-300"
                    }`}
                  >
                    {watchedSalesOwner ||
                      "-Select Owner-"}
                  </label>

                  <div
                    tabIndex={0}
                    className="dropdown-content z-10 w-full rounded-box border border-base-300 bg-base-100 p-2 shadow"
                  >
                    <input
                      type="text"
                      placeholder="Search sales owner..."
                      className="input input-bordered input-sm mb-2 w-full"
                      value={ownerSearch}
                      onChange={(event) =>
                        setOwnerSearch(
                          event.target.value
                        )
                      }
                    />

                    <ul className="max-h-60 overflow-y-auto">
                      {filteredOwners.map(
                        (rep: string) => (
                          <li key={rep}>
                            <a
                              onClick={() => {
                                setValue(
                                  "salesOwner",
                                  rep,
                                  {
                                    shouldValidate:
                                      true,
                                  }
                                );

                                (
                                  document.activeElement as HTMLElement
                                )?.blur();
                              }}
                            >
                              {rep}
                            </a>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </FormRow>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormRow
                  label="Order Date"
                  required
                  error={
                    errors.orderDate?.message
                  }
                >
                  <input
                    type="date"
                    {...register(
                      "orderDate"
                    )}
                    className="input input-bordered w-full"
                  />
                </FormRow>

                <FormRow label="Order Status">
                  <select
                    {...register("status")}
                    className="select select-bordered w-full"
                  >
                    <option value="Draft">
                      Draft
                    </option>
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Pending Approval">
                      Pending Approval
                    </option>
                    <option value="Approved">
                      Approved
                    </option>
                    <option value="Processing">
                      Processing
                    </option>
                    <option value="Awaiting Payment">
                      Awaiting Payment
                    </option>
                    <option value="Completed">
                      Completed
                    </option>
                    <option value="Cancelled">
                      Cancelled
                    </option>
                    <option value="On Hold">
                      On Hold
                    </option>
                  </select>
                </FormRow>
              </div>

              <FormRow label="Priority">
                <select
                  {...register("priority")}
                  className="select select-bordered w-full"
                >
                  <option value="Low">
                    Low
                  </option>
                  <option value="Medium">
                    Medium
                  </option>
                  <option value="High">
                    High
                  </option>
                  <option value="Urgent">
                    Urgent
                  </option>
                </select>
              </FormRow>
            </div>
          </div>

          {/* ==================================================
              2. Customer
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              2. Customer Information
            </div>

            <div className="collapse-content space-y-4 pt-5">
              <FormRow
                label="Customer Account"
                required
                error={
                  errors.customerId?.message
                }
              >
                <div className="flex gap-2">
                  <select
                    className={`select select-bordered w-full ${
                      errors.customerId
                        ? "select-error"
                        : ""
                    }`}
                    onChange={
                      handleCustomerChange
                    }
                    value={watchedCustomer}
                  >
                    <option value="">
                      -Select Customer-
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={customer.id}
                          value={
                            customer.id
                          }
                        >
                          {customer.name}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      (
                        document.getElementById(
                          "add_customer_modal"
                        ) as HTMLDialogElement
                      )?.showModal()
                    }
                    className="btn btn-outline btn-square"
                  >
                    <MdAdd size={18} />
                  </button>
                </div>
              </FormRow>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">
                    Contact Person
                  </label>

                  <input
                    {...register(
                      "contactPerson"
                    )}
                    className="input input-bordered bg-base-200"
                    readOnly
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">
                    Phone
                  </label>

                  <input
                    {...register("phone")}
                    className="input input-bordered bg-base-200"
                    readOnly
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">
                    Email
                  </label>

                  <input
                    {...register("email")}
                    className="input input-bordered bg-base-200"
                    readOnly
                  />
                </div>
              </div>

              <FormRow
                label="Billing Address"
                required
                error={
                  errors.billingAddress
                    ?.message
                }
              >
                <textarea
                  {...register(
                    "billingAddress"
                  )}
                  className="textarea textarea-bordered w-full"
                  rows={3}
                />
              </FormRow>
            </div>
          </div>

          {/* ==================================================
              3. Software Items
              ================================================== */}

          <div className="collapse-arrow collapse overflow-visible rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              3. Software Products
            </div>

            <div className="collapse-content pt-5">
              {errors.items?.root && (
                <div className="alert alert-error mb-4 py-2 text-sm">
                  {errors.items.root.message}
                </div>
              )}

              <div className="space-y-4">
                {fields.map(
                  (field, index) => {
                    const item =
                      watchedItems[index];

                    const product =
                      productsData.find(
                        (currentProduct) =>
                          (currentProduct._id ||
                            currentProduct.id) ===
                          item.productId
                      );

                    const plans =
                      product?.plans || [];

                    const calculated =
                      calculatedItems[
                        index
                      ];

                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-base-300 bg-base-100 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                              {index + 1}
                            </span>

                            <div>
                              <h3 className="font-semibold">
                                {item.productName ||
                                  "Select Software Product"}
                              </h3>

                              <p className="text-xs text-base-content/60">
                                {item.productCode ||
                                  "No product selected"}
                              </p>
                            </div>
                          </div>

                          <div className="join">
                            <button
                              type="button"
                              onClick={() =>
                                append({
                                  ...item,
                                })
                              }
                              className="btn btn-ghost btn-sm join-item"
                              title="Duplicate"
                            >
                              <MdContentCopy />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                remove(index)
                              }
                              className="btn btn-ghost btn-sm join-item text-error"
                              disabled={
                                fields.length ===
                                1
                              }
                              title="Delete"
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormRow
                            label="Software Product"
                            required
                            error={
                              errors.items?.[
                                index
                              ]?.productId
                                ?.message
                            }
                          >
                            <select
                              className={`select select-bordered w-full ${
                                errors.items?.[
                                  index
                                ]?.productId
                                  ? "select-error"
                                  : ""
                              }`}
                              value={
                                item.productId
                              }
                              onChange={(
                                event
                              ) =>
                                handleProductChange(
                                  index,
                                  event
                                )
                              }
                            >
                              <option value="">
                                -Select Software-
                              </option>

                              {productsData
                                .filter(
                                  (product) =>
                                    product.status ===
                                    "Active"
                                )
                                .map(
                                  (
                                    currentProduct
                                  ) => (
                                    <option
                                      key={
                                        currentProduct._id ||
                                        currentProduct.id
                                      }
                                      value={
                                        currentProduct._id ||
                                        currentProduct.id
                                      }
                                    >
                                      {
                                        currentProduct.productName
                                      }{" "}
                                      —{" "}
                                      {
                                        currentProduct.productCode
                                      }
                                    </option>
                                  )
                                )}
                            </select>
                          </FormRow>

                          <FormRow label="Product Type">
                            <input
                              value={
                                item.productType ||
                                ""
                              }
                              className="input input-bordered w-full bg-base-200"
                              readOnly
                            />
                          </FormRow>

                          <FormRow label="Plan">
                            <select
                              className="select select-bordered w-full"
                              value={
                                item.planId ||
                                ""
                              }
                              onChange={(
                                event
                              ) =>
                                handlePlanChange(
                                  index,
                                  event
                                )
                              }
                              disabled={
                                plans.length ===
                                0
                              }
                            >
                              <option value="">
                                {plans.length
                                  ? "-Select Plan-"
                                  : "No plans configured"}
                              </option>

                              {plans.map(
                                (plan) => (
                                  <option
                                    key={
                                      plan._id ||
                                      plan.id
                                    }
                                    value={
                                      plan._id ||
                                      plan.id
                                    }
                                  >
                                    {
                                      plan.name
                                    }{" "}
                                    — ₹
                                    {Number(
                                      plan.price
                                    ).toLocaleString()}{" "}
                                    /{" "}
                                    {
                                      plan.billingCycle
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </FormRow>

                          <FormRow label="Billing Cycle">
                            <input
                              value={
                                item.billingCycle ||
                                "—"
                              }
                              className="input input-bordered w-full bg-base-200"
                              readOnly
                            />
                          </FormRow>

                          <FormRow label="License Type">
                            <input
                              value={
                                item.licenseType ||
                                "—"
                              }
                              className="input input-bordered w-full bg-base-200"
                              readOnly
                            />
                          </FormRow>

                          <FormRow label="Activation Type">
                            <input
                              value={
                                item.activationType ||
                                "—"
                              }
                              className="input input-bordered w-full bg-base-200"
                              readOnly
                            />
                          </FormRow>

                          <FormRow label="Unit Price">
                            <input
                              type="number"
                              step="0.01"
                              {...register(
                                `items.${index}.unitPrice`
                              )}
                              className="input input-bordered w-full"
                            />
                          </FormRow>

                          <FormRow label="Quantity">
                            <input
                              type="number"
                              min="1"
                              {...register(
                                `items.${index}.quantity`
                              )}
                              className="input input-bordered w-full"
                            />
                          </FormRow>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                          <div className="rounded-lg border border-base-300 bg-base-200/50 p-3">
                            <p className="text-xs font-semibold uppercase text-base-content/50">
                              Validity
                            </p>

                            <p className="mt-1 font-semibold">
                              {item.validityDays
                                ? `${item.validityDays} days`
                                : "Lifetime / N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg border border-base-300 bg-base-200/50 p-3">
                            <p className="text-xs font-semibold uppercase text-base-content/50">
                              Max Users
                            </p>

                            <p className="mt-1 font-semibold">
                              {item.maxUsers ||
                                "Unlimited / N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg border border-base-300 bg-base-200/50 p-3">
                            <p className="text-xs font-semibold uppercase text-base-content/50">
                              Max Devices
                            </p>

                            <p className="mt-1 font-semibold">
                              {item.maxDevices ||
                                "Unlimited / N/A"}
                            </p>
                          </div>

                          <div className="rounded-lg border border-base-300 bg-base-200/50 p-3">
                            <p className="text-xs font-semibold uppercase text-base-content/50">
                              Platforms
                            </p>

                            <p className="mt-1 font-semibold">
                              {item.platformSupport
                                ?.join(", ") ||
                                "—"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormRow label="Discount %">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...register(
                                `items.${index}.discountPct`
                              )}
                              className="input input-bordered w-full"
                            />
                          </FormRow>

                          <FormRow label="Tax %">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...register(
                                `items.${index}.taxPct`
                              )}
                              className="input input-bordered w-full"
                            />
                          </FormRow>

                          <div className="flex items-center justify-end">
                            <div className="text-right">
                              <p className="text-xs font-semibold uppercase text-base-content/50">
                                Line Total
                              </p>

                              <p className="mt-1 text-xl font-bold text-success">
                                ₹
                                {(
                                  calculated?.lineTotal ||
                                  0
                                ).toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  append(
                    createEmptyItem()
                  )
                }
                className="btn btn-outline btn-primary btn-sm mt-4 gap-2"
              >
                <MdAdd />
                Add Software
              </button>
            </div>
          </div>

          {/* ==================================================
              4. Order Summary
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              4. Order Summary
            </div>

            <div className="collapse-content pt-5">
              <div className="flex flex-col justify-between gap-8 md:flex-row">
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-base-200 bg-base-200/50 p-4 text-center">
                  <MdCalculate
                    size={32}
                    className="mb-2 text-primary/40"
                  />

                  <p className="text-sm font-semibold text-base-content/70">
                    Amount In Words
                  </p>

                  <p className="mt-1 text-sm font-medium uppercase leading-relaxed text-primary">
                    {amountInWords}
                  </p>
                </div>

                <div className="flex-1 space-y-3 md:max-w-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      ₹
                      {calculatedSubtotal.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Item Discounts
                    </span>

                    <span className="font-semibold text-error">
                      - ₹
                      {calculatedLineDiscount.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Item Tax
                    </span>

                    <span className="font-semibold">
                      ₹
                      {calculatedLineTax.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Overall Discount
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      {...register(
                        "summaryDiscount"
                      )}
                      className="input input-bordered input-sm w-32 text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Overall Tax
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      {...register(
                        "summaryTax"
                      )}
                      className="input input-bordered input-sm w-32 text-right"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-base-content/70">
                      Adjustment
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      {...register(
                        "adjustment"
                      )}
                      className="input input-bordered input-sm w-32 text-right"
                    />
                  </div>

                  <div className="divider my-1" />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      Grand Total
                    </span>

                    <span className="text-2xl font-bold text-success">
                      ₹
                      {grandTotal.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              5. Payment
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              5. Payment Information
            </div>

            <div className="collapse-content space-y-4 pt-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormRow label="Payment Terms">
                  <select
                    {...register(
                      "paymentTerms"
                    )}
                    className="select select-bordered w-full"
                  >
                    <option value="Immediate">
                      Immediate
                    </option>
                    <option value="Net 15">
                      Net 15
                    </option>
                    <option value="Net 30">
                      Net 30
                    </option>
                    <option value="Net 45">
                      Net 45
                    </option>
                  </select>
                </FormRow>

                <FormRow label="Payment Method">
                  <select
                    {...register(
                      "paymentMethod"
                    )}
                    className="select select-bordered w-full"
                  >
                    <option value="Cash">
                      Cash
                    </option>
                    <option value="Card">
                      Card
                    </option>
                    <option value="UPI">
                      UPI
                    </option>
                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>
                    <option value="Payment Gateway">
                      Payment Gateway
                    </option>
                    <option value="Other">
                      Other
                    </option>
                  </select>
                </FormRow>

                <FormRow
                  label="Advance Payment"
                  error={
                    errors.advancePayment
                      ?.message
                  }
                >
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-base-content/50">
                      ₹
                    </span>

                    <input
                      type="number"
                      step="0.01"
                      {...register(
                        "advancePayment"
                      )}
                      className={`input input-bordered w-full pl-8 ${
                        errors.advancePayment
                          ? "input-error"
                          : ""
                      }`}
                    />
                  </div>
                </FormRow>

                <FormRow label="Payment Status">
                  <select
                    {...register(
                      "paymentStatus"
                    )}
                    className="select select-bordered w-full"
                  >
                    <option value="Unpaid">
                      Unpaid
                    </option>
                    <option value="Partially Paid">
                      Partially Paid
                    </option>
                    <option value="Paid">
                      Paid
                    </option>
                    <option value="Refunded">
                      Refunded
                    </option>
                    <option value="Partially Refunded">
                      Partially Refunded
                    </option>
                  </select>
                </FormRow>

                <FormRow label="Outstanding Amount">
                  <input
                    value={`₹ ${outstanding.toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                      }
                    )}`}
                    className="input input-bordered w-full bg-base-200 font-bold text-error"
                    readOnly
                  />
                </FormRow>
              </div>
            </div>
          </div>

          {/* ==================================================
              6. Software Delivery / Provisioning
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              6. Software Delivery & Provisioning
            </div>

            <div className="collapse-content space-y-4 pt-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormRow label="Delivery Type">
                  <select
                    {...register(
                      "deliveryType"
                    )}
                    className="select select-bordered w-full"
                  >
                    <option value="Instant Download">
                      Instant Download
                    </option>
                    <option value="Email">
                      Email
                    </option>
                    <option value="License Key">
                      License Key
                    </option>
                    <option value="Domain Activation">
                      Domain Activation
                    </option>
                    <option value="Manual Activation">
                      Manual Activation
                    </option>
                    <option value="Account Provisioning">
                      Account Provisioning
                    </option>
                  </select>
                </FormRow>

                <FormRow label="Provisioning Status">
                  <select
                    {...register(
                      "provisioningStatus"
                    )}
                    className="select select-bordered w-full"
                  >
                    <option value="Pending">
                      Pending
                    </option>
                    <option value="Processing">
                      Processing
                    </option>
                    <option value="Provisioned">
                      Provisioned
                    </option>
                    <option value="Failed">
                      Failed
                    </option>
                  </select>
                </FormRow>

                {watchedDeliveryType ===
                  "Email" && (
                  <FormRow
                    label="Delivery Email"
                    error={
                      errors.deliveryEmail
                        ?.message
                    }
                  >
                    <input
                      type="email"
                      {...register(
                        "deliveryEmail"
                      )}
                      className="input input-bordered w-full"
                      placeholder="customer@example.com"
                    />
                  </FormRow>
                )}

                {watchedDeliveryType ===
                  "Domain Activation" && (
                  <FormRow
                    label="Activation Domain"
                    error={
                      errors.activationDomain
                        ?.message
                    }
                  >
                    <input
                      {...register(
                        "activationDomain"
                      )}
                      className="input input-bordered w-full"
                      placeholder="customercompany.com"
                    />
                  </FormRow>
                )}
              </div>

              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold">
                  Software Provisioning
                </p>

                <p className="mt-1 text-sm text-base-content/60">
                  After payment confirmation,
                  the order can be provisioned
                  using the selected license,
                  activation method, plan,
                  users, devices and platform
                  limits captured above.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              7. Notes & Attachments
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              7. Notes & Attachments
            </div>

            <div className="collapse-content pt-5">
              <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="label font-medium">
                    Internal Notes
                  </label>

                  <textarea
                    {...register(
                      "internalNotes"
                    )}
                    className="textarea textarea-bordered w-full border-warning/30 bg-warning/5"
                    rows={3}
                    placeholder="Visible only to staff..."
                  />
                </div>

                <div>
                  <label className="label font-medium">
                    Customer Notes
                  </label>

                  <textarea
                    {...register(
                      "customerNotes"
                    )}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Visible to customer..."
                  />
                </div>
              </div>

              <div className="rounded-xl border-2 border-dashed border-base-300 p-6 text-center transition-colors hover:bg-base-200/50">
                <MdAttachment
                  className="mx-auto mb-2 text-base-content/40"
                  size={32}
                />

                <p className="text-sm font-medium">
                  Drag & Drop files or click
                  to upload
                </p>

                <p className="mt-1 text-xs text-base-content/50">
                  PDF, DOCX, XLSX, JPG, PNG
                </p>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={
                    handleFileChange
                  }
                  accept=".pdf,.docx,.xlsx,.jpg,.png"
                />

                <label
                  htmlFor="file-upload"
                  className="btn btn-outline btn-sm mt-4 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>

              {attachments.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {attachments.map(
                    (file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-md border border-base-300 bg-base-200 px-4 py-2"
                      >
                        <span className="truncate text-sm font-medium">
                          {file.name}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setAttachments(
                              (
                                current
                              ) =>
                                current.filter(
                                  (
                                    _,
                                    fileIndex
                                  ) =>
                                    fileIndex !==
                                    index
                                )
                            )
                          }
                          className="text-error"
                        >
                          <MdDelete
                            size={18}
                          />
                        </button>
                      </li>
                    )
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* ==================================================
              8. Approval Workflow
              ================================================== */}

          <div className="collapse-arrow collapse rounded-xl border border-base-300 bg-base-100">
            <input
              type="checkbox"
              defaultChecked
            />

            <div className="collapse-title border-b border-base-200 text-lg font-semibold">
              8. Approval Workflow
            </div>

            <div className="collapse-content space-y-4 pt-5">
              <FormRow label="Requires Approval">
                <input
                  type="checkbox"
                  {...register(
                    "requiresApproval"
                  )}
                  className="toggle toggle-primary"
                />
              </FormRow>

              {watchedRequiresApproval && (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormRow label="Approver">
                    <select
                      {...register(
                        "approver"
                      )}
                      className="select select-bordered w-full"
                    >
                      <option value="">
                        -Select Approver-
                      </option>
                      <option value="Manager A">
                        Manager A
                      </option>
                      <option value="Director B">
                        Director B
                      </option>
                    </select>
                  </FormRow>

                  <FormRow label="Approval Status">
                    <select
                      {...register(
                        "approvalStatus"
                      )}
                      className="select select-bordered w-full"
                    >
                      <option value="Pending">
                        Pending
                      </option>
                      <option value="Approved">
                        Approved
                      </option>
                      <option value="Rejected">
                        Rejected
                      </option>
                      <option value="N/A">
                        N/A
                      </option>
                    </select>
                  </FormRow>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            Sidebar
            ==================================================== */}

        <div className="space-y-4 lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <h3 className="mb-4 border-b border-base-200 pb-2 text-lg font-bold">
              Order Summary
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  Order Number
                </span>

                <p className="mt-1 font-mono text-sm font-bold text-primary">
                  {watch("orderNumber")}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  Customer
                </span>

                <p className="mt-1 truncate font-medium">
                  {watchedCustomer
                    ? customers.find(
                        (customer) =>
                          customer.id ===
                          watchedCustomer
                      )?.name
                    : "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-base-content/60">
                    Products
                  </span>

                  <p className="mt-1 font-medium">
                    {fields.length}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase text-base-content/60">
                    Licenses
                  </span>

                  <p className="mt-1 font-medium">
                    {watchedItems.reduce(
                      (sum, item) =>
                        sum +
                        (Number(
                          item.quantity
                        ) || 0),
                      0
                    )}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  Provisioning
                </span>

                <p className="mt-1 font-medium">
                  {watch(
                    "provisioningStatus"
                  )}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  Grand Total
                </span>

                <p className="mt-1 text-2xl font-bold text-success">
                  ₹
                  {grandTotal.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase text-base-content/60">
                  Order Status
                </span>

                <div className="mt-1">
                  <span className="badge badge-primary">
                    {watch("status")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-base-200 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    <MdSend size={18} />
                    {orderId
                      ? "Update Order"
                      : "Create Order"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ======================================================
          Quick Add Customer
          ====================================================== */}

      <dialog
        id="add_customer_modal"
        className="modal"
      >
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Quick Add Customer
          </h3>

          <input
            type="text"
            className="input input-bordered mt-4 w-full"
            placeholder="Company Name"
          />

          <input
            type="text"
            className="input input-bordered mt-2 w-full"
            placeholder="Contact Person"
          />

          <div className="modal-action">
            <form
              method="dialog"
              className="flex gap-2"
            >
              <button className="btn btn-ghost">
                Cancel
              </button>

              <button className="btn btn-primary">
                Save Customer
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {/* ======================================================
          Success Modal
          ====================================================== */}

      <dialog
        className={`modal ${
          successModalOpen
            ? "modal-open"
            : ""
        }`}
      >
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="mb-4 h-16 w-16 text-success" />

          <h3 className="mb-2 text-center text-xl font-bold">
            Success!
          </h3>

          <p className="text-center text-base-content/80">
            {successMessage}
          </p>

          <div className="modal-action mt-6 w-full justify-center">
            <button
              className="btn btn-primary px-8"
              onClick={() => {
                setSuccessModalOpen(false);
                navigate(
                  "/sales/orders"
                );
              }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
