import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";

const LeadsHeading = () => {
  const navigate = useNavigate();

  const exportCSV = () => {
    console.log("Exporting CSV...");
  };

  return (
    <PageHeader
      title="Leads Management"
      breadcrumbs={[
        { label: "Dashboard" },
        { label: "Sales" },
        { label: "Leads", active: true },
      ]}
      showExport
      onExport={exportCSV}
      showRefresh
      onRefresh={() => window.location.reload()}
      actions={[
        {
          label: "Create Lead",
          icon: <MdAdd size={16} />,
          variant: "primary",
          onClick: () => navigate("/sales/leads/new"),
        },
      ]}
    />
  );
};

export default LeadsHeading;