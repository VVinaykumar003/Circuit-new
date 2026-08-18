import { useAuth } from '@/auth/AuthContext';
import ProfileSidebar from '@/components/members/ProfileSidebar';
import { getMemberById } from '@/services/memberService';
import type { Member } from '@/type/member';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const SalesMemberProfile = () => {
   const { id } = useParams();
  const {auth} = useAuth();
  const slug = auth.slug;
  const [member, setMember] = useState<Member | null>(null);
 
const navigate = useNavigate();
  useEffect(() => {
    const fetchMember = async () => {
      
      try {
        const response = await getMemberById(slug, id);
        // Note: Depending on your API, the member data might be nested inside response.data
        const foundMember = response?.data?.member || response?.data || response;
        
        if (foundMember) {
          setMember(foundMember?.user || foundMember); // Adjust based on actual API response structure
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
      }
    };

    fetchMember();
  }, [id]);



  if (!member) return <p>Member not found</p>;

  return (
   <div className="flex flex-col lg:flex-column xl:flex-row gap-4 sm:gap-6 px-3 sm:px-4 lg:px-6 xl:px-7 py-4">
      <div>
       <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-primary hover:bg-primary/90 text-primary-content"
      >
        <ArrowLeft size={16} />
      
      </button>
      </div>
      <ProfileSidebar member={member} />

      
    </div>
  )
}

export default SalesMemberProfile