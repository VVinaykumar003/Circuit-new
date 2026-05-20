import { useState } from "react";
import { FaEye, FaEyeSlash, FaUser, FaShieldAlt, FaBriefcase, FaUniversity, FaUserFriends } from "react-icons/fa";
import { toast } from "react-toastify";
import { createMember } from "../services/memberService";
// import { getOrganizationSlug } from "@/utils/auth";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useAuth } from "@/auth/AuthContext";
type UserRole = "member" | "manager" | "admin";
type Errors = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  emergencyPhone?: string;
  aadhaar?: string;
  pan?: string;
  designation?: string;
};

const steps = [
  { id: 0, label: "Personal", icon: FaUser },
  { id: 1, label: "Emergency", icon: FaUserFriends },
  { id: 2, label: "Identity", icon: FaShieldAlt },
  { id: 3, label: "Employment", icon: FaBriefcase },
  { id: 4, label: "Banking", icon: FaUniversity },
];

const inputBase =
  "w-full px-4 py-3 rounded-xl border bg-white text-gray-800 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 border-gray-200 text-sm";

const labelBase = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

const Field = ({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className={labelBase}>{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
  </div>
);

const AddMember = () => {
  const {auth} = useAuth();
  const slug = auth.slug;
  const [currentStep, setCurrentStep] = useState(0);
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    aadhaar: "",
    pan: "",
    passport: "",
    role: "member" as UserRole,
    designation: "",
    department: "",
    joiningDate: "",
    previousCompany: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (formData.password.length < 6) newErrors.password = "Minimum 6 characters";
    if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = "Enter valid 10-digit number";
    if (formData.emergencyPhone && !/^[6-9]\d{9}$/.test(formData.emergencyPhone))
      newErrors.emergencyPhone = "Enter valid 10-digit number";
    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar))
      newErrors.aadhaar = "Must be exactly 12 digits";
    if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase()))
      newErrors.pan = "Format: ABCDE1234F";
    if (!formData.designation) newErrors.designation = "Designation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setAdding(true);
    try {
       
       if (!slug) {
         toast.error("User data not found. Please log in again.");
         return;
       }

            await createMember(slug, formData);
      
            toast.success("Employee Registered Successfully");
            
      setFormData({
        name: "", email: "", password: "", phone: "", gender: "", dateOfBirth: "",
        currentAddress: "", permanentAddress: "", emergencyName: "", emergencyPhone: "",
        emergencyRelation: "", aadhaar: "", pan: "", passport: "", role: "member",
        designation: "", department: "", joiningDate: "", previousCompany: "",
        bankName: "", accountNumber: "", ifscCode: "",
      });
      setPreview(null);
      setErrors({});
      setCurrentStep(0);
    } catch (error : any) {
      console.error("error",error);
       const errorMessage = error.response?.data?.message || "Failed to register employee";
      toast.error("Failed to register employee",errorMessage);
      
      

    } finally {
      setAdding(false);
    }
  };



  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 flex items-start justify-center p-6 pt-10">
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        .form-wrap { font-family: 'DM Sans', sans-serif; }
        .step-bar-track { background: linear-gradient(to right, #7c3aed, #6366f1); }
        .step-dot-active { background: linear-gradient(135deg, #7c3aed, #6366f1); box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
        .step-dot-done { background: #7c3aed; }
        .step-dot-inactive { background: #e5e7eb; }
        .card-shadow { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06), 0 20px 60px -10px rgba(124,58,237,0.08); }
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
          box-shadow: 0 4px 15px rgba(124,58,237,0.3);
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(124,58,237,0.45); transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .avatar-ring { box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 8px 24px rgba(0,0,0,0.1); }
        select option { color: #374151; }
        .section-tag {
          font-family: 'DM Serif Display', serif;
          font-size: 1.5rem;
          color: #1e1b4b;
        }
      `}</style>

      <div className="form-wrap w-full max-w-3xl">
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl btn-primary flex items-center justify-center text-white shadow-lg">
            <FaUser size={18} />
          </div>
          <div>
            <h1 className="section-tag leading-none">Employee Onboarding</h1>
            <p className="text-gray-500 text-sm mt-0.5">Register a new team member</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white rounded-2xl p-4 mb-6 card-shadow">
          <div className="flex items-center justify-between relative">
            {/* Track line */}
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute top-4 left-8 h-0.5 z-0 step-bar-track transition-all duration-500"
              style={{ width: `${(currentStep / (steps.length - 1)) * (100 - (32 / 3 * 100 / 400))}%` }}
            />
            {steps.map((step, i) => {
              const Icon = step.icon;
              const active = i === currentStep;
              const done = i < currentStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(i)}
                  className="flex flex-col items-center gap-1.5 z-10 relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      active ? "step-dot-active scale-110" : done ? "step-dot-done" : "step-dot-inactive"
                    }`}
                  >
                    <Icon size={12} className={active || done ? "text-white" : "text-gray-400"} />
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors ${
                      active ? "text-violet-700" : done ? "text-violet-500" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 card-shadow">
          <form onSubmit={handleSubmit}>

            {/* ── STEP 0: Personal ── */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <input type="file" accept="image/*" className="hidden" id="imgUpload" onChange={handleImageChange} />
                  <label htmlFor="imgUpload" className="cursor-pointer group relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden avatar-ring bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                      {preview ? (
                        <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <FaUser size={28} className="text-violet-300" />
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Change</span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Click to upload photo</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Full Name *" error={errors.name}>
                    <input name="name" value={formData.name} onChange={handleChange}
                      placeholder="John Doe" className={inputBase} />
                  </Field>
                  <Field label="Email Address *" error={errors.email}>
                    <input name="email" type="email" value={formData.email} onChange={handleChange}
                      placeholder="john@company.com" className={inputBase} />
                  </Field>
                  <Field label="Password *" error={errors.password}>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Min. 6 characters" className={`${inputBase} pr-11`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors">
                        {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Phone Number *" error={errors.phone}>
                    <input name="phone" value={formData.phone} maxLength={10}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (v.length <= 10) setFormData((p) => ({ ...p, phone: v }));
                      }}
                      placeholder="10-digit mobile" className={inputBase} />
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth}
                      onChange={handleChange} className={inputBase} />
                  </Field>
                  <Field label="Gender">
                    <select name="gender" value={formData.gender} onChange={handleChange} className={inputBase}>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Current Address">
                    <textarea name="currentAddress" value={formData.currentAddress} onChange={handleChange}
                      rows={2} placeholder="Current address" className={`${inputBase} resize-none`} />
                  </Field>
                  <Field label="Permanent Address">
                    <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange}
                      rows={2} placeholder="Permanent address" className={`${inputBase} resize-none`} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── STEP 1: Emergency ── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                    <FaUserFriends size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-sm">Emergency Contact</h2>
                    <p className="text-xs text-gray-400">Someone we can reach in urgent situations</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Contact Name">
                    <input name="emergencyName" value={formData.emergencyName} onChange={handleChange}
                      placeholder="Full name" className={inputBase} />
                  </Field>
                  <Field label="Contact Phone" error={errors.emergencyPhone}>
                    <input name="emergencyPhone" value={formData.emergencyPhone} maxLength={10}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (v.length <= 10) setFormData((p) => ({ ...p, emergencyPhone: v }));
                      }}
                      placeholder="10-digit number" className={inputBase} />
                  </Field>
                  <Field label="Relation">
                    <input name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange}
                      placeholder="e.g. Spouse, Parent" className={inputBase} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── STEP 2: Identity ── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                    <FaShieldAlt size={14} className="text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-sm">Identity & Legal Details</h2>
                    <p className="text-xs text-gray-400">Government-issued identification documents</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Aadhaar Number" error={errors.aadhaar}>
                    <input name="aadhaar" value={formData.aadhaar} maxLength={12}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        if (v.length <= 12) setFormData((p) => ({ ...p, aadhaar: v }));
                      }}
                      placeholder="12-digit number" className={inputBase} />
                  </Field>
                  <Field label="PAN Number" error={errors.pan}>
                    <input name="pan" value={formData.pan} maxLength={10}
                      onChange={(e) => setFormData((p) => ({ ...p, pan: e.target.value.toUpperCase() }))}
                      placeholder="ABCDE1234F" className={`${inputBase} uppercase`} />
                  </Field>
                  <Field label="Passport Number">
                    <input name="passport" value={formData.passport} onChange={handleChange}
                      placeholder="Optional" className={inputBase} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── STEP 3: Employment ── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FaBriefcase size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-sm">Employment Details</h2>
                    <p className="text-xs text-gray-400">Role, department, and joining information</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Role">
                    <select name="role" value={formData.role} onChange={handleChange} className={inputBase}>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                  <Field label="Designation *" error={errors.designation}>
                    <select name="designation" value={formData.designation} onChange={handleChange} className={inputBase}>
                      <option value="">Select designation</option>
                      <option value="software-engineer">Software Engineer</option>
                      <option value="senior-software-engineer">Senior Software Engineer</option>
                      <option value="team-lead">Team Lead</option>
                      <option value="project-manager">Project Manager</option>
                      <option value="hr-manager">HR Manager</option>
                      <option value="ui-ux-designer">UI/UX Designer</option>
                      <option value="qa-engineer">QA Engineer</option>
                      <option value="devops-engineer">DevOps Engineer</option>
                      <option value="intern">Intern</option>
                    </select>
                  </Field>
                  <Field label="Department">
                    <select name="department" value={formData.department} onChange={handleChange} className={inputBase}>
                      <option value="">Select department</option>
                      <option value="engineering">Engineering</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                      <option value="marketing">Marketing</option>
                      <option value="operations">Operations</option>
                    </select>
                  </Field>
                  <Field label="Joining Date">
                    <input type="date" name="joiningDate" value={formData.joiningDate}
                      onChange={handleChange} className={inputBase} />
                  </Field>
                  <Field label="Previous Company">
                    <input name="previousCompany" value={formData.previousCompany} onChange={handleChange}
                      placeholder="Optional" className={inputBase} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── STEP 4: Banking ── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                    <FaUniversity size={14} className="text-violet-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800 text-sm">Bank Account Details</h2>
                    <p className="text-xs text-gray-400">For payroll and reimbursements</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Bank Name">
                    <input name="bankName" value={formData.bankName} onChange={handleChange}
                      placeholder="e.g. HDFC Bank" className={inputBase} />
                  </Field>
                  <Field label="Account Number">
                    <input name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                      placeholder="Account number" className={inputBase} />
                  </Field>
                  <Field label="IFSC Code">
                    <input name="ifscCode" value={formData.ifscCode}
                      placeholder="e.g. HDFC0001234" className={`${inputBase} uppercase`}
                      onChange={(e) => setFormData((p) => ({ ...p, ifscCode: e.target.value.toUpperCase() }))} />
                  </Field>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>

              <span className="text-xs text-gray-400 font-medium">
                Step {currentStep + 1} of {steps.length}
              </span>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary transition-all"
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {adding ? "Registering..." : "Register Employee ✓"}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-5">
          {steps.map((_, i) => (
            <button key={i} type="button" onClick={() => setCurrentStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? "w-6 bg-violet-600" : i < currentStep ? "w-3 bg-violet-300" : "w-3 bg-gray-200"
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AddMember;