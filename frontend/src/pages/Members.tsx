

import { useEffect, useState } from "react";
import MemberCard from "@/components/members/MemberCard";
import type { Member } from "@/type/member";
import { getMembers, deleteMember } from "@/services/memberService";
// import { getOrganizationSlug } from "@/utils/auth";
import { useAuth } from "@/auth/AuthContext";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Pagination from "@/components/ui/Pagination";


// export const dummyMembers: Member[] = [
//   {
//     id: "1",
//     name: "John Watson",
//     email: "john@gmail.com",
//     role: "employee",
//     imgUrl: " ",
//     status: "active",
//     gender:"male",
//     phone:"123456789",
//     address:"maitri nagar,risali"
//   },
//   {
//     id: "2",
//     name: "Jane Doe",
//     email: "jane@gmail.com",
//     role: "admin",
//     imgUrl: "/user1.png",
//     status: "active",
//     gender:"female"
//   },
//   {
//     id: "3",
//     name: "Mike Ross",
//     email: "mike@gmail.com",
//     role: "employee",
//     imgUrl: "/user1.png",
//     status: "inactive",
//     gender:"male"
//   },
// ];

export default function Members() {
  const {auth} = useAuth();
   const slug = auth.slug;
   
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // const handleDelete = async (id: string) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete?");
  //   if (!confirmDelete) return;

  //   try {
     

  //     await deleteMember(slug, id);
      
  //     setMembers(prev => prev.filter(member => member._id !== id && member.id !== id));
  //   } catch (err) {
  //     console.error("Error deleting member:", err);
  //     alert("Failed to delete member");
  //   }
  // };



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
    <div className="p-4 sm:p-6 space-y-6">
      <Breadcrumbs  />
      <div className="flex justify-between items-center">
  <input
    type="text"
    placeholder="Search members..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full max-w-sm px-4 py-2 border border-primary/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 mt-3"
  />
</div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
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
