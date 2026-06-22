import { useEffect, useState } from "react";
import { useForm, Watch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { MdSave, MdContentCopy, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { getSalesEmployees } from "@/services/memberService";
import { useAuth } from "@/auth/AuthContext";
import { createLead } from "@/services/salesService";

/* ─────────────────────────── Zod Schema ─────────────────────────── */

const leadSchema = z.object({
  // Ownership & Status
  leadOwner: z.string().min(1, "Lead Owner is required"),
  leadSource: z.string().optional(),
  customLeadSource: z.string().optional(),
  industry: z.string().optional(),
  customIndustry: z.string().optional(),
  leadStatus: z
    .enum([
      "New",
      "Contacted",
      "Qualified",
      "Proposal Sent",
      "Negotiation",
      "Won",
      "Lost",
    ])
    .default("New"),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),

  // Contact Info
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Valid email is required"),
  countryCode: z.string().default("+1"),
  customCountryCode: z.string().optional(),
  phoneNumber: z.string().min(5, "Valid phone number is required"),
  gender: z.string().optional(),

  // Company & Address
  companyName: z.string().min(1, "Company Name is required"),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Details
  description: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

/* ─────────────────────────── static data ───────────────────── */
const PHONE_CODES = [
  { code: "+91", flag: "🇮🇳", country: "IN" },
  { code: "+1", flag: "🇺🇸", country: "US" },
  { code: "+44", flag: "🇬🇧", country: "GB" },
  { code: "+61", flag: "🇦🇺", country: "AU" },
  { code: "+971", flag: "🇦🇪", country: "AE" },
  { code: "+65", flag: "🇸🇬", country: "SG" },
  { code: "+49", flag: "🇩🇪", country: "DE" },
  { code: "+33", flag: "🇫🇷", country: "FR" },
  { code: "+81", flag: "🇯🇵", country: "JP" },
  { code: "+86", flag: "🇨🇳", country: "CN" },
  { code: "Other", flag: "🌐", country: "Other" },
];

const DEFAULT_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Other",
];

/* ── Shared Component: Form Row ── */
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
  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
    <label className="text-sm font-medium text-base-content/80 pt-2.5">
      {label}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
    <div className="w-full">
      {children}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  </div>
);

/* ─────────────────────────── component ─────────────────────── */
export default function Leads() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      leadStatus: "New",
      priority: "Medium",
      countryCode: "+1",
    },
  });
  const watchLeadSource = watch("leadSource");
  const watchIndustry = watch("industry");
  const watchCountryCode = watch("countryCode");
  const { auth } = useAuth();
  const slug = auth?.slug;
  const [owners, setOwners] = useState([]);
  if (!slug) return null;

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
  console.log(owners);
  // Live Watches for Sidebar Summary
  const wFirstName = watch("firstName");
  const wLastName = watch("lastName");
  const wCompany = watch("companyName");
  const wEmail = watch("email");
  const wStatus = watch("leadStatus");
  const wPriority = watch("priority");
  const wOwner = watch("leadOwner");

  /* ── Submit Handler ── */
  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        leadOwner: data.leadOwner, // ObjectId already
        leadSource:
          data.leadSource === "Other" ? data.customLeadSource : data.leadSource,

        industry:
          data.industry === "Other" ? data.customIndustry : data.industry,

        countryCode:
          data.countryCode === "Other"
            ? data.customCountryCode
            : data.countryCode,
      };
      country: (data.country || undefined,
        console.log("Payload to submit:", payload));
      await createLead(slug, payload);

      toast.success("Lead created successfully!");
    } catch (err) {
      toast.error("Failed to create lead.");
    } finally {
      setIsSubmitting(false);
    }
  };

const selectedOwner = owners.find((o: any) => o._id === wOwner);
console.log(selectedOwner);
  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">
            Create New Lead
          </h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1 font-medium">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Leads</li>
              <li className="text-primary">Create Lead</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-outline btn-sm gap-2 bg-base-100"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          {/* 1. Lead Ownership & Details */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              1. Lead Ownership & Details
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow
                label="Lead Owner"
                required
                error={errors.leadOwner?.message}
              >
                <select
                  {...register("leadOwner")}
                  className="select select-bordered w-full"
                >
                  <option disabled value="">
                    -Select Owner-
                  </option>

                  {owners.map((o: any) => (
                    <option key={o._id} value={o._id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </FormRow>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Lead Source">
                  <select
                    {...register("leadSource")}
                    className="select select-bordered w-full"
                  >
                    <option disabled value="">
                      -Select Source-
                    </option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Cold Call</option>
                    <option>Trade Show</option>
                    <option>Other</option>
                  </select>
                  {watchLeadSource === "Other" && (
                    <input
                      {...register("customLeadSource")}
                      className="input input-bordered w-full mt-2"
                      placeholder="Enter custom source"
                    />
                  )}
                </FormRow>
                <FormRow label="Industry">
                  <select
                    {...register("industry")}
                    className="select select-bordered w-full"
                  >
                    <option disabled value="">
                      -Select Industry-
                    </option>
                    <option value="IT">IT</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Telecom">Telecom</option>
                    <option value="Construction">Construction</option>
                    <option value="Other">Other</option>
                  </select>
                  {watchIndustry === "Other" && (
                    <input
                      {...register("customIndustry")}
                      className="input input-bordered w-full mt-2"
                      placeholder="Enter custom industry"
                    />
                  )}
                </FormRow>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Lead Status" required>
                  <select
                    {...register("leadStatus")}
                    className="select select-bordered w-full"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </FormRow>
                <FormRow label="Priority" required>
                  <select
                    {...register("priority")}
                    className="select select-bordered w-full"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </FormRow>
              </div>
            </div>
          </div>

          {/* 2. Contact Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              2. Contact Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
                <label className="text-sm font-medium text-base-content/80 pt-2.5">
                  Name <span className="text-error">*</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      {...register("firstName")}
                      className={`input input-bordered w-full ${errors.firstName ? "input-error" : ""}`}
                      placeholder="First Name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-error mt-1">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      {...register("lastName")}
                      className={`input input-bordered w-full ${errors.lastName ? "input-error" : ""}`}
                      placeholder="Last Name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-error mt-1">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow
                  label="Email Address"
                  required
                  error={errors.email?.message}
                >
                  <input
                    type="email"
                    {...register("email")}
                    className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                    placeholder="john@company.com"
                  />
                </FormRow>
                <FormRow label="Gender">
                  <select
                    {...register("gender")}
                    className="select select-bordered w-full"
                  >
                    <option disabled value="">-Select-</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </FormRow>
              </div>

              <FormRow
                label="Phone Number"
                required
                error={errors.phoneNumber?.message}
              >
                <div
                  className={`flex border rounded-lg overflow-hidden ${errors.phoneNumber ? "border-error" : "border-base-300"} focus-within:border-primary transition-colors bg-base-100`}
                >
                  <select
                    {...register("countryCode")}
                    className="select select-sm select-ghost w-24 rounded-none border-r border-base-300 focus:bg-transparent"
                  >
                    {PHONE_CODES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.flag} {p.code}
                      </option>
                    ))}
                  </select>
                  {watchCountryCode === "Other" && (
                    <input
                      {...register("customCountryCode")}
                      className="input input-sm w-32"
                      placeholder="+999"
                    />
                  )}
                  <input
                    type="tel"
                    {...register("phoneNumber")}
                    className="input input-sm border-none w-full focus:outline-none"
                    placeholder="81234 56789"
                  />
                </div>
              </FormRow>
            </div>
          </div>

          {/* 3. Company & Address */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              3. Company & Address
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow
                label="Company Name"
                required
                error={errors.companyName?.message}
              >
                <input
                  {...register("companyName")}
                  className={`input input-bordered w-full ${errors.companyName ? "input-error" : ""}`}
                  placeholder="Company Inc."
                />
              </FormRow>

              <FormRow label="Address Line 1">
                <input
                  {...register("addressLine1")}
                  className="input input-bordered w-full"
                  placeholder="Street address"
                />
              </FormRow>
              <FormRow label="Address Line 2">
                <input
                  {...register("addressLine2")}
                  className="input input-bordered w-full"
                  placeholder="Apt, Suite, etc."
                />
              </FormRow>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="City">
                  <input
                    {...register("city")}
                    className="input input-bordered w-full"
                  />
                </FormRow>
                <FormRow label="State">
                  <input
                    {...register("state")}
                    className="input input-bordered w-full"
                  />
                </FormRow>
                <FormRow label="Postal Code">
                  <input
                    {...register("postalCode")}
                    className="input input-bordered w-full"
                  />
                </FormRow>
                <FormRow label="Country">
                  <select
                    {...register("country")}
                    className="select select-bordered w-full"
                  >
                    <option disabled value="">-Select-</option>
                    {DEFAULT_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </FormRow>
              </div>
            </div>
          </div>

          {/* 4. Additional Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl shadow-sm">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200 bg-base-200/30">
              4. Additional Notes
            </div>
            <div className="collapse-content pt-5">
              <FormRow label="Description">
                <textarea
                  {...register("description")}
                  className="textarea textarea-bordered w-full bg-warning/5"
                  rows={4}
                  placeholder="Internal notes and lead requirements..."
                ></textarea>
              </FormRow>
            </div>
          </div>
        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">
              Lead Summary
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">
                  Status & Priority
                </span>
                <div className="mt-1 flex gap-2">
                  <div
                    className={`badge font-bold ${wStatus === "New" ? "badge-info" : "badge-primary"}`}
                  >
                    {wStatus || "New"}
                  </div>
                  <div
                    className={`badge badge-outline font-bold ${wPriority === "Urgent" ? "badge-error" : wPriority === "High" ? "badge-warning" : ""}`}
                  >
                    {wPriority || "Medium"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">
                  Lead Name
                </span>
                <p className="font-medium text-base-content mt-1 truncate">
                  {wFirstName || wLastName
                    ? `${wFirstName || ""} ${wLastName || ""}`
                    : "—"}
                </p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">
                  Company
                </span>
                <p className="font-medium mt-1 truncate">{wCompany || "—"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">
                  Email
                </span>
                <p className="font-medium mt-1 truncate text-primary">
                  {wEmail || "—"}
                </p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">
                  Lead Owner
                </span>
                <p className="font-medium mt-1 truncate">
                {selectedOwner ? selectedOwner.name : "—"}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full shadow-sm"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <MdSave size={18} /> Save Lead
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => reset()}
                className="btn btn-outline w-full bg-base-100 shadow-sm"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
