import React from "react";
import { useNavigate } from "react-router-dom";
import { MdShield, MdArrowBack, MdDashboard, MdLogout } from "react-icons/md";
import Button from "@/components/common/Button";
import { useAuth } from "@/auth/useAuth";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-lg bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden p-8 text-center flex flex-col items-center animate-fade-in">
        {/* Shield Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-error/10 text-error border border-error/20 flex items-center justify-center text-4xl shadow-inner mb-6">
          <MdShield size={44} />
        </div>

        {/* Status & Title */}
        <span className="badge badge-error badge-sm text-white font-bold uppercase tracking-wider mb-2">
          403 Forbidden
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight mb-2">
          Access Denied
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 max-w-sm leading-relaxed mb-6">
          You do not have the required permissions or role privileges to view this page. If you believe this is an error, please contact your administrator.
        </p>

        {/* User Context Details */}
        {auth.user && (
          <div className="w-full bg-base-200/60 rounded-2xl p-4 mb-6 border border-base-300/80 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-base-content/50 font-medium">Current User:</span>
              <span className="font-bold text-base-content">{auth.user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/50 font-medium">Assigned Role:</span>
              <span className="font-bold capitalize text-primary">{auth.user.role || "Employee"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/50 font-medium">Department:</span>
              <span className="font-bold capitalize text-base-content">{auth.user.department || "General"}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            leftIcon={<MdArrowBack size={16} />}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/")}
            leftIcon={<MdDashboard size={16} />}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            leftIcon={<MdLogout size={16} />}
            className="text-error hover:bg-error/10"
          >
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  );
}
