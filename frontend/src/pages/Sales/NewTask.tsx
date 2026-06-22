import React, { useState, useEffect ,useMemo} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MdSave, MdContentCopy, MdAttachment, MdSend, MdDelete, MdCheckCircle } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSalesTask } from "@/services/salesTaskServices";
import { getSalesReps } from "@/services/salesRepServices";

/* ─────────────────────────── Zod Schema ─────────────────────────── */
const taskSchema = z.object({
  // Basic Info
  title: z.string().min(1, "Task title is required").max(200, "Max 200 characters allowed"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Task type is required"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Pending", "In Progress", "Completed", "On Hold", "Cancelled"]),
  
  // Assignment
  assignedTo: z.string().min(1, "Assignee is required"),
  team: z.string().optional(),
  
  // Customer & Lead
  customer: z.string().min(1, "Customer is required"),
  lead: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone format").or(z.literal("")),
  email: z.string().email("Invalid email format").or(z.literal("")),
  
  // Scheduling
  startDate: z.string().min(1, "Start Date is required"),
  dueDate: z.string().min(1, "Due Date is required"),
  dueTime: z.string().optional(),
  reminderDateTime: z.string().optional(),
  followUpDate: z.string().optional(),
  
  // Sales Info
  expectedDealValue: z.coerce.number().min(0, "Must be positive").optional(),
  opportunityStage: z.string().optional(),
  probability: z.coerce.number().min(0).max(100).optional(),
  closingDate: z.string().optional(),
  region: z.string().optional(),
  
  // Communication Tracking
  communicationType: z.string().optional(),
  meetingMode: z.enum(["Online", "Offline", ""]).optional(),
  meetingLocation: z.string().optional(),
  meetingLink: z.string().url("Invalid URL").or(z.literal("")).optional(),
  
  // Progress
  progress: z.coerce.number().min(0).max(100),
  completionNotes: z.string().optional(),
  outcome: z.string().optional(),
  reasonForDelay: z.string().optional(),
  
  // Visibility & Tags
  visibility: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).refine(data => new Date(data.dueDate) >= new Date(data.startDate), {
  message: "Due Date cannot be earlier than Start Date",
  path: ["dueDate"]
});

type TaskFormValues = z.infer<typeof taskSchema>;

/* ─────────────────────────── Component ─────────────────────────── */
export default function NewTask() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  const { data: repsData } = useQuery({
    queryKey: ["salesReps", auth.slug],
    queryFn: () => getSalesReps(auth.slug || "default-tenant"),
  });

  const salesReps = useMemo(() => {
  return repsData?.data || [];
}, [repsData]);

  const mutation = useMutation({
    mutationFn: (newData: Partial<SalesTask>) => createSalesTask(auth.slug || "default-tenant", newData as Partial<SalesTask>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesTasks"] });
      setSuccessModalOpen(true);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create task.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: "Medium",
      status: "Pending",
      progress: 0,
      probability: 0,
      expectedDealValue: 0,
      meetingMode: "",
      tags: [],
      visibility: "Private"
    },
  });
  const watchedMeetingMode = watch("meetingMode");
  const watchedStatus = watch("status");
  const watchedDueDate = watch("dueDate");
  const watchedProgress = watch("progress");
  
  // Sidebar summary watches
  const wAssignee = watch("assignedTo");
  const wCustomer = watch("customer");
  const wPriority = watch("priority");
  const wValue = watch("expectedDealValue");
  const wAssignedTo = watch("assignedTo");

  const filteredReps = useMemo(() => {
    if (!assigneeSearch) return salesReps;
   return salesReps.filter((rep: any) =>
    rep.memberId.name
      .toLowerCase()
      .includes(assigneeSearch.toLowerCase())
  );
  }, [salesReps, assigneeSearch]);

  // Check for Delay Display
  const isOverdue = watchedDueDate ? new Date(watchedDueDate) < new Date() : false;
  const showDelayReason = watchedStatus === "On Hold" || isOverdue;

  /* ── Auto Save Draft ── */
  useEffect(() => {
    const interval = setInterval(() => {
      // MOCK: Auto-save logic
      console.log("Draft saved...");
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ── Load Templates ── */
  const loadTemplate = (type: string) => {
    if (type === "Follow-up") {
      setValue("type", "Lead Follow-up");
      setValue("title", "Follow up with new Lead");
      setValue("priority", "High");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files!)]);
  };

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    // Note: File attachments are not sent as the backend endpoint does not currently support multipart/form-data.
    // The 'attachments' field in the model expects URLs.
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8 font-sans">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-base-100 p-5 rounded-xl border border-base-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-base-content tracking-tight">Add Sales Task</h1>
          <div className="text-sm text-base-content/60 breadcrumbs mt-1">
            <ul>
              <li>Dashboard</li>
              <li>Sales</li>
              <li>Tasks</li>
              <li className="font-semibold text-primary">Add Task</li>
            </ul>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-outline btn-sm gap-2">
            <MdSave size={16} /> Save Draft
          </button>
          <button type="button" className="btn btn-outline btn-sm gap-2" onClick={() => loadTemplate("Follow-up")}>
            <MdContentCopy size={16} /> Load Template
          </button>
          <button onClick={() => navigate(-1)} type="button" className="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ── Left Column (Form Sections) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Basic Info */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              1. Basic Task Information
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Task Title *</span></label>
                  <input {...register("title")} className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`} placeholder="Enter task title" />
                  {errors.title && <span className="text-error text-xs">{errors.title.message}</span>}
                </div>

                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Task Description *</span></label>
                  <textarea {...register("description")} className={`textarea textarea-bordered w-full text-base ${errors.description ? "textarea-error" : ""}`} rows={3} placeholder="Provide task details..."></textarea>
                  {errors.description && <span className="text-error text-xs">{errors.description.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Task Type *</span></label>
                  <select {...register("type")} className={`select select-bordered w-full ${errors.type ? "select-error" : ""}`}>
                    <option value="">-Select Type-</option>
                    <option value="Lead Follow-up">Lead Follow-up</option>
                    <option value="Client Meeting">Client Meeting</option>
                    <option value="Demo">Demo</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Proposal Submission">Proposal Submission</option>
                    <option value="Contract Negotiation">Contract Negotiation</option>
                    <option value="Payment Collection">Payment Collection</option>
                    <option value="Upselling">Upselling</option>
                    <option value="Customer Visit">Customer Visit</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.type && <span className="text-error text-xs">{errors.type.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Task Category</span></label>
                  <select {...register("category")} className="select select-bordered w-full">
                    <option value="">-Select Category-</option>
                    <option value="Pre-Sales">Pre-Sales</option>
                    <option value="Post-Sales">Post-Sales</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Priority *</span></label>
                  <select {...register("priority")} className="select select-bordered w-full font-medium">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Status *</span></label>
                  <select {...register("status")} className="select select-bordered w-full">
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Assignment Details */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              2. Assignment Details
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Assigned To *</span></label>
                  <div className="dropdown w-full">
                    <label tabIndex={0} className={`btn btn-outline bg-base-100 justify-start font-normal w-full ${errors.assignedTo ? "border-error" : "border-base-300"}`}>
                     {salesReps.find((rep: any) => rep.memberId._id === wAssignedTo)?.memberId.name || "-Select Employee-"}
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full border border-base-300">
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="input input-sm input-bordered w-full mb-2"
                        value={assigneeSearch}
                        onChange={e => setAssigneeSearch(e.target.value)}
                      />
                      <ul className="max-h-60 overflow-y-auto">
                        {filteredReps.map((rep) => (
                          <li key={rep.memberId._id}>
    <a
      onClick={() => {
        setValue(
          "assignedTo",
          rep.memberId._id,
          { shouldValidate: true }
        );
        (document.activeElement as HTMLElement)?.blur();
      }}
    >
      {rep.memberId.name}
    </a>
  </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {errors.assignedTo && <span className="text-error text-xs">{errors.assignedTo.message}</span>}
                </div>
                
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Assigned By</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value="Current Admin User" readOnly />
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Department</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value="Sales" readOnly />
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Team</span></label>
                  <select {...register("team")} className="select select-bordered w-full">
                    <option value="">-Select Team-</option>
                    <option value="North Team">North Team</option>
                    <option value="South Team">South Team</option>
                    <option value="Global">Global Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Customer & Lead Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              3. Customer & Lead Information
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Customer / Client *</span></label>
                  <select {...register("customer")} className={`select select-bordered w-full ${errors.customer ? "select-error" : ""}`}>
                    <option value="">-Search Customer-</option>
                    <option value="Zager Digital Services">Zager Digital Services</option>
                    <option value="Acme Corp">Acme Corp</option>
                  </select>
                  {errors.customer && <span className="text-error text-xs">{errors.customer.message}</span>}
                </div>
                
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Lead / Opportunity</span></label>
                  <select {...register("lead")} className="select select-bordered w-full">
                    <option value="">-Select Lead-</option>
                    <option value="ERP System Revamp">ERP System Revamp</option>
                    <option value="Bulk Order Q3">Bulk Order Q3</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Contact Person</span></label>
                  <input {...register("contactPerson")} type="text" className="input input-bordered w-full" placeholder="John Doe" />
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Phone Number</span></label>
                  <input {...register("phone")} type="tel" className={`input input-bordered w-full ${errors.phone ? "input-error" : ""}`} placeholder="+1 234 567 8900" />
                  {errors.phone && <span className="text-error text-xs">{errors.phone.message}</span>}
                </div>

                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Email Address</span></label>
                  <input {...register("email")} type="email" className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`} placeholder="john@example.com" />
                  {errors.email && <span className="text-error text-xs">{errors.email.message}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Scheduling */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              4. Scheduling
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Task Creation Date</span></label>
                  <input type="text" className="input input-bordered w-full bg-base-200" value={new Date().toLocaleDateString()} readOnly />
                </div>
                
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Start Date *</span></label>
                  <input {...register("startDate")} type="date" className={`input input-bordered w-full ${errors.startDate ? "input-error" : ""}`} />
                  {errors.startDate && <span className="text-error text-xs">{errors.startDate.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Due Date *</span></label>
                  <input {...register("dueDate")} type="date" className={`input input-bordered w-full ${errors.dueDate ? "input-error" : ""}`} />
                  {errors.dueDate && <span className="text-error text-xs">{errors.dueDate.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Due Time</span></label>
                  <input {...register("dueTime")} type="time" className="input input-bordered w-full" />
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Reminder Date & Time</span></label>
                  <input {...register("reminderDateTime")} type="datetime-local" className="input input-bordered w-full" />
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Follow-up Date</span></label>
                  <input {...register("followUpDate")} type="date" className="input input-bordered w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Sales Information */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              5. Sales Information
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Expected Deal Value</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-base-content/50">₹</span>
                    <input {...register("expectedDealValue")} type="number" step="0.01" className={`input input-bordered w-full pl-8 ${errors.expectedDealValue ? "input-error" : ""}`} placeholder="0.00" />
                  </div>
                  {errors.expectedDealValue && <span className="text-error text-xs">{errors.expectedDealValue.message}</span>}
                </div>
                
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Opportunity Stage</span></label>
                  <select {...register("opportunityStage")} className="select select-bordered w-full">
                    <option value="">-Select Stage-</option>
                    <option value="New Lead">New Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Probability (%)</span></label>
                  <input {...register("probability")} type="number" min="0" max="100" className={`input input-bordered w-full ${errors.probability ? "input-error" : ""}`} placeholder="50" />
                  {errors.probability && <span className="text-error text-xs">{errors.probability.message}</span>}
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Expected Closing Date</span></label>
                  <input {...register("closingDate")} type="date" className="input input-bordered w-full" />
                </div>

                <div className="md:col-span-2">
                  <label className="label py-1"><span className="label-text font-medium">Sales Territory / Region</span></label>
                  <select {...register("region")} className="select select-bordered w-full">
                    <option value="">-Select Region-</option>
                    <option value="North America">North America</option>
                    <option value="EMEA">EMEA</option>
                    <option value="APAC">APAC</option>
                    <option value="LATAM">LATAM</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Communication Tracking */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              6. Communication Tracking
            </div>
            <div className="collapse-content pt-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label py-1"><span className="label-text font-medium">Communication Type</span></label>
                  <select {...register("communicationType")} className="select select-bordered w-full">
                    <option value="">-Select Type-</option>
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Visit">Visit</option>
                  </select>
                </div>

                <div>
                  <label className="label py-1"><span className="label-text font-medium">Meeting Mode</span></label>
                  <select {...register("meetingMode")} className="select select-bordered w-full">
                    <option value="">-None-</option>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                {watchedMeetingMode === "Online" && (
                  <div className="md:col-span-2">
                    <label className="label py-1"><span className="label-text font-medium">Meeting Link</span></label>
                    <input {...register("meetingLink")} type="url" className={`input input-bordered w-full ${errors.meetingLink ? "input-error" : ""}`} placeholder="https://zoom.us/..." />
                    {errors.meetingLink && <span className="text-error text-xs">{errors.meetingLink.message}</span>}
                  </div>
                )}

                {watchedMeetingMode === "Offline" && (
                  <div className="md:col-span-2">
                    <label className="label py-1"><span className="label-text font-medium">Meeting Location</span></label>
                    <input {...register("meetingLocation")} type="text" className="input input-bordered w-full" placeholder="123 Business Rd..." />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7. Progress Tracking */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              7. Progress Tracking
            </div>
            <div className="collapse-content pt-5">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-medium text-sm">Progress Percentage: {watchedProgress}%</label>
                  </div>
                  <input {...register("progress")} type="range" min="0" max="100" className="range range-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label py-1"><span className="label-text font-medium">Completion Notes</span></label>
                    <textarea {...register("completionNotes")} className="textarea textarea-bordered w-full text-base" rows={3} placeholder="Add notes..."></textarea>
                  </div>
                  <div>
                    <label className="label py-1"><span className="label-text font-medium">Outcome / Result</span></label>
                    <textarea {...register("outcome")} className="textarea textarea-bordered w-full text-base" rows={3} placeholder="Task result..."></textarea>
                  </div>
                </div>

                {showDelayReason && (
                  <div>
                    <label className="label py-1"><span className="label-text font-medium text-warning">Reason For Delay</span></label>
                    <textarea {...register("reasonForDelay")} className="textarea textarea-warning w-full text-base bg-warning/5" rows={2} placeholder="Explain why the task is on hold or delayed..."></textarea>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 8. Attachments */}
          <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-xl">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title text-lg font-semibold border-b border-base-200">
              8. Attachments
            </div>
            <div className="collapse-content pt-5">
          <div 
            className="border-2 border-dashed border-base-300 rounded-xl p-6 text-center hover:bg-base-200/50 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
                <MdAttachment className="mx-auto text-base-content/40 mb-2" size={32} />
            <p className="text-sm font-medium">Drag & Drop files or click to upload</p>
            <p className="text-xs text-base-content/50 mt-1">PDF, DOCX, XLSX, JPG, PNG.</p>
                <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} accept=".pdf,.docx,.xlsx,.jpg,.png" />
            <label htmlFor="file-upload" className="btn btn-outline btn-sm mt-4 cursor-pointer" onClick={(e) => e.stopPropagation()}>Browse Files</label>
              </div>

              {attachments.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {attachments.map((file, i) => (
                    <li key={i} className="flex justify-between items-center bg-base-200 px-4 py-2 rounded-md border border-base-300">
                      <span className="text-sm font-medium truncate">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(i)} className="text-error hover:text-error/70">
                        <MdDelete size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>

        {/* ── Right Column (Summary Sidebar) ── */}
        <div className="lg:col-span-1 space-y-4">
          
          <div className="bg-base-100 border border-base-300 rounded-xl p-5 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-base-200">Task Summary</h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Priority</span>
                <div className="mt-1">
                  <div className={`badge ${wPriority === 'Urgent' ? 'badge-error' : wPriority === 'High' ? 'badge-warning' : wPriority === 'Medium' ? 'badge-info' : 'badge-success'} badge-lg font-bold`}>
                    {wPriority || "Medium"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Status</span>
                <div className="mt-1">
                  <div className={`badge badge-outline badge-lg font-bold`}>
                    {watchedStatus || "Pending"}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Assigned To</span>
                <p className="font-medium text-base-content mt-1">
                  {salesReps.find((rep: any) => rep.memberId._id === wAssignee)?.memberId.name || wAssignee || "Unassigned"}
                </p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Customer</span>
                <p className="font-medium text-base-content mt-1">{wCustomer || "N/A"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Expected Value</span>
                <p className="font-medium text-success text-lg mt-1">₹{wValue ? Number(wValue).toLocaleString() : "0.00"}</p>
              </div>

              <div>
                <span className="text-xs text-base-content/60 uppercase font-semibold">Progress</span>
                <div className="mt-1 flex items-center gap-2">
                  <progress className="progress progress-primary w-full" value={watchedProgress} max="100"></progress>
                  <span className="text-sm font-semibold">{watchedProgress}%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200 space-y-3">
              <label className="text-xs text-base-content/60 uppercase font-semibold block mb-1">Visibility</label>
              <select {...register("visibility")} className="select select-sm select-bordered w-full">
                <option value="Private">Private</option>
                <option value="Team">Team</option>
                <option value="Department">Department</option>
                <option value="Public">Public</option>
              </select>

              <label className="text-xs text-base-content/60 uppercase font-semibold block mb-1 mt-3">Tags (Hold Ctrl)</label>
              <select {...register("tags")} multiple className="select select-bordered w-full h-24 text-sm">
                <option value="Hot Lead">Hot Lead</option>
                <option value="VIP Client">VIP Client</option>
                <option value="Renewal">Renewal</option>
                <option value="Upsell">Upsell</option>
                <option value="Payment Pending">Payment Pending</option>
              </select>
            </div>

            <div className="mt-6 pt-4 border-t border-base-200">
              <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-md">
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </div>

        </div>
      </form>

      {/* Success Modal */}
      <dialog className={`modal ${successModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box flex flex-col items-center justify-center p-8">
          <MdCheckCircle className="text-success w-16 h-16 mb-4" />
          <h3 className="font-bold text-xl text-center mb-2">Success!</h3>
          <p className="text-base-content/80 text-center">Sales task has been created successfully.</p>
          <div className="modal-action mt-6 w-full justify-center">
            <button className="btn btn-primary px-8" onClick={() => { setSuccessModalOpen(false); navigate("/sales/tasks"); }}>Close</button>
          </div>
        </div>
      </dialog>

    </div>
  );
}