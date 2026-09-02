import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdHome, MdArrowBack, MdSearch, MdExplore } from "react-icons/md";
import Button from "@/components/common/Button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-lg bg-base-100 rounded-3xl shadow-2xl border border-base-300 overflow-hidden p-8 text-center flex flex-col items-center animate-fade-in">
        {/* Visual 404 Badge */}
        <div className="relative mb-6">
          <div className="text-7xl sm:text-9xl font-black bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent opacity-80 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-base-100/90 shadow-md border border-base-300 flex items-center justify-center text-primary text-2xl backdrop-blur-xs">
              <MdExplore size={28} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-base-content/60 max-w-sm leading-relaxed mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        {/* Quick Links / Actions */}
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
            leftIcon={<MdHome size={16} />}
          >
            Go to Home
          </Button>
        </div>

        {/* Help text */}
        <div className="mt-8 pt-6 border-t border-base-200 w-full text-center">
          <span className="text-xs text-base-content/50">
            Need assistance? Contact your organization administrator or{" "}
            <Link to="/settings" className="text-primary font-semibold hover:underline">
              check settings
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
