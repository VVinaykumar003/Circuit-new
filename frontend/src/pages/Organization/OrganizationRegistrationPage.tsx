import OrganizationForm from "@/components/organization/OrganizationRegistrationForm";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";




export default function OrganizationPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center  p-4 md:p-6">

      <div className="relative w-full max-w-6xl bg-gradient-r-to-br from-primary via-primary-content to-primary/40 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
              
        {/* MOBILE TOP BANNER */}
        <div className="lg:hidden relative  bg-gradient-to-br from-primary via-primary-content to-primary/40  text-white flex flex-col justify-center items-center text-center py-10 px-6 overflow-hidden">

          <div className="z-10 max-w-xs">
            <h2 className="text-2xl font-semibold mb-3">
              Welcome
            </h2>

            <p className="text-sm opacity-90">
              Create your organization account and start managing
              employees, projects and payroll in one place.
            </p>
          </div>

        </div>

        {/* DESKTOP LEFT PANEL */}
        <div className="hidden lg:flex relative shapedividers_com-4472 bg-gradient-to-br from-primary  to-primary/40 text-white flex-col justify-center items-center text-center overflow-hidden">
 

          <div className="z-10 max-w-xs">
            <h2 className="text-3xl font-semibold mb-4">
              Welcome
            </h2>

            <p className="text-sm opacity-90">
              Create your organization account and start managing
              employees, projects and payroll in one place.
            </p>
          </div>

        </div>

        {/* RIGHT PANEL */}
        <div className="bg-white relative z-10 p-6 md:p-10 overflow-y-auto md:max-h-[90vh] modern-scroll">

          <div className="flex items-center gap-3 mb-6 border-b pb-2">
            <button
              onClick={() => navigate("/login")}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
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