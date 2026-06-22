import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { MdSave, MdPerson } from "react-icons/md";
import { toast } from "react-toastify";
import { getSalesEmployees } from "@/services/memberService";
import { createContact } from "@/services/salesService";
import { useAuth } from "@/auth/AuthContext";

/* ─────────────────────────── Zod Schema ─────────────────────────── */
// const contactSchema = z.object({
//   // Personal Info
//   firstName: z.string().min(1, "First Name is required"),
//   lastName: z.string().min(1, "Last Name is required"),
//   gender: z.string().optional(),
//   dob: z.string().optional(),

//   // Contact Info
//   email: z.string().email("Valid email is required"),
//   altEmail: z.string().email("Valid email").or(z.literal("")).optional(),
//   phoneCountry: z.string().default("+1"),
//   phoneNumber: z.string().min(5, "Valid phone number is required"),
//   altPhoneNumber: z.string().optional(),

//   // Professional Info
//   company: z.string().optional(),
//   department: z.string().optional(),
//   designation: z.string().optional(),
//   leadSource: z.string().optional(),
//   assignedRep: z.string().min(1, "Assigned Rep is required"),
//   status: z.enum(["Active", "Inactive", "Prospect", "Customer", "VIP", "Blocked"]).default("Active"),

//   // Address Info
//   addressLine1: z.string().optional(),
//   addressLine2: z.string().optional(),
//   city: z.string().optional(),
//   state: z.string().optional(),
//   postalCode: z.string().optional(),
//   country: z.string().optional(),
// });


const contactSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),

  gender: z.string().optional(),
  dob: z.string().optional(),

  email: z.string().email("Valid email is required"),
  altEmail: z.string().email().optional().or(z.literal("")),

  phone: z.object({
    countryCode: z.string().default("+91"),
    number: z.string().min(5, "Valid phone number is required"),
  }),

  altPhoneNumber: z.string().optional(),

  account: z.string().optional(),

  department: z.string().optional(),
  designation: z.string().optional(),

  leadSource: z.string().optional(),

  assignedRep: z.string().min(1, "Assigned Rep is required"),

  status: z.enum([
    "Active",
    "Inactive",
    "Prospect",
    "Customer",
    "VIP",
    "Blocked",
  ]),

  address: z.object({
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),

    country: z.string().optional(),

    countryOther: z.string().optional(),
  }),
});
type ContactFormValues = z.infer<typeof contactSchema>;

/* ─────────────────────────── static data ───────────────────── */
const PHONE_CODES = [
  { code: "+91",  flag: "🇮🇳" },
  { code: "+1",   flag: "🇺🇸" },
  { code: "+44",  flag: "🇬🇧" },
  { code: "+61",  flag: "🇦🇺" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+65",  flag: "🇸🇬" },
  { code: "+49",  flag: "🇩🇪" },
  { code: "+33",  flag: "🇫🇷" },
];

const DEFAULT_COUNTRIES = [
  "India", "United States", "United Kingdom", "Australia",
  "Canada", "Germany", "France", "Singapore", "UAE", "Other",
];

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

/* ─────────────────────────── component ─────────────────────── */
export default function NewContact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
 const [owners, setOwners] = useState([]);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
     
      phone: {
        countryCode: "+1",
        number: "",
      },
      status: "Active",
    }
  });

  // Live Watches
  const wFirstName = watch("firstName");
  const wLastName = watch("lastName");
  const wAccount = watch("account");
  const wEmail = watch("email");
  const wStatus = watch("status");
  const wAssignedRep = watch("assignedRep");
  const {auth}=useAuth();
  const slug=auth?.slug;
    if (!slug) {
    return null;
  }
 console.log("🚀 SLUG in NewContact:", slug) ;
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
   const selectedOwner = owners.find((o: any) => o._id === wAssignedRep);
 const onSubmit = async (data: ContactFormValues) => {
  setIsSubmitting(true);

  try {
    const payload = {
      assignedRep: data.assignedRep,

      firstName: data.firstName,
      lastName: data.lastName,
      gender:
    data.gender && data.gender !== "-Select-"
      ? data.gender
      : undefined,

      dob: data.dob,

      email: data.email,
      altEmail: data.altEmail,

      phone: {
        countryCode: data.phone.countryCode,
        number: data.phone.number,
      },

      altPhoneNumber: data.altPhoneNumber,

      account: data.account,
      department: data.department,
      designation: data.designation,

      leadSource: data.leadSource && data.leadSource !== "-Select Source-"
    ? data.leadSource
    : undefined,
      status: data.status,

      address: {
        addressLine1: data.address.addressLine1,
        addressLine2: data.address.addressLine2,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postalCode,
        country: data.address.country && data.address.country !== "-Select-"
          ? data.address.country
          : undefined,
      },
    };

   

    const response = await createContact(
      slug,
      payload
    );

    toast.success(
      response?.data?.message ||
      "Contact created successfully"
    );

    

  } catch (error) {
    console.error(error);

    toast.error(
      error?.response?.data?.message ||
      "Failed to create contact"
    );
  } finally {
    setIsSubmitting(false);
  }
};

  /* ── render ── */
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Create New Contact</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Contacts</li>
              <li className="text-primary">Create Contact</li>
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
          
          {/* 1. Personal Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              1. Personal Information
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
                <FormRow label="Gender">
                  <select {...register("gender")} className="select select-bordered w-full">
                    <option value="">-Select-</option><option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </FormRow>
                <FormRow label="Date of Birth">
                  <input type="date" {...register("dob")} className="input input-bordered w-full" />
                </FormRow>
              </div>
            </div>
          </div>

          {/* 2. Contact Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              2. Contact Details
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Email Address" required error={errors.email?.message}>
                  <input type="email" {...register("email")} className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} placeholder="john@company.com" />
                </FormRow>
                <FormRow label="Alternate Email" error={errors.altEmail?.message}>
                  <input type="email" {...register("altEmail")} className={`input input-bordered w-full ${errors.altEmail ? 'input-error' : ''}`} placeholder="alt@domain.com" />
                </FormRow>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Phone Number" required error={errors.phone?.number?.message}>
                  <div className={`flex border rounded-lg overflow-hidden ${errors.phone?.number ? 'border-error' : 'border-base-300'} focus-within:border-primary transition-colors bg-base-100`}>
                    <select {...register("phone.countryCode")} className="select select-sm select-ghost w-24 rounded-none border-r border-base-300 focus:bg-transparent">
                      {PHONE_CODES.map((p) => (
                        <option key={p.code} value={p.code}>{p.flag} {p.code}</option>
                      ))}
                    </select>
                    <input type="tel" {...register("phone.number")} className="input input-sm border-none w-full focus:outline-none" placeholder="12345 67890" />
                  </div>
                </FormRow>
                <FormRow label="Alt. Phone Number">
                  <input type="tel" {...register("altPhoneNumber")} className="input input-bordered w-full" placeholder="Alternate Phone" />
                </FormRow>
              </div>
            </div>
          </div>

          {/* 3. Professional Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              3. Professional Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Company/Account">
                  <input {...register("account")} className="input input-bordered w-full" placeholder="Company Inc." />
                </FormRow>
                <FormRow label="Department">
                  <input {...register("department")} className="input input-bordered w-full" placeholder="Sales, IT, etc." />
                </FormRow>
                <FormRow label="Designation">
                  <input {...register("designation")} className="input input-bordered w-full" placeholder="Manager, CEO..." />
                </FormRow>
                <FormRow label="Lead Source">
                  <select {...register("leadSource")} className="select select-bordered w-full">
                    <option value="">-Select Source-</option>
                    <option>Website</option><option>Referral</option><option>Cold Call</option>
                  </select>
                </FormRow>
                <FormRow label="Assigned Rep" required error={errors.assignedRep?.message}>
                  <select {...register("assignedRep")} className={`select select-bordered w-full ${errors.assignedRep ? 'select-error' : ''}`}>
                    <option value="">-Select Owner-</option>
                   {owners.map((o: any) => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                   ))}
                   </select>
                </FormRow>
                <FormRow label="Status">
                  <select {...register("status")} className="select select-bordered w-full">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                    <option value="VIP">VIP</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </FormRow>
              </div>
            </div>
          </div>

          {/* 4. Address Details */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              4. Address Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Address Line 1"><input {...register("address.addressLine1")} className="input input-bordered w-full" placeholder="Street address" /></FormRow>
              <FormRow label="Address Line 2"><input {...register("address.addressLine2")} className="input input-bordered w-full" placeholder="Apt, Suite, etc." /></FormRow>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="City"><input {...register("address.city")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="State"><input {...register("address.state")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="Postal Code"><input {...register("address.postalCode")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="Country">
                  <select {...register("address.country")} className="select select-bordered w-full">
                    <option value="">-Select-</option>
                    {DEFAULT_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormRow>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200 flex items-center gap-2"><MdPerson /> Summary</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Contact Name</span>
                <p className="font-bold text-base-content text-base mt-1 truncate">
                  {wFirstName || wLastName ? `${wFirstName || ''} ${wLastName || ''}` : "—"}
                </p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Status</span>
                <div className="mt-1">
                  <div className="badge badge-primary font-bold">{wStatus || "Active"}</div>
                </div>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Company</span>
                <p className="font-medium mt-1 truncate">{wAccount || "—"}</p>
              </div>
              
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Email</span>
                <p className="font-medium mt-1 truncate text-primary">{wEmail || "—"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Assigned Rep</span>
                <p className="font-medium mt-1 truncate">{wAssignedRep ? selectedOwner?.name || "Unassigned" : "Unassigned"}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-sm">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <><MdSave size={18} /> Save Contact</>}
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