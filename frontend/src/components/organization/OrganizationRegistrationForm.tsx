import { Building, User, MapPin, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { register } from "../../services/authService";
import { toast } from "react-toastify";

interface OrganizationFormData {
  ownerName: string;
  ownerEmail: string;
  name: string;
  email: string;
  password: string;
  registrationNumber: string;
  phoneNumber: string;
  address: {
    addressLine: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

type ErrorType = {
  [key: string]: string;
};

export default function OrganizationForm() {
  const [form, setForm] = useState<OrganizationFormData>({
    ownerName: "",
    ownerEmail: "",
    name: "",
    email: "",
    password: "",
    registrationNumber: "",
    phoneNumber: "",
    address: {
      addressLine: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
    },
  });

  const [errors, setErrors] = useState<ErrorType>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const input =
    "w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  const label = "text-xs text-gray-600 font-semibold mb-1 block";
  const errorText = "text-red-500 text-xs mt-1";
  const sectionTitle =
    "flex items-center gap-2 text-sm font-semibold text-primary mb-3";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "pincode" && !/^\d*$/.test(value)) return;

    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const validate = () => {
    const newErrors: ErrorType = {};

    if (!form.name.trim()) newErrors.name = "Organization name is required";

    if (!form.ownerName.trim())
      newErrors.ownerName = "Owner name is required";

    if (!form.ownerEmail.trim()) {
      newErrors.ownerEmail = "Owner email required";
    } else if (!/\S+@\S+\.\S+/.test(form.ownerEmail)) {
      newErrors.ownerEmail = "Invalid email";
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!/^\d{10}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    if (!/^\d{6}$/.test(form.address.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!form.address.addressLine.trim())
      newErrors.addressLine = "Address required";

    if (!form.address.city.trim()) newErrors.city = "City required";
    if (!form.address.state.trim()) newErrors.state = "State required";
    if (!form.address.country.trim()) newErrors.country = "Country required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const payload = {
        organizationName: form.name,
        organizationEmail: form.email,
        ownerName: form.ownerName,
        ownerEmail: form.ownerEmail,
        password: form.password,
        registrationNumber: form.registrationNumber,
        phoneNumber: form.phoneNumber,
        address: form.address,
      };

      const res = await register(payload);
  
      console.log("Success:", res.data);

     toast.success("Organization registered successfully! Please log in.");

      setForm({
        ownerName: "",
        ownerEmail: "",
        name: "",
        email: "",
        password: "",
        registrationNumber: "",
        phoneNumber: "",
        address: {
          addressLine: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        },
      });
    } catch (error: any) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
      {/* ORGANIZATION */}
      <div>
        <h3 className={sectionTitle}>
          <Building size={18} />
          Organization Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Organization Name *</label>
            <input
              name="name"
              className={input}
              placeholder="Enter organization name"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className={errorText}>{errors.name}</p>}
          </div>

          <div>
            <label className={label}>Organization Email</label>
            <input
              name="email"
              className={input}
              placeholder="organization@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={label}>Registration Number</label>
            <input
              name="registrationNumber"
              className={input}
              placeholder="Enter registration number"
              value={form.registrationNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={label}>Phone Number *</label>
            <input
              name="phoneNumber"
              maxLength={10}
              className={input}
              placeholder="10-digit phone number"
              value={form.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className={errorText}>{errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* OWNER */}
      <div>
        <h3 className={sectionTitle}>
          <User size={18} />
          Owner Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>Owner Name *</label>
            <input
              name="ownerName"
              className={input}
              placeholder="Owner full name"
              value={form.ownerName}
              onChange={handleChange}
            />
            {errors.ownerName && (
              <p className={errorText}>{errors.ownerName}</p>
            )}
          </div>

          <div>
            <label className={label}>Owner Email *</label>
            <input
              name="ownerEmail"
              className={input}
              placeholder="owner@example.com"
              value={form.ownerEmail}
              onChange={handleChange}
            />
            {errors.ownerEmail && (
              <p className={errorText}>{errors.ownerEmail}</p>
            )}
          </div>

          {/* PASSWORD */}
      
          <div className="relative">
  <label className={label}>Password *</label>

  <input
  type={showPassword ? "text" : "password"}
  name="password"
  className={`${input} pr-10`}
  value={form.password}
  onChange={handleChange}
/>

<button
  type="button"
  className="absolute bottom-3 right-4 flex items-center"
  onClick={() => setShowPassword(prev => !prev)}
>
  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
</button>
</div>
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <h3 className={sectionTitle}>
          <MapPin size={18} />
          Address Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className={label}>Address Line *</label>
            <input
              name="addressLine"
              className={input}
              placeholder="Street address, building name"
              value={form.address.addressLine}
              onChange={handleAddressChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="city"
              className={input}
              placeholder="City"
              value={form.address.city}
              onChange={handleAddressChange}
            />
            <input
              name="state"
              className={input}
              placeholder="State"
              value={form.address.state}
              onChange={handleAddressChange}
            />
            <input
              name="country"
              className={input}
              placeholder="Country"
              value={form.address.country}
              onChange={handleAddressChange}
            />
            <input
              name="pincode"
              maxLength={6}
              className={input}
              placeholder="6-digit pincode"
              value={form.address.pincode}
              onChange={handleAddressChange}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary/50 text-black py-3 md:py-3.5 text-sm md:text-base rounded-lg font-semibold hover:opacity-90 transition"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}