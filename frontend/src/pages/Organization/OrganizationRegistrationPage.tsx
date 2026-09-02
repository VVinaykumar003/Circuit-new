import OrganizationForm from "@/components/organization/OrganizationRegistrationForm";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function OrganizationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 md:p-6">
      <div
        className="
          relative
          w-full
          max-w-6xl
          bg-white
          rounded-2xl
          shadow-2xl
          overflow-hidden
          grid
          grid-cols-1
          lg:grid-cols-2
        "
      >
        {/* ================================
            MOBILE IMAGE
        ================================= */}
        <div
          className="
            lg:hidden
            relative
            w-full
            h-[280px]
            bg-gradient-to-br from-primary via-primary-content to-primary/40
            overflow-hidden
          "
        >
          <img
            src="/register_banner.png"
            alt="Circuit ERP registration"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* ================================
            DESKTOP LEFT IMAGE
        ================================= */}
        <div
          className="
            hidden
            lg:block
            relative
            w-full
            min-h-[720px]
            bg-gradient-to-br from-primary via-primary-content to-primary/40
            overflow-hidden
          "
        >
          <img
            src="/register_banner.png"
            alt="Circuit ERP registration"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* ================================
            RIGHT — REGISTRATION FORM
        ================================= */}
        <div
          className="
            bg-white
            relative
            z-10
            p-6
            md:p-10
            overflow-y-auto
            lg:max-h-[90vh]
            modern-scroll
          "
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 border-b pb-2">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                p-1.5
                hover:bg-gray-100
                rounded-full
                transition-colors
                text-gray-600
              "
              aria-label="Back to login"
            >
              <MdArrowBack size={24} />
            </button>

            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
              Create your account
            </h2>
          </div>

          <OrganizationForm />
        </div>
      </div>
    </div>
  );
}