import { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash, FaPen, FaUser } from "react-icons/fa";
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

  const inputStyle =
    " w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content/50 placeholder:text-base-content/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
  // <div className="min-h-screen flex flex-col items-center p-6 space-y-6">
  <div className="min-h-screen flex flex-col items-center p-4 space-y-4">
      <div className="w-full max-w-5xl">
        <Breadcrumbs />
      </div>
      <form
        onSubmit={handleSubmit}
        // className="w-full max-w-5xl bg-base-200 p-8 rounded-2xl shadow-md space-y-10 border-2"
        className="w-full max-w-4xl bg-primary/40 p-5 rounded-xl shadow-sm space-y-6 border"
      >
        <h2 className="text-2xl font-bold text-center text-primary-content ">
          Employee Onboarding
        </h2>

        {/* PROFILE IMAGE */}
        {/* <div className="flex flex-col items-center justify-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageUpload"
            onChange={handleImageChange}
          />

          <div className="relative w-32 h-32">
            <label
              htmlFor="imageUpload"
              className="w-32 h-32 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-gray-500 text-lg">
                  <FaUser size={44} className="mb-1" />
                </span>
              )}
            </label>

            {preview && (
              <label
                htmlFor="imageUpload"
                className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full cursor-pointer"
              >
                <FaPen size={12} />
              </label>
            )}

          </div>
            <label className="text-center text-sm text-gray-800 mt-2">
              {preview ? "Change Image" : "Click to Upload"}
            </label>
        </div> */}

        {/* <div className="flex gap-8 items-start"> */}

        {/* RIGHT SIDE - PERSONAL INFO */}
        <div className="flex-1">
          <fieldset className="grid md:grid-cols-2 gap-4 border rounded-lg border-white p-4">
            <legend className="text-sm font-semibold text-primary-content px-2">
              Personal Information
            </legend>
            <div className="flex gap-4 items-start md:col-span-2">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="imageUpload"
                  onChange={handleImageChange}
                />

                <div className="relative w-30 h-30">
                  <label
                    htmlFor="imageUpload"
                    className="w-30 h-30 rounded-full border-2 border-dashed border-white flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaUser size={30} className="text-white" />
                    )}
                  </label>

                  {preview && (
                    <label
                      htmlFor="imageUpload"
                      className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1 rounded-full cursor-pointer"
                    >
                      <FaPen size={10} />
                    </label>
                  )}
                </div>

                <p className="text-xs mt-2 text-white">Upload</p>
              </div>

              {/* Name Email  */}
              <div className="flex-1 grid gap-4">
                <input
                  name="name"
                  value={formData.name}
                  placeholder="Full Name"
                  onChange={handleChange}
                  className={inputStyle}
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="Email"
                  onChange={handleChange} 
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputStyle} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <input
              type="text"
              name="phone"
              placeholder="Contact"
              onChange={handleChange}
              value={formData.phone}
              className={inputStyle}
            />

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              placeholder="DOB"
              onChange={handleChange}
              className={inputStyle}
            />

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`${inputStyle}`}
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <textarea
              name="currentAddress"
              placeholder="Current Address"
              value={formData.currentAddress}
              onChange={handleChange}
              className={inputStyle}
            />
            <textarea
              name="permanentAddress"
              placeholder="Permanent Address"
              value={formData.permanentAddress}
              onChange={handleChange}
              className={inputStyle}
            />
          </fieldset>
        </div>

        {/* ================= EMERGENCY ================= */}
        <section className="space-y-4">
          {/* <h3 className="text-lg font-semibold border-b pb-2 border-base-content/20 text-base-content">
            Emergency Contact
          </h3> */}

          <div className=" gap-6">
            <fieldset className="grid md:grid-cols-2 gap-4 border rounded-lg border-white p-4">
              <legend className="text-sm  text-primary-content mb-2 font-semibold p-2">
                Emergency Contact
              </legend>

              <input
                name="emergencyName"
                value={formData.emergencyName}
                placeholder="Contact Name"
                onChange={handleChange}
                className={inputStyle}
              />

              <input
                type="text"
                name="emergencyPhone"
                placeholder="Contact Phone"
                value={formData.emergencyPhone}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setFormData((prev) => ({
                      ...prev,
                      emergencyPhone: value,
                    }));
                  }
                }}
                className={inputStyle}
              />

              {errors.emergencyPhone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.emergencyPhone}
                </p>
              )}

              <input
                name="emergencyRelation"
                value={formData.emergencyRelation}
                placeholder="Relation"
                onChange={handleChange}
                className={inputStyle}
              />
            </fieldset>
          </div>
        </section>

        {/* ================= IDENTITY ================= */}
        <section className="space-y-4">
          {/* <h3 className="text-lg font-semibold border-b border-base-content/20 pb-2 text-base-content">
            Identity & Legal Details
          </h3> */}

          <div className=" gap-6">
            <fieldset className="grid md:grid-cols-2 gap-4 border rounded-lg border-white p-4">
              <legend className="text-sm  text-primary-content mb-2 font-semibold p-2">
                Identity & Legal Details
              </legend>

              <input
                name="aadhaar"
                placeholder="Aadhaar Number"
                value={formData.aadhaar}
                maxLength={12}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 12) {
                    setFormData((prev) => ({
                      ...prev,
                      aadhaar: value,
                    }));
                  }
                }}
                className={inputStyle}
              />

              {errors.aadhaar && (
                <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>
              )}

              <input
                name="pan"
                placeholder="PAN Number"
                value={formData.pan}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData((prev) => ({
                    ...prev,
                    pan: value,
                  }));
                }}
                className={inputStyle}
              />

              {errors.pan && (
                <p className="text-red-500 text-sm mt-1">{errors.pan}</p>
              )}

              <input
                name="passport"
                value={formData.passport}
                placeholder="Passport Number"
                onChange={handleChange}
                className={inputStyle}
              />
            </fieldset>
          </div>
        </section>

        {/* ================= EMPLOYMENT ================= */}
        <section className="space-y-4">
          {/* <h3 className="text-lg font-semibold border-b border-base-content/20 pb-2 text-base-content">
            Employment Details
          </h3> */}
          <div className=" gap-6">
            <fieldset className="grid md:grid-cols-2 gap-4 border rounded-lg border-white p-4">
              <legend className="text-sm  text-primary-content mb-2 font-semibold   p-2">
                Employment Details
              </legend>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>

              {/* Designation */}
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={inputStyle}
              >
                <option value="">Select Designation</option>
                <option value="software-engineer">Software Engineer</option>
                <option value="senior-software-engineer">
                  Senior Software Engineer
                </option>
                <option value="team-lead">Team Lead</option>
                <option value="project-manager">Project Manager</option>
                <option value="hr-manager">HR Manager</option>
                <option value="ui-ux-designer">UI/UX Designer</option>
                <option value="qa-engineer">QA Engineer</option>
                <option value="devops-engineer">DevOps Engineer</option>
                <option value="intern">Intern</option>
              </select>
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.designation}
                </p>
              )}

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={inputStyle}
              />

              <input
                name="previousCompany"
                value={formData.previousCompany}
                placeholder="Previous Company"
                onChange={handleChange}
                className={inputStyle}
              />
            </fieldset>
          </div>
        </section>

        {/* ================= FINANCIAL ================= */}
        <section className="space-y-4">
          {/* <h3 className="text-lg font-semibold border-b border-base-content/20 pb-2 text-base-content">
            Financial Details
          </h3> */}

          <div className=" gap-6">
            <fieldset className="grid md:grid-cols-2 gap-4 border rounded-lg border-white p-4">
              <legend className="text-sm  text-primary-content mb-2 font-semibold   p-2">
                Bank Account Details
              </legend>

              <input
                name="bankName"
                value={formData.bankName}
                placeholder="Bank Name"
                onChange={handleChange}
                className={inputStyle}
              />
              <input
                name="accountNumber"
                value={formData.accountNumber}
                placeholder="Account Number"
                onChange={handleChange}
                className={inputStyle}
              />
              <input
                name="ifscCode"
                value={formData.ifscCode}
                placeholder="IFSC Code"
                onChange={handleChange}
                className={inputStyle}
              />
            </fieldset>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding}
            className={`px-5 py-2.5 bg-primary text-primary-content rounded-xl hover:bg-primary/80 transition ${adding ? `disabled:opacity-50 disabled:cursor-not-allowed` : ""}`}
          >
            {adding ? "Submitting..." : "Register Employee"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMember;
