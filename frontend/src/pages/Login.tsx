import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import loginAnimation from "../assets/loginAnimation.json";
import { LockIcon, User2Icon } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login as loginService } from "../services/authService";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import Button from "@/components/ui/Button";
import { socket } from "@/services/socket";

interface LoginProps {
  setToken?: React.Dispatch<React.SetStateAction<string>>;
}

const Login = ({ setToken }: LoginProps) => {
  const navigate = useNavigate();
  const { login: contextLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("All fields are required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await loginService(formData);

      toast.success("Login successful");

      // Determine payload structure checking for `user` instead of `token`
      const payload = response.data?.user ? response.data : response.data?.data;

      // Proceed if user data is successfully returned
      if (payload && payload.user) {
        // ✅ Save the full user details so other components (like Dashboards) can access it
        localStorage.setItem("user", JSON.stringify(payload.user || {}));
        
        // ✅ Only set token if it actually exists in the response (Fallback for non-cookie setups)
        if (payload.token) {
          localStorage.setItem("token", payload.token);
          if (setToken) setToken(payload.token);
        }

        socket.emit("joinUserRoom", payload.user.id); // Join the user's personal notification room

        // ✅ Update AuthContext global state correctly
        contextLogin({ 
          user: payload.user,
          slug: payload.slug || payload.user?.slug || payload.user?.organization?.slug,
        });

        // Navigate to the dashboard upon successful login
        navigate("/", { replace: true });
      }

      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-5xl bg-blue-200 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT */}
        <div className="w-full md:w-1/2 bg-blue-100 flex items-center justify-center p-10">
          <Lottie animationData={loginAnimation} loop className="w-[350px]" />
        </div>

        {/* RIGHT */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-primary to-primary/40 p-12 flex flex-col justify-center text-white">
          <h1 className="text-4xl font-bold mb-2 tracking-wide">Welcome Back</h1>
          <p className="text-blue-200 text-sm mb-6">
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm text-primary-content  mb-1">Email</label>
              <div className="relative">
                <User2Icon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50 text-primary"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 placeholder-blue-200 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-primary-content mb-4">Password</label>
              <div className="relative">
                <LockIcon
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50 text-primary"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-gray-50 text-black focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-indigo-500 transition pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-content text-black px-6 py-3 rounded-lg font-semibold hover:bg-primary-content/80 hover:scale-[1.02] transition-all duration-200 disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-blue-200">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/organizationRegister")}
              className="text-white font-semibold hover:underline transition-all cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;