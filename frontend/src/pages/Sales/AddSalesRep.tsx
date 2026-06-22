import React, { useState, useEffect, useRef ,useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdSave, MdContentCopy, MdAdd, MdDelete, MdCloudUpload, MdPersonAdd, MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { createSalesRep, getSalesRepById, getSalesReps, updateSalesRep } from "@/services/salesRepServices";
import { useQuery } from "@tanstack/react-query";
import { getSalesEmployees } from "@/services/memberService";

/* ─────────────────────────── Zod Schema ─────────────────────────── */
const salesRepSchema = z.object({
  // 1. Basic Info
  // employeeId: z.string(),
  // fullName: z.string().min(1, "Full Name is required"),
  // displayName: z.string().optional(),
  // gender: z.string().optional(),
  // dob: z.string().optional(),
  // joiningDate: z.string().min(1, "Joining Date is required"),
  memberId: z.string().min(1, "Member is required"),
  designation: z.string().min(1, "Designation is required"),
  // reportingManager: z.string().optional(),
  
  // 2. Contact Info
  // mobileNumber: z.string().min(1, "Mobile Number is required"),
  // altMobileNumber: z.string().optional(),
  // email: z.string().email("Valid email is required"),
  // altEmail: z.string().email("Valid email format").or(z.literal("")).optional(),
  // addressLine1: z.string().optional(),
  // addressLine2: z.string().optional(),
  // city: z.string().optional(),
  // state: z.string().optional(),
  // country: z.string().optional(),
  // postalCode: z.string().optional(),

  // 3. Employment Info
  employeeType: z.string().optional(),
  employmentStatus: z.string().default("Active"),
  salesTerritory: z.string().optional(),
  team: z.string().optional(),
  commissionPercentage: z.coerce.number().min(0).max(100).optional(),
  monthlyTarget: z.coerce.number().min(0).optional(),
  quarterlyTarget: z.coerce.number().min(0).optional(),
  annualTarget: z.coerce.number().min(0).optional(),

  // 4. Banking Info
  // bankName: z.string().optional(),
  // accountNumber: z.string().optional(),
  // ifscCode: z.string().optional(),
  // upiId: z.string().optional(),

  // 7. Performance Settings
  salesTargetEnabled: z.boolean().default(false),
  monthlyLeadTarget: z.coerce.number().min(0).optional(),
  monthlyConvTarget: z.coerce.number().min(0).optional(),
  monthlyRevTarget: z.coerce.number().min(0).optional(),
  incentiveScheme: z.string().optional(),

  // 8. Login & Access
  // loginAccessEnabled: z.boolean().default(false),
  // username: z.string().optional(),
  // userRole: z.string().optional(),
  // permissions: z.array(z.string()).optional(),

  // 9. Notes
  internalNotes: z.string().optional(),
  remarks: z.string().optional(),
});

type SalesRepFormValues = z.infer<typeof salesRepSchema>;

/* ── Shared Component: Form Row ── */
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
export default function AddSalesRep() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { auth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [managerSearch, setManagerSearch] = useState("");
   const [owners, setOwners] = useState([]);
  // File Upload States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<SalesRepFormValues>({
    resolver: zodResolver(salesRepSchema),
    defaultValues: {
      employmentStatus: "Active",
      salesTargetEnabled: false,
      loginAccessEnabled: false,
      permissions: [],
    }
  });



   useEffect(() => {
       const fetchOwners = async () => {
         try {
           const res = await getSalesEmployees(auth?.slug);
           setOwners(res.data.data);
         } catch (err) {
           console.error(err);
         }
       };
   
       fetchOwners();
     }, []);
     
  // Generate ID on mount or load data if edit mode
  useEffect(() => {
    if (isEditMode && id && auth?.slug) {
      const fetchRep = async () => {
        try {
          const res = await getSalesRepById(id, auth.slug as string);
          if (res.success && res.data) {
            const data = res.data;
            reset({
              ...data,
              // employeeId: data.employeeCode,
              // mobileNumber: data.phone,
              salesTerritory: data.territory,
              employmentStatus: data.status,
            });
            if (data.avatarUrl) {
              setImagePreview(data.avatarUrl);
            }
          }
        } catch (err) {
          toast.error("Failed to load representative details.");
        }
      };
      fetchRep();
    } else {
      // if (!isEditMode) {
      //   const newId = `SR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      //   setValue("employeeId", newId);
      // }
    }
  }, [isEditMode, id, auth?.slug, reset, setValue]);

  // Live Watches for Summary Card and Conditional Rendering
  // const wEmpId = watch("employeeId");
  // const wFullName = watch("fullName");
  const wDesignation = watch("designation");
  const wTeam = watch("team");
  const wTerritory = watch("salesTerritory");
  const wMonthlyTarget = watch("monthlyTarget") || 0;
  const wStatus = watch("employmentStatus");
  
  const wSalesTargetEnabled = watch("salesTargetEnabled");
  // const wLoginAccessEnabled = watch("loginAccessEnabled");
  // const wReportingManager = watch("reportingManager");

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth?.slug],
    queryFn: () => getSalesReps(auth?.slug || "default-tenant"),
  });

  const salesReps = useMemo(() => {
    return repsData?.data?.map((r: any) => r.fullName) || [];
  }, [repsData]);

  const filteredManagers = useMemo(() => {
    if (!managerSearch) return salesReps;
    return salesReps.filter((rep: string) => 
      rep.toLowerCase().includes(managerSearch.toLowerCase())
    );
  }, [salesReps, managerSearch]);

  /* ── File Handlers ── */
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error("Invalid image format.");
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const validDocs = Array.from(e.target.files).filter(f => 
  //       ["application/pdf", "image/jpeg", "image/png"].includes(f.type)
  //     );
  //     setDocuments([...documents, ...validDocs]);
  //   }
  // };

  // const removeDoc = (index: number) => {
  //   setDocuments(documents.filter((_, i) => i !== index));
  // };

  /* ── Submit Handler ── */
  const onSubmit = async (data: SalesRepFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        // employeeCode: data.employeeId,
        // phone: data.mobileNumber,
        territory: data.salesTerritory,
        status: data.employmentStatus
      };

      if (isEditMode && id) {
        await updateSalesRep(id, payload, auth.slug || "default-tenant");
        setSuccessMessage("Sales Representative updated successfully!");
      } else {
        await createSalesRep(auth.slug || "default-tenant", payload);
        setSuccessMessage("Sales Representative created successfully!");
      }
      setSuccessModalOpen(true);
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? "update" : "add"} representative.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">{isEditMode ? "Edit" : "Add"} Sales Representative</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Representatives</li>
              <li className="font-semibold text-primary">{isEditMode ? "Edit" : "Add"} Representative</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline btn-sm gap-2">
            <MdContentCopy size={16} /> Duplicate
          </button>
          <button type="button" onClick={() => (document.getElementById('assign_customers_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-sm">
            Assign Customers
          </button>
          <button onClick={() => navigate(-1)} type="button" className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Basic Information */}
          {/* <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              1. Basic Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Employee ID" error={errors.employeeId?.message}>
                <input {...register("employeeId")} className="input input-bordered w-full font-mono text-primary font-bold bg-base-200" readOnly />
              </FormRow>
              <FormRow label="Full Name" required error={errors.fullName?.message}>
                <input {...register("fullName")} className={`input input-bordered w-full ${errors.fullName ? "input-error" : ""}`} placeholder="John Doe" />
              </FormRow>
              <FormRow label="Display Name" error={errors.displayName?.message}>
                <input {...register("displayName")} className="input input-bordered w-full" placeholder="Johnny" />
              </FormRow>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Gender">
                  <select {...register("gender")} className="select select-bordered w-full">
                    <option value="">-Select-</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </FormRow>
                <FormRow label="Date of Birth">
                  <input type="date" {...register("dob")} className="input input-bordered w-full" />
                </FormRow>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Joining Date" required error={errors.joiningDate?.message}>
                  <input type="date" {...register("joiningDate")} className={`input input-bordered w-full ${errors.joiningDate ? 'input-error' : ''}`} />
                </FormRow>
                <FormRow label="Designation" required error={errors.designation?.message}>
                  <select {...register("designation")} className={`select select-bordered w-full ${errors.designation ? 'select-error' : ''}`}>
                    <option value="">-Select-</option>
                    <option>Sales Executive</option>
                    <option>Senior Sales Executive</option>
                    <option>Team Lead</option>
                    <option>Sales Manager</option>
                  </select>
                </FormRow>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormRow label="Department">
                  <input value="Sales" className="input input-bordered w-full bg-base-200" readOnly />
                </FormRow>
                <FormRow label="Reporting Manager">
                  <div className="dropdown w-full">
                    <label tabIndex={0} className="btn btn-outline bg-base-100 justify-start font-normal w-full border-base-300">
                      {wReportingManager || "-Select Manager-"}
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="input input-sm input-bordered w-full mb-2"
                        value={managerSearch}
                        onChange={e => setManagerSearch(e.target.value)}
                      />
                      <ul className="max-h-60 overflow-y-auto">
                        {filteredManagers.map((rep) => (
                          <li key={rep}><a onClick={() => { setValue("reportingManager", rep); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FormRow>
              </div>
            </div>
          </div> */}

          {/* 2. Contact Information */}
         {/* <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              2. Contact Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Mobile Number" required error={errors.mobileNumber?.message}>
                  <input type="tel" {...register("mobileNumber")} className={`input input-bordered w-full ${errors.mobileNumber ? 'input-error' : ''}`} placeholder="+1 234 567 890" />
                </FormRow>
                <FormRow label="Alternate Mobile">
                  <input type="tel" {...register("altMobileNumber")} className="input input-bordered w-full" placeholder="+1 234 567 891" />
                </FormRow>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Email Address" required error={errors.email?.message}>
                  <input type="email" {...register("email")} className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} placeholder="john@company.com" />
                </FormRow>
                <FormRow label="Alternate Email" error={errors.altEmail?.message}>
                  <input type="email" {...register("altEmail")} className={`input input-bordered w-full ${errors.altEmail ? 'input-error' : ''}`} placeholder="personal@email.com" />
                </FormRow>
              </div>
              
              <FormRow label="Address Line 1"><input {...register("addressLine1")} className="input input-bordered w-full" placeholder="Street address" /></FormRow>
              <FormRow label="Address Line 2"><input {...register("addressLine2")} className="input input-bordered w-full" placeholder="Apt, Suite, etc." /></FormRow>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="City"><input {...register("city")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="State"><input {...register("state")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="Postal Code"><input {...register("postalCode")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="Country">
                  <select {...register("country")} className="select select-bordered w-full">
                    <option value="">-Select-</option><option>India</option><option>USA</option><option>UK</option>
                  </select>
                </FormRow>
              </div>
            </div>
          </div> */}

          {/* 3. Employment Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              1. Employment Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <FormRow label="Member" required>
  <select
    {...register("memberId")}
    className="select select-bordered w-full"
  >
    <option value="">- Select Member -</option>
    {owners?.map((member) => (
      <option key={member._id} value={member._id}>
        {member.name} 
      </option>
    ))}
  </select>
</FormRow>

                                <FormRow label="Designation" required error={errors.designation?.message}>
                  <select {...register("designation")} className={`select select-bordered w-full ${errors.designation ? 'select-error' : ''}`}>
                    <option value="">-Select-</option>
                    <option>Sales Executive</option>
                    <option>Senior Sales Executive</option>
                    <option>Team Lead</option>
                    <option>Sales Manager</option>
                  </select>
                </FormRow>
                {/* <FormRow label="Employee Type">
                  <select {...register("employeeType")} className="select select-bordered w-full">
                    <option value="">-Select-</option>
                    <option>Full Time</option><option>Part Time</option><option>Contract</option><option>Freelancer</option>
                  </select>
                </FormRow>
                <FormRow label="Employment Status">
                  <select {...register("employmentStatus")} className="select select-bordered w-full">
                    <option>Active</option><option>On Leave</option><option>Resigned</option><option>Terminated</option>
                  </select>
                </FormRow> */}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Sales Territory">
                  <div className="flex gap-2">
                    <select {...register("salesTerritory")} className="select select-bordered w-full">
                      <option value="">-Select-</option><option>North America</option><option>EMEA</option><option>APAC</option>
                    </select>
                    <button type="button" onClick={() => (document.getElementById('add_territory_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-square"><MdAdd size={18} /></button>
                  </div>
                </FormRow>
                <FormRow label="Team">
                  <div className="flex gap-2">
                    <select {...register("team")} className="select select-bordered w-full">
                      <option value="">-Select-</option><option>Alpha Squad</option><option>Beta Force</option>
                    </select>
                    <button type="button" onClick={() => (document.getElementById('add_team_modal') as HTMLDialogElement).showModal()} className="btn btn-outline btn-square"><MdAdd size={18} /></button>
                  </div>
                </FormRow>
              </div>
              <FormRow label="Commission (%)" error={errors.commissionPercentage?.message}>
                <input type="number" step="0.1" {...register("commissionPercentage")} className="input input-bordered w-full max-w-xs" placeholder="e.g. 5.5" />
              </FormRow>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Monthly Target (₹)</label>
                  <input type="number" {...register("monthlyTarget")} className="input input-sm input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Quarterly Target (₹)</label>
                  <input type="number" {...register("quarterlyTarget")} className="input input-sm input-bordered" />
                </div>
                <div className="form-control">
                  <label className="label text-xs font-semibold text-base-content/60">Annual Target (₹)</label>
                  <input type="number" {...register("annualTarget")} className="input input-sm input-bordered" />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Banking Information */}
          {/* <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              4. Banking Information
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormRow label="Bank Name"><input {...register("bankName")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="Account Number"><input {...register("accountNumber")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="IFSC Code"><input {...register("ifscCode")} className="input input-bordered w-full" /></FormRow>
                <FormRow label="UPI ID"><input {...register("upiId")} className="input input-bordered w-full" /></FormRow>
              </div>
            </div>
          </div> */}

          {/* 5. Documents & 6. Profile Photo (Side by side wrapper) */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-lg font-semibold border-b border-base-200">5. Documents</div>
              <div className="collapse-content pt-5">
                <div className="flex flex-col gap-4">
                  <button type="button" onClick={() => docInputRef.current?.click()} className="btn btn-outline btn-sm gap-2">
                    <MdCloudUpload /> Upload Documents
                  </button>
                  <span className="text-xs text-base-content/50">Allow: PDF, JPG, PNG (Aadhaar, PAN, Resume)</span>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={docInputRef} onChange={handleDocChange} />
                  
                  {documents.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {documents.map((doc, idx) => (
                        <li key={idx} className="flex justify-between items-center bg-base-200 px-3 py-1.5 rounded-md border border-base-300">
                          <span className="text-xs font-medium truncate max-w-[180px]">{doc.name}</span>
                          <button type="button" onClick={() => removeDoc(idx)} className="text-error hover:text-error/70"><MdDelete size={16} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-lg font-semibold border-b border-base-200">6. Profile Photo</div>
              <div className="collapse-content pt-5 flex flex-col items-center">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-base-200 bg-base-300 flex items-center justify-center shadow-sm">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <MdPersonAdd size={48} className="text-base-content/30" />
                  )}
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-white text-xs font-semibold">Change</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-outline btn-xs">Upload</button>
                  {imagePreview && <button type="button" onClick={() => { setProfileImage(null); setImagePreview(null); }} className="btn btn-outline btn-error btn-xs">Remove</button>}
                </div>
                <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" ref={fileInputRef} onChange={handleProfileImageChange} />
              </div>
            </div>
          </div> */}

          {/* 7. Performance Settings */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              2. Performance Settings
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Sales Target Enabled">
                <input type="checkbox" {...register("salesTargetEnabled")} className="toggle toggle-success" />
              </FormRow>
              
              {wSalesTargetEnabled && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-base-200/50 rounded-xl border border-base-200">
                    <div className="form-control">
                      <label className="label text-xs font-semibold text-base-content/60">Monthly Lead Target</label>
                      <input type="number" {...register("monthlyLeadTarget")} className="input input-sm input-bordered" />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-semibold text-base-content/60">Monthly Conversion Target</label>
                      <input type="number" {...register("monthlyConvTarget")} className="input input-sm input-bordered" />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-semibold text-base-content/60">Monthly Revenue Target (₹)</label>
                      <input type="number" {...register("monthlyRevTarget")} className="input input-sm input-bordered" />
                    </div>
                  </div>
                  <FormRow label="Incentive Scheme">
                    <select {...register("incentiveScheme")} className="select select-bordered w-full max-w-xs">
                      <option value="">-Select Scheme-</option>
                      <option>Standard Tier</option>
                      <option>Premium Tier</option>
                      <option>Flat 5%</option>
                    </select>
                  </FormRow>
                </>
              )}
            </div>
          </div>

          {/* 8. Login & Access */}
          {/* <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              8. Login & Access
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="ERP Login Access">
                <input type="checkbox" {...register("loginAccessEnabled")} className="toggle toggle-primary" />
              </FormRow>

              {wLoginAccessEnabled && (
                <div className="p-4 bg-base-200/50 rounded-xl border border-base-200 space-y-4">
                  <FormRow label="Username">
                    <input {...register("username")} className="input input-bordered w-full max-w-xs" placeholder="employee.username" />
                  </FormRow>
                  <FormRow label="User Role">
                    <select {...register("userRole")} className="select select-bordered w-full max-w-xs">
                      <option value="">-Select Role-</option>
                      <option>Sales Executive</option>
                      <option>Team Lead</option>
                      <option>Sales Manager</option>
                    </select>
                  </FormRow>
                  <FormRow label="Permissions">
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer label justify-start gap-3 p-0"><input type="checkbox" value="View Leads" {...register("permissions")} className="checkbox checkbox-sm" /><span className="label-text">View Leads</span></label>
                      <label className="cursor-pointer label justify-start gap-3 p-0"><input type="checkbox" value="Create Orders" {...register("permissions")} className="checkbox checkbox-sm" /><span className="label-text">Create Orders</span></label>
                      <label className="cursor-pointer label justify-start gap-3 p-0"><input type="checkbox" value="Manage Customers" {...register("permissions")} className="checkbox checkbox-sm" /><span className="label-text">Manage Customers</span></label>
                    </div>
                  </FormRow>
                </div>
              )}
            </div>
          </div> */}

          {/* 9. Notes */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              3. Notes
            </div>
            <div className="collapse-content pt-5 space-y-4">
              <FormRow label="Internal Notes">
                <textarea {...register("internalNotes")} className="textarea textarea-bordered w-full bg-warning/5" rows={3} placeholder="Only visible internally..."></textarea>
              </FormRow>
              <FormRow label="Remarks">
                <textarea {...register("remarks")} className="textarea textarea-bordered w-full" rows={3} placeholder="General remarks..."></textarea>
              </FormRow>
            </div>
          </div>

        </div>

        {/* ── Right Column (Sidebar Summary Card) ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">Employee Summary</h3>
            
            <div className="space-y-4">
              <div className="flex flex-col items-center pb-4 border-b border-base-200">
                <div className="w-20 h-20 rounded-full bg-base-300 mb-3 overflow-hidden shadow-sm">
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <MdPersonAdd size={32} className="text-base-content/30 w-full h-full p-4" />}
                </div>
                <div className={`badge ${wStatus === 'Active' ? 'badge-success text-white' : wStatus === 'On Leave' ? 'badge-warning' : 'badge-error text-white'} font-bold`}>
                  {wStatus}
                </div>
              </div>

              {/* <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Employee ID</span>
                <p className="font-mono text-primary font-bold mt-1">{wEmpId || "Pending..."}</p>
              </div> */}

              {/* <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Name</span>
                <p className="font-medium text-base-content mt-1 truncate">{wFullName || "—"}</p>
              </div> */}

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Designation</span>
                <p className="font-medium mt-1 truncate">{wDesignation || "—"}</p>
              </div>
              
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Team & Territory</span>
                <p className="font-medium mt-1 truncate">{wTeam || "Unassigned"} • {wTerritory || "N/A"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Monthly Target</span>
                <p className="font-bold text-success text-lg mt-1">₹{wMonthlyTarget.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-2">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-sm">
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <><MdSave /> Save Representative</>}
              </button>
              <button type="button" onClick={() => reset()} className="btn btn-outline w-full shadow-sm">
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ── Modals ── */}
      <dialog id="add_team_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Team</h3>
          <input type="text" className="input input-bordered w-full mt-4" placeholder="Enter Team Name" />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Team</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="add_territory_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Quick Add Territory</h3>
          <input type="text" className="input input-bordered w-full mt-4" placeholder="Enter Territory Name" />
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Save Territory</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="assign_customers_modal" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg border-b pb-2">Assign Customers / Leads</h3>
          <div className="mt-4 space-y-4">
            <input type="text" className="input input-bordered w-full input-sm" placeholder="Search customers..." />
            <div className="h-48 bg-base-200 rounded-lg flex items-center justify-center text-sm text-base-content/50 border border-base-300">
              [Customer Table / List selection goes here]
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog" className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary">Confirm Selection</button>
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
            <button className="btn btn-primary px-8" onClick={() => { setSuccessModalOpen(false); navigate("/sales/representatives/all"); }}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}

/* ─────────────────────────── usage example ─────────────────────

import AddSalesRep from "./AddSalesRep";
import { useNavigate } from "react-router-dom";

export default function AddSalesRepPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value as string | Blob);
      });
      await api.post("/sales/representatives", formData);
      toast.success("Sales rep added!");
      navigate("/sales/representatives");
    } catch {
      toast.error("Failed to add sales rep.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddSalesRep
      teams={[{ value: "north", label: "North Team" }]}
      countries={countryList}
      onSubmit={handleSubmit}
      isLoading={loading}
    />
  );
}

──────────────────────────────────────────────────────────────── */