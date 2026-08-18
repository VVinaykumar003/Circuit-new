import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdSave, MdAttachment, MdDelete, MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCase, type Case } from "@/services/caseServices";
import { getSalesReps } from "@/services/salesRepServices";

/* ─────────────────────────── Zod Schema ─────────────────────────── */
const caseSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  description: z.string().min(1, "Description is required"),
  customer: z.string().min(1, "Customer is required"),
  contactPerson: z.string().optional(),
  product: z.string().optional(),
  relatedOrder: z.string().optional(),
  type: z.enum(["Complaint", "Support Request", "Product Issue", "Refund Request", "Warranty Claim", "Escalation", "Service Request"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  status: z.enum(["Open", "Assigned", "In Progress", "Waiting For Customer", "Resolved", "Closed", "Escalated"]).default("Open"),
  assignedRep: z.string().optional(),
  dueDate: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

type CaseFormValues = z.infer<typeof caseSchema>;

/* ─────────────────────────── Component ─────────────────────────── */
export default function AddCases() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const { auth } = useAuth();

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth?.slug],
    queryFn: () => getSalesReps(auth?.slug || "default-tenant"),
  });
  
  const salesReps = useMemo(() => repsData?.data?.map((r: any) => r.memberId?.name || r.name || r.fullName).filter(Boolean) || [], [repsData]);

  const mutation = useMutation({
    mutationFn: (newData: Partial<Case>) => createCase(auth.slug || "default-tenant", newData),
    onSuccess: () => setSuccessModalOpen(true),
    onError: () => toast.error("Failed to create case."),
    onSettled: () => setIsSubmitting(false)
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    defaultValues: { priority: "Medium", status: "Open", type: "Support Request" },
  });

  const wAssignee = watch("assignedRep");
  const wCustomer = watch("customer");
  const wPriority = watch("priority");
  const wType = watch("type");

  const filteredReps = useMemo(() => {
    if (!assigneeSearch) return salesReps;
    return salesReps.filter((rep:string) => rep.toLowerCase().includes(assigneeSearch.toLowerCase()));
  }, [salesReps, assigneeSearch]);

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

  const onSubmit = async (data: CaseFormValues) => {
    setIsSubmitting(true);
    mutation.mutate({
      ...data,
      caseNumber: `CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      slaStatus: "On Track",
      comments: [],
      timeline: [{ id: Date.now().toString(), action: "Case Created", user: "Current User", timestamp: new Date().toISOString(), type: "create" }]
    } as Partial<Case>);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Create Case</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Cases</li>
              <li className="font-semibold text-primary">Create Case</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} type="button" className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">1. Case Information</div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Case Number</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200 font-mono font-bold text-primary" placeholder="Auto-generated" readOnly />
                </div>

                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Subject *</span></label>
                  <input {...register("subject")} className={`input input-bordered w-full ${errors.subject ? "input-error" : ""}`} placeholder="Brief summary of the issue..." />
                  {errors.subject && <span className="text-error text-xs">{errors.subject.message}</span>}
                </div>

                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Description *</span></label>
                  <textarea {...register("description")} className={`textarea textarea-bordered w-full text-base ${errors.description ? "textarea-error" : ""}`} rows={5} placeholder="Provide detailed information about the case..."></textarea>
                  {errors.description && <span className="text-error text-xs">{errors.description.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Case Type *</span></label>
                  <select {...register("type")} className="select select-bordered w-full">
                    <option value="Complaint">Complaint</option><option value="Support Request">Support Request</option><option value="Product Issue">Product Issue</option><option value="Refund Request">Refund Request</option><option value="Warranty Claim">Warranty Claim</option><option value="Escalation">Escalation</option><option value="Service Request">Service Request</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Priority *</span></label>
                  <select {...register("priority")} className="select select-bordered w-full font-medium">
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option><option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">2. Customer & Product Details</div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Customer *</span></label>
                  <input {...register("customer")} type="text" className={`input input-bordered w-full ${errors.customer ? "input-error" : ""}`} placeholder="Search customer..." />
                  {errors.customer && <span className="text-error text-xs">{errors.customer.message}</span>}
                </div>
                <div><label className="label py-1"><span className="label-text font-medium">Contact Person</span></label><input {...register("contactPerson")} type="text" className="input input-bordered w-full" placeholder="e.g. John Doe" /></div>
                <div><label className="label py-1"><span className="label-text font-medium">Related Product</span></label><input {...register("product")} type="text" className="input input-bordered w-full" placeholder="Search product..." /></div>
                <div><label className="label py-1"><span className="label-text font-medium">Related Order</span></label><input {...register("relatedOrder")} type="text" className="input input-bordered w-full" placeholder="e.g. SO-2026-..." /></div>
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">3. Assignment & Resolution</div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Assigned Representative</span></label>
                  <div className="dropdown w-full">
                    <label tabIndex={0} className="btn btn-outline bg-base-100 justify-start font-normal w-full border-base-300">{wAssignee || "-Select Representative-"}</label>
                    <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
                      <input type="text" placeholder="Search..." className="input input-sm input-bordered w-full mb-2" value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)} />
                      <ul className="max-h-60 overflow-y-auto">
                        {filteredReps.map((rep:string) => <li key={rep}><a onClick={() => { setValue("assignedRep", rep); (document.activeElement as HTMLElement)?.blur(); }}>{rep}</a></li>)}
                      </ul>
                    </div>
                  </div>
                </div>
                <div><label className="label py-1"><span className="label-text font-medium">Due Date</span></label><input {...register("dueDate")} type="date" className="input input-bordered w-full" /></div>
                <div className="md:col-span-2"><label className="label py-1"><span className="label-text font-medium">Initial Resolution Notes</span></label><textarea {...register("resolutionNotes")} className="textarea textarea-bordered w-full" rows={3} placeholder="Initial thoughts or proposed resolution..."></textarea></div>
              </div>
            </div>
          </div>

          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">4. Attachments</div>
            <div className="collapse-content pt-5">
          <div 
            className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center hover:bg-base-200/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
                <MdAttachment className="mx-auto text-base-content/40 mb-2" size={32} />
                <p className="text-sm text-base-content/70">Drag & drop files or click to upload</p>
                <p className="text-xs text-base-content/50 mt-1">Allowed: PDF, DOCX, JPG, PNG.</p>
                <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} accept=".pdf,.docx,.jpg,.png" />
            <label htmlFor="file-upload" className="btn btn-outline btn-sm mt-4 cursor-pointer" onClick={(e) => e.stopPropagation()}>Browse Files</label>
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
        </div>

        {/* Right Column Summary */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">Case Summary</h3>
            <div className="space-y-4 text-sm">
              <div><span className="text-xs text-base-content/60 uppercase font-semibold">Priority</span><div className="mt-1"><div className={`badge ${wPriority === 'Critical' ? 'badge-error text-white' : wPriority === 'High' ? 'badge-warning' : 'badge-info text-white'} badge-lg font-bold`}>{wPriority || "Medium"}</div></div></div>
              <div><span className="text-xs text-base-content/60 uppercase font-semibold">Case Type</span><p className="font-medium text-base-content mt-1">{wType || "Support Request"}</p></div>
              <div><span className="text-xs text-base-content/60 uppercase font-semibold">Customer</span><p className="font-medium text-base-content mt-1">{wCustomer || "Not specified"}</p></div>
              <div><span className="text-xs text-base-content/60 uppercase font-semibold">Assigned To</span><p className="font-medium text-base-content mt-1">{wAssignee || "Unassigned"}</p></div>
            </div>
            <div className="mt-6 pt-4 border-t border-base-200"><button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-md">{isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <><MdSave size={18} /> Create Case</>}</button></div>
          </div>
        </div>
      </form>

      {/* Success Modal */}
      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">Case created successfully.</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => { setSuccessModalOpen(false); navigate("/sales/cases"); }}>View Cases</button>
          </div>
        </div>
      </dialog>

    </div>
  )
}
