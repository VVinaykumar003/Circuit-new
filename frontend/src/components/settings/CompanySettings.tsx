import { useState } from "react";
import { toast } from "react-toastify";

const CompanySettings = () => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    const { name, address, startTime, endTime } = form;

    if (!name || !address || !startTime || !endTime) {
      return setError("All fields are required");
    }

    try {
      setLoading(true);

      //  FUTURE API
    

      setTimeout(() => {
       toast.success("Company updated successfully");

        setLoading(false);
      }, 1000);

    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
  <div className="space-y-6 max-w-md">
    <h2 className="text-lg font-semibold text-base-content">
      Company Information
    </h2>

    <input
      type="text"
      name="name"
      placeholder="Company Name"
      value={form.name}
      onChange={handleChange}
      className="input input-bordered border w-full"
    />

    <input
      type="text"
      name="address"
      placeholder="Office Address"
      value={form.address}
      onChange={handleChange}
      className="input input-bordered border w-full"
    />

    <div className="flex gap-4">
      <input
        type="time"
        name="startTime"
        value={form.startTime}
        onChange={handleChange}
        className="input input-bordered border w-full"
      />

      <input
        type="time"
        name="endTime"
        value={form.endTime}
        onChange={handleChange}
        className="input input-bordered border w-full"
      />
    </div>

    {error && (
      <p className="text-error text-sm">{error}</p>
    )}

    <button
      onClick={handleSubmit}
      disabled={loading}
      className="btn btn-primary w-full"
    >
      {loading ? "Saving..." : "Save Changes"}
    </button>
  </div>
);
};

export default CompanySettings;