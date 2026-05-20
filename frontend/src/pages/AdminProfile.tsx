import { useEffect, useState } from 'react';
import AdminRightSection from '@/components/admin/AdminRightSection';
import ProfileSidebar from '@/components/members/ProfileSidebar'
import { useAuth } from '@/auth/AuthContext';
import { getMemberById } from '@/services/memberService';
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import type { Member } from "@/type/member";
import MemberRightSection from '@/components/members/MemberRightSection';

const AdminProfile = () => {

  const { auth } = useAuth();
  const user = auth?.user || {};
  const id = user.userId;
  const slug = auth?.slug;
  const [admin, setAdmin] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!slug || !id) return;
      try {
        setLoading(true);
        const response = await getMemberById(slug, id);
        const foundAdmin = response?.data?.member || response?.data || response;
        if (foundAdmin) {
          setAdmin(foundAdmin?.user || foundAdmin);
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [id, slug]);

  if (loading) return <div className="p-6 flex justify-center">Loading...</div>;
  if (!admin) return <div className="p-6 flex justify-center text-gray-500">Admin not found</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Breadcrumbs />
      <div className='flex flex-col md:flex-row gap-6'>
        <ProfileSidebar member={admin} />
               <MemberRightSection memberId={id} />
       
      </div>
    </div>
  )
}

export default AdminProfile;