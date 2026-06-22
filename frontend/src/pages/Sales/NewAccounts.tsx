import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { MdSave, MdBusiness, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { createAccount } from "@/services/salesService";
import { useAuth } from "@/auth/AuthContext";
import { getSalesEmployees } from "@/services/memberService";

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Singapore", "UAE", "Other"
];

/* ─────────────────────────── Zod Schema ─────────────────────────── */
const accountSchema = z.object({
  // Ownership & Organization
  accountOwner: z.string().min(1, "Account Owner is required"),
  parentAccount: z.string().optional(),
  accountName: z.string().min(1, "Account Name is required"),
  accountType: z.enum(["Individual", "Business", "Enterprise", "Distributor", "Retailer", "Partner"]).default("Business"),
  industry: z.string().optional(),
  website: z.string().url("Valid URL required").or(z.literal("")).optional(),
  annualRevenue: z.coerce.number().min(0).optional(),
  employeeCount: z.coerce.number().min(0).optional(),
  
  // Primary Contact
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Valid email is required"),
  phoneCountry: z.string().default("+1"),
  phoneNumber: z.string().min(5, "Valid phone number is required"),
  designation: z.string().optional(),

  // Billing Address
  billingAddress1: z.string().min(1, "Address is required"),
  billingAddress2: z.string().optional(),
  billingCity: z.string().min(1, "City is required"),
  billingState: z.string().min(1, "State is required"),
  billingPostal: z.string().min(1, "Postal code is required"),
  billingCountry: z.string().min(1, "Country is required"),
  billingCountryOther: z.string().optional(),
shippingCountryOther: z.string().optional(),

  // Shipping Address
  sameAsBilling: z.boolean().default(true),
  shippingAddress1: z.string().optional(),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostal: z.string().optional(),
  shippingCountry: z.string().optional(),

  // Financial / Tax
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  paymentTerms: z.string().default("Net 30"),

  // Internal Notes
  description: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

/* ── Shared Component: Form Row ── */
const FormRow = ({ label, required, error, children }: { label: string, required?: boolean, error?: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
    <label className="text-sm font-medium text-base-content/80 pt-2.5">
      {label} {required && <span className="text-error ml-0.5">*</span>}
    </label>
    <div className="w-full">
      {children}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  </div>
);

/* ─────────────────────────── Component ─────────────────────────── */
export default function NewAccountForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [owners, setOwners] = useState([]);
 
   
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: "Business",
      phoneCountry: "+1",
      sameAsBilling: true,
      paymentTerms: "Net 30",
      billingCountry: "United States"
    }
  });

  // Live Watches
  const wAccountName = watch("accountName");
  const wType = watch("accountType");
  const wIndustry = watch("industry");
  const wOwner = watch("accountOwner");
  const wSameAsBilling = watch("sameAsBilling");
 const {auth}=useAuth();
  const slug=auth?.slug;
  if (!slug) {
    return null;
  }
 
   useEffect(() => {
     const fetchOwners = async () => {
       try {
         const res = await getSalesEmployees(slug);
         setOwners(res.data.data);
       } catch (err) {
         console.log(err);
       }
     };
 
     fetchOwners();
   }, []);
   console.log(owners)
  const onSubmit = async (data: AccountFormValues) => {
  setIsSubmitting(true);
const payload = {
  accountOwner: data.accountOwner,
  accountName: data.accountName,
  accountType: data.accountType,
  industry: data.industry,
  website: data.website,
  annualRevenue: data.annualRevenue,

  primaryContact: {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    designation: data.designation,
    phone: {
      countryCode: data.phoneCountry,
      number: data.phoneNumber,
    },
  },

  billingAddress: {
    addressLine1: data.billingAddress1,
    addressLine2: data.billingAddress2,
    city: data.billingCity,
    state: data.billingState,
    postalCode: data.billingPostal,
    country: data.billingCountry,
    countryOther: data.billingCountryOther,
  },

  shippingAddress: {
    sameAsBilling: data.sameAsBilling,
    addressLine1: data.shippingAddress1,
    addressLine2: data.shippingAddress2,
    city: data.shippingCity,
    state: data.shippingState,
    postalCode: data.shippingPostal,
    country: data.shippingCountry,
    countryOther: data.shippingCountryOther,
  },

  gstNumber: data.gstNumber,
  panNumber: data.panNumber,
  paymentTerms: data.paymentTerms,
  description: data.description,
};
  try {
   

    const response = await createAccount(slug, payload);
    
    console.log("Account Created:", response.data);

    toast.success("Account created successfully!");
    navigate("/sales/accounts");
  } catch (error: any) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      "Failed to create account."
    );
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Create New Account</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Accounts</li>
              <li className="text-primary">Create Account</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline btn-sm gap-2 bg-base-100" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Account Details */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              1. Organization Details
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Account Owner" required error={errors.accountOwner?.message}>
                <select {...register("accountOwner")} className={`select select-bordered w-full ${errors.accountOwner ? "select-error" : ""}`}>
                  <option value="">-Select Owner-</option>
                  {owners.map((o: any) => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              </FormRow>
              
              <FormRow label="Account Name" required error={errors.accountName?.message}>
                <input {...register("accountName")} className={`input input-bordered w-full ${errors.accountName ? 'input-error' : ''}`} placeholder="Company Inc." />
              </FormRow>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Account Type">
                  <select {...register("accountType")} className="select select-bordered w-full">
                    <option value="Individual">Individual</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Distributor">Distributor</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Partner">Partner</option>
                  </select>
                </FormRow>
                <FormRow label="Industry">
                  <select {...register("industry")} className="select select-bordered w-full">
                    <option value="">-Select Industry-</option>
                    <option>Technology</option><option>Manufacturing</option><option>Retail</option><option>Defense</option>
                  </select>
                </FormRow>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Website" error={errors.website?.message}>
                  <input type="url" {...register("website")} className="input input-bordered w-full" placeholder="https://www.company.com" />
                </FormRow>
                <FormRow label="Annual Revenue">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                    <input type="number" {...register("annualRevenue")} className="input input-bordered w-full pl-8" placeholder="0.00" />
                  </div>
                </FormRow>
              </div>
            </div>
          </div>

          {/* 2. Primary Contact */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              2. Primary Contact Person
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
                <label className="text-sm font-medium text-base-content/80 pt-2.5">Name <span className="text-error">*</span></label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input {...register("firstName")} className={`input input-bordered w-full ${errors.firstName ? 'input-error' : ''}`} placeholder="First Name" />
                    {errors.firstName && <p className="text-xs text-error mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="flex-1">
                    <input {...register("lastName")} className={`input input-bordered w-full ${errors.lastName ? 'input-error' : ''}`} placeholder="Last Name" />
                    {errors.lastName && <p className="text-xs text-error mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Email Address" required error={errors.email?.message}>
                  <input type="email" {...register("email")} className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} placeholder="contact@company.com" />
                </FormRow>
                <FormRow label="Designation">
                  <input type="text" {...register("designation")} className="input input-bordered w-full" placeholder="CEO, Manager, etc." />
                </FormRow>
              </div>

              <FormRow label="Phone Number" required error={errors.phoneNumber?.message}>
                <div className={`flex border rounded-lg overflow-hidden ${errors.phoneNumber ? 'border-error' : 'border-base-300'} focus-within:border-primary transition-colors bg-base-100`}>
                  <select {...register("phoneCountry")} className="select select-sm select-ghost w-24 rounded-none border-r border-base-300 focus:bg-transparent">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+44">🇬🇧 +44</option>
                  </select>
                  <input type="tel" {...register("phoneNumber")} className="input input-sm border-none w-full focus:outline-none" placeholder="12345 67890" />
                </div>
              </FormRow>
            </div>
          </div>

          {/* 3. Address Details */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              3. Address Information
            </div>
            <div className="collapse-content pt-5 space-y-6">
              
              {/* Billing Address */}
              <div className="space-y-4">
                <h4 className="font-semibold text-primary uppercase text-xs tracking-wider border-b border-base-200 pb-1 mb-2">Billing Address</h4>
                <FormRow label="Address Line 1" required error={errors.billingAddress1?.message}><input {...register("billingAddress1")} className={`input input-bordered w-full ${errors.billingAddress1 ? 'input-error' : ''}`} placeholder="Street address" /></FormRow>
                <FormRow label="Address Line 2"><input {...register("billingAddress2")} className="input input-bordered w-full" placeholder="Apt, Suite, etc." /></FormRow>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormRow label="City" required error={errors.billingCity?.message}><input {...register("billingCity")} className={`input input-bordered w-full ${errors.billingCity ? 'input-error' : ''}`} /></FormRow>
                  <FormRow label="State" required error={errors.billingState?.message}><input {...register("billingState")} className={`input input-bordered w-full ${errors.billingState ? 'input-error' : ''}`} /></FormRow>
                  <FormRow label="Postal Code" required error={errors.billingPostal?.message}><input {...register("billingPostal")} className={`input input-bordered w-full ${errors.billingPostal ? 'input-error' : ''}`} /></FormRow>
                  <FormRow label="Country" required error={errors.billingCountry?.message}>
                    <select {...register("billingCountry")} className={`select select-bordered w-full ${errors.billingCountry ? 'select-error' : ''}`}>
                      <option value="">-Select-</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </FormRow>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4 pt-4 border-t border-base-200">
                <div className="flex justify-between items-center mb-2 border-b border-base-200 pb-1">
                  <h4 className="font-semibold text-primary uppercase text-xs tracking-wider">Shipping Address</h4>
                  <label className="cursor-pointer label p-0 gap-2">
                    <span className="label-text font-medium">Same as Billing</span>
                    <input type="checkbox" {...register("sameAsBilling")} className="checkbox checkbox-xs checkbox-primary" />
                  </label>
                </div>

                {!wSameAsBilling && (
                  <div className="space-y-4 animate-fade-in">
                    <FormRow label="Address Line 1"><input {...register("shippingAddress1")} className="input input-bordered w-full" placeholder="Street address" /></FormRow>
                    <FormRow label="Address Line 2"><input {...register("shippingAddress2")} className="input input-bordered w-full" placeholder="Apt, Suite, etc." /></FormRow>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormRow label="City"><input {...register("shippingCity")} className="input input-bordered w-full" /></FormRow>
                      <FormRow label="State"><input {...register("shippingState")} className="input input-bordered w-full" /></FormRow>
                      <FormRow label="Postal Code"><input {...register("shippingPostal")} className="input input-bordered w-full" /></FormRow>
                      <FormRow label="Country">
                        <select {...register("shippingCountry")} className="select select-bordered w-full">
                          <option value="">-Select-</option>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </FormRow>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* 4. Financial & Additional Notes */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              4. Financial & Additional Info
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="GST / VAT Number"><input {...register("gstNumber")} className="input input-bordered w-full uppercase font-mono" /></FormRow>
                <FormRow label="PAN / Tax ID"><input {...register("panNumber")} className="input input-bordered w-full uppercase font-mono" /></FormRow>
                <FormRow label="Payment Terms">
                  <select {...register("paymentTerms")} className="select select-bordered w-full">
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </FormRow>
              </div>
              <FormRow label="Description & Notes">
                <textarea {...register("description")} className="textarea textarea-bordered w-full bg-warning/5" rows={4} placeholder="Internal notes about the account..."></textarea>
              </FormRow>
            </div>
          </div>

        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200 flex items-center gap-2"><MdBusiness /> Summary</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Account Name</span>
                <p className="font-bold text-base-content text-base mt-1 truncate">{wAccountName || "—"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Type & Industry</span>
                <div className="mt-1 flex gap-2">
                  <div className="badge badge-primary">{wType || "Business"}</div>
                  {wIndustry && <div className="badge badge-outline">{wIndustry}</div>}
                </div>
              </div>
              
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Account Owner</span>
                <p className="font-medium mt-1 truncate">{wOwner || "Unassigned"}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-sm">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <><MdSave size={18} /> Save Account</>}
              </button>
              <button type="button" onClick={() => reset()} className="btn btn-outline w-full bg-base-100 shadow-sm">
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}