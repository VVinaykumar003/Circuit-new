import { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaPen, FaUser, FaUserFriends, FaShieldAlt, FaBriefcase, FaUniversity } from "react-icons/fa";
import { createMember } from "../services/memberService";
import { useAuth } from "@/auth/AuthContext";
import { uploadImage } from "@/services/uploadService";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

type UserRole = "employee" | "manager" | "admin";
type Errors = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  emergencyPhone?: string;
  aadhaar?: string;
  pan?: string;
  designation?: string;
  department?: string;
};
const AddMember = () => {
  const { auth } = useAuth();
  const slug = auth?.slug;
  const [adding, setAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const [formData, setFormData] = useState({
    // Personal
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    currentAddress: "",
    permanentAddress: "",

    // Emergency
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",

    // Identity
    aadhaar: "",
    pan: "",
    passport: "",

    // Employment
    role: "employee" as UserRole,
    designation: "", // ✅ ADD THIS
    department: "",
    customDepartment: "",
    joiningDate: "",
    previousCompany: "",

    // Financial
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });

  const validate = () => {
    let newErrors: Errors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // Email
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    // Password
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Phone (Indian 10-digit)
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian mobile number";
    }

    // Emergency Phone
    if (
      formData.emergencyPhone &&
      !/^[6-9]\d{9}$/.test(formData.emergencyPhone)
    ) {
      newErrors.emergencyPhone = "Enter valid 10-digit emergency number";
    }

    // Aadhaar (12 digits only)
    if (formData.aadhaar && !/^\d{12}$/.test(formData.aadhaar)) {
      newErrors.aadhaar = "Aadhaar must be exactly 12 digits";
    }

    // PAN (ABCDE1234F)
    if (
      formData.pan &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())
    ) {
      newErrors.pan = "PAN must be in format ABCDE1234F";
    }

    if (!formData.designation) {
      newErrors.designation = "Designation is required";
    }
     if (
  formData.department === "other" &&
  !formData.customDepartment.trim()
) {
  newErrors.department = "Custom department is required";
}
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setAdding(true);
    try {
      if (!slug) {
        toast.error("Organization details not found. Please log in again.");
        return;
      }

      let imgUrl = "";
      if (selectedFile) {
        imgUrl = await uploadImage(selectedFile);
      }

      const finalData = {
        ...formData,
        imageUrl: imgUrl,
      };


      await createMember(slug, finalData);

      toast.success("Employee Registered Successfully");

      // Reset form state
      setFormData({
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
        role: "employee" as UserRole,
        designation: "",
        department: "",
        customDepartment: "",
        joiningDate: "",
        previousCompany: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
      });
      setPreview(null);
      setSelectedFile(null);
      setErrors({});
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to register employee";
      toast.error(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200/40 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumbs />

        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-base-content tracking-tight">
            Employee Onboarding
          </h1>
          <p className="text-base-content/60 text-sm md:text-base">
            Register a new team member and set up their profile, employment, and financial details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PERSONAL INFORMATION CARD */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-5 md:p-7">
              <h2 className="card-title text-lg font-semibold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <FaUser size={16} />
                </div>
                Personal Information
              </h2>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center md:w-1/4 pt-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="imageUpload"
                    onChange={handleImageChange}
                  />
                  <div className="relative w-32 h-32 group">
                    <label
                      htmlFor="imageUpload"
                      className="w-32 h-32 rounded-full border-2 border-dashed border-base-300 bg-base-200/50 hover:bg-base-200 flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200 shadow-inner"
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <FaUser size={36} className="text-base-content/30" />
                      )}
                    </label>
                    <label
                      htmlFor="imageUpload"
                      className="absolute bottom-1 right-1 bg-primary text-primary-content p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform duration-200"
                    >
                      <FaPen size={12} />
                    </label>
                  </div>
                  <p className="text-xs mt-3 text-base-content/60 font-medium">Upload Photo</p>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Full Name <span className="text-error">*</span></span></label>
                    <input name="name" value={formData.name} placeholder="Enter full name" onChange={handleChange} className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`} />
                    {errors.name && <span className="text-error text-xs mt-1">{errors.name}</span>}
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Email Address <span className="text-error">*</span></span></label>
                    <input name="email" type="email" value={formData.email} placeholder="name@company.com" onChange={handleChange} className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`} />
                    {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Password <span className="text-error">*</span></span></label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} className={`input input-bordered w-full pr-12 ${errors.password ? 'input-error' : ''}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-primary transition-colors">
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                    {errors.password && <span className="text-error text-xs mt-1">{errors.password}</span>}
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Phone Number <span className="text-error">*</span></span></label>
                    <input type="text" name="phone" placeholder="10-digit mobile" onChange={handleChange} value={formData.phone} className={`input input-bordered w-full ${errors.phone ? 'input-error' : ''}`} />
                    {errors.phone && <span className="text-error text-xs mt-1">{errors.phone}</span>}
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Date of Birth</span></label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input input-bordered w-full" />
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Gender</span></label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="select select-bordered w-full">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Current Address</span></label>
                    <textarea name="currentAddress" placeholder="Enter current address" value={formData.currentAddress} onChange={handleChange} className="textarea textarea-bordered w-full h-24" />
                  </div>

                  <div className="form-control w-full">
                    <label className="label"><span className="label-text font-medium">Permanent Address</span></label>
                    <textarea name="permanentAddress" placeholder="Enter permanent address" value={formData.permanentAddress} onChange={handleChange} className="textarea textarea-bordered w-full h-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-5 md:p-7">
              <h2 className="card-title text-lg font-semibold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="p-2 bg-error/10 text-error rounded-lg">
                  <FaUserFriends size={16} />
                </div>
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Contact Name</span></label>
                  <input name="emergencyName" value={formData.emergencyName} placeholder="Emergency contact name" onChange={handleChange} className="input input-bordered w-full" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Contact Phone</span></label>
                  <input type="text" name="emergencyPhone" placeholder="10-digit number" value={formData.emergencyPhone} maxLength={10} onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setFormData((prev) => ({ ...prev, emergencyPhone: value }));
                  }} className={`input input-bordered w-full ${errors.emergencyPhone ? 'input-error' : ''}`} />
                  {errors.emergencyPhone && <span className="text-error text-xs mt-1">{errors.emergencyPhone}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Relation</span></label>
                  <input name="emergencyRelation" value={formData.emergencyRelation} placeholder="e.g. Spouse, Parent" onChange={handleChange} className="input input-bordered w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* IDENTITY & LEGAL DETAILS */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-5 md:p-7">
              <h2 className="card-title text-lg font-semibold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="p-2 bg-info/10 text-info rounded-lg">
                  <FaShieldAlt size={16} />
                </div>
                Identity & Legal Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Aadhaar Number</span></label>
                  <input name="aadhaar" placeholder="12-digit number" value={formData.aadhaar} maxLength={12} onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 12) setFormData((prev) => ({ ...prev, aadhaar: value }));
                  }} className={`input input-bordered w-full tracking-wide ${errors.aadhaar ? 'input-error' : ''}`} />
                  {errors.aadhaar && <span className="text-error text-xs mt-1">{errors.aadhaar}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">PAN Number</span></label>
                  <input name="pan" placeholder="ABCDE1234F" value={formData.pan} maxLength={10} onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    setFormData((prev) => ({ ...prev, pan: value }));
                  }} className={`input input-bordered w-full uppercase ${errors.pan ? 'input-error' : ''}`} />
                  {errors.pan && <span className="text-error text-xs mt-1">{errors.pan}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Passport Number</span></label>
                  <input name="passport" value={formData.passport} placeholder="Enter passport number" onChange={handleChange} className="input input-bordered w-full uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* EMPLOYMENT DETAILS */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-5 md:p-7">
              <h2 className="card-title text-lg font-semibold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="p-2 bg-success/10 text-success rounded-lg">
                  <FaBriefcase size={16} />
                </div>
                Employment Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">System Role</span></label>
                  <select name="role" value={formData.role} onChange={handleChange} className="select select-bordered w-full">
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Designation <span className="text-error">*</span></span></label>
                  <select name="designation" value={formData.designation} onChange={handleChange} className={`select select-bordered w-full ${errors.designation ? 'select-error' : ''}`}>
                    <option value="">Select Designation</option>
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
                  {errors.designation && <span className="text-error text-xs mt-1">{errors.designation}</span>}
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Department</span></label>
                  <select name="department" value={formData.department} onChange={handleChange} className={`select select-bordered w-full ${errors.department ? 'select-error' : ''}`}>
                    <option value="">Select Department</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="it">IT</option>
                    <option value="human-resource">Human Resource and Administration</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.department && <span className="text-error text-xs mt-1">{errors.department}</span>}
                </div>

                {formData.department === "other" && (
                  <div className="form-control w-full animate-fade-in">
                    <label className="label"><span className="label-text font-medium">Custom Department <span className="text-error">*</span></span></label>
                    <input type="text" name="customDepartment" value={formData.customDepartment} onChange={handleChange} placeholder="Enter Custom Department" className={`input input-bordered w-full ${errors.department ? 'input-error' : ''}`} />
                  </div>
                )}

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Joining Date</span></label>
                  <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="input input-bordered w-full" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Previous Company</span></label>
                  <input name="previousCompany" value={formData.previousCompany} placeholder="Previous employer name" onChange={handleChange} className="input input-bordered w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL DETAILS */}
          <div className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="card-body p-5 md:p-7">
              <h2 className="card-title text-lg font-semibold text-base-content mb-4 flex items-center gap-2 border-b border-base-200 pb-3">
                <div className="p-2 bg-warning/10 text-warning rounded-lg">
                  <FaUniversity size={16} />
                </div>
                Bank Account Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Bank Name</span></label>
                  <input name="bankName" value={formData.bankName} placeholder="e.g. HDFC Bank" onChange={handleChange} className="input input-bordered w-full" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">Account Number</span></label>
                  <input name="accountNumber" value={formData.accountNumber} placeholder="Enter account number" onChange={handleChange} className="input input-bordered w-full" />
                </div>

                <div className="form-control w-full">
                  <label className="label"><span className="label-text font-medium">IFSC Code</span></label>
                  <input name="ifscCode" value={formData.ifscCode} placeholder="e.g. HDFC0001234" onChange={handleChange} className="input input-bordered w-full uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end border-t border-base-300 pt-6 mt-4">
            <button
              type="submit"
              disabled={adding}
              className="btn btn-primary w-full sm:w-auto min-w-[200px] shadow-sm hover:shadow-md transition-all"
            >
              {adding ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Registering...
                </>
              ) : (
                "Register Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  
  );
};

export default AddMember;
