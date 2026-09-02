import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdArrowBack, MdCheckCircle, MdLockReset } from "react-icons/md";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Logo from "@/components/common/Logo";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSubmitted(true);
      toast.success("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      setError(err?.message || "Failed to request password reset. Please try again.");
      toast.error("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-md bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden p-6 sm:p-8">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo className="mb-4" />
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-2xl shadow-xs mb-3">
            <MdLockReset size={26} />
          </div>
          <h2 className="text-2xl font-extrabold text-base-content tracking-tight">
            Forgot Password?
          </h2>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-xs leading-relaxed">
            {submitted
              ? "Check your email for reset instructions"
              : "Enter your registered email address and we will send you a link to reset your password."}
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center text-center py-4 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center text-3xl shadow-inner">
              <MdCheckCircle size={38} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-base-content">
                Reset Link Sent!
              </h3>
              <p className="text-xs text-base-content/70">
                We've sent password reset instructions to:
              </p>
              <p className="text-sm font-semibold text-primary">{email}</p>
            </div>
            <p className="text-[11px] text-base-content/50 max-w-xs">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>

            <div className="pt-4 w-full space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
              >
                Try with different email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              error={error}
              leftIcon={<MdEmail size={18} />}
              autoFocus
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full shadow-md mt-2"
            >
              Send Reset Link
            </Button>

            <div className="pt-3 text-center border-t border-base-200">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
              >
                <MdArrowBack size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
