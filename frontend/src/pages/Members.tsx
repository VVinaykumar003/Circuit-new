import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberCard from "@/components/members/MemberCard";
import type { Member } from "@/type/member";
import { getMembers, deleteMember } from "@/services/memberService";
import { useAuth } from "@/auth/useAuth";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/Pagination";
import { PageHeader, StatsGrid } from "@/components/common";
import { MdAdd, MdPeople, MdAdminPanelSettings, MdCheckCircle } from "react-icons/md";


export default function Members() {
  const navigate = useNavigate();
  const {auth} = useAuth();
  const slug = auth.slug;
   
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;





  const handleDelete = async (id: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return;

  try {
    await deleteMember(slug, id);

    setMembers((prev) =>
      prev.filter((member) => member._id !== id && member.id !== id)
    );
toast.success("Member deleted successfully");
  } catch (err) {
    console.error("Error deleting member:", err);

    // ❌ error popup
    toast.error("Failed to delete member. Please try again.");
  }
};
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const members = await getMembers(slug);
        //   backend call
       
       
        setMembers(members.data?.members);

      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to fetch members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredMembers = members.filter((member) =>
  member.name.toLowerCase().includes(search.toLowerCase()) ||
  member.email.toLowerCase().includes(search.toLowerCase())
);

  if (loading) return<div className="flex flex-col justify-center items-center h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-4 text-lg font-medium text-base-content/70">Loading Member...</p>
      </div>;
  if (error) return <p>{error}</p>;

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE) || 1;
  const validPage = Math.min(page, totalPages);
  const paginatedMembers = filteredMembers.slice(
    (validPage - 1) * ITEMS_PER_PAGE,
    validPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <PageHeader
        title="Team Directory"
        breadcrumbs={[
          { label: "Dashboard" },
          { label: "Team Members", active: true },
        ]}
        actions={[
          {
            label: "Add Member",
            icon: <MdAdd size={16} />,
            variant: "primary",
            onClick: () => navigate("/employees/add "),
          },
        ]}
      />

      <StatsGrid
        columns={{ default: 2, sm: 2, md: 4 }}
        stats={[
          {
            label: "Total Members",
            value: members.length,
            icon: <MdPeople size={18} />,
            color: "text-base-content",
          },
          {
            label: "Admins",
            value: members.filter(
              (m) =>
                m.role?.toLowerCase() === "admin" ||
                m.role?.toLowerCase() === "owner",
            ).length,
            icon: <MdAdminPanelSettings size={18} />,
            color: "text-primary",
          },
          {
            label: "Active",
            value: members.filter(
              (m) => m.status?.toLowerCase() === "active" || !m.status,
            ).length,
            icon: <MdCheckCircle size={18} />,
            color: "text-success",
          },
          {
            label: "Filtered Results",
            value: filteredMembers.length,
            icon: <MdPeople size={18} />,
            color: "text-info",
          },
        ]}
      />

      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm max-w-sm px-3 py-1.5 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 bg-base-100"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {paginatedMembers.map((member) => (
          <MemberCard key={member._id} member={member} isAdmin={true} onDelete={handleDelete} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={validPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
