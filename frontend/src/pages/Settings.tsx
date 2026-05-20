import { useState } from "react";

import CompanySettings from "@/components/settings/CompanySettings";

import SecuritySettings from "@/components/settings/SecuritySettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Button from "@/components/ui/Button";


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");

  const renderContent = () => {
    switch (activeTab) {
      case "security":
        return <SecuritySettings />;
    
      case "company":
        return <CompanySettings/>;
       case "appearance":
        return <AppearanceSettings/>;
      default:
        return null;
    }
  };
return (
  <div className="p-6 bg-base-100 text-base-content min-h-screen">
    <Breadcrumbs />

    <h1 className="text-2xl font-semibold mb-6">Settings</h1>

    {/* Tabs */}
    <div className="hidden md:block mb-6">
  <div className="bg-base-200 p-1 rounded-xl inline-flex gap-1">
    
    {/* SECURITY */}
    <button
      onClick={() => setActiveTab("security")}
      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
        ${
          activeTab === "security"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/70 hover:bg-base-100"
        }`}
    >
      Security
    </button>

    {/* COMPANY */}
    <button
      onClick={() => setActiveTab("company")}
      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
        ${
          activeTab === "company"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/70 hover:bg-base-100"
        }`}
    >
      Company
    </button>

    {/* APPEARANCE */}
    <button
      onClick={() => setActiveTab("appearance")}
      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
        ${
          activeTab === "appearance"
            ? "bg-primary text-primary-content shadow-sm"
            : "text-base-content/70 hover:bg-base-100"
        }`}
    >
      Appearance
    </button>
    
  </div>
</div>

    {/* Tab Content */}
    <div className="bg-base-100 p-6 rounded-xl border border-base-300 shadow-sm">
      {renderContent()}
    </div>
  </div>
);
}