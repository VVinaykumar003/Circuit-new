import type { Member } from "@/type/member";
import { useNavigate } from "react-router";

import {
  ShieldCheck,
  User,
  Phone,
  Mail,

} from "lucide-react";
type MemberCardProps = {
  member: Member;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
};


const MemberCard = ({ member, isAdmin, onDelete }: MemberCardProps) => {
  const navigate = useNavigate();



return (
  <div
    onClick={() => navigate(`/profile/${member._id}`)}
    className="
group relative
w-full max-w-[300px]
overflow-hidden
rounded-xl
border border-primary/30
bg-base-100
shadow-sm
hover:shadow-md
transition
cursor-pointer
"
  >
    {/* Header */}
    <div className="h-14 bg-primary/90 relative">
      <div className="absolute top-2 right-2 flex items-center gap-1">
        
        {/* Status */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide
          ${
            member.status === "active"
              ? "bg-success text-white"
              : "bg-base-300 text-base-content/70"
          }`}
        >
         
          {member.status}
        </div>

        {/* Role */}
        <div className="flex items-center gap-1 rounded-full bg-base-100/90 px-2 py-0.5 text-[9px] font-semibold capitalize">
          {member.role === "admin" ? (
            <ShieldCheck className="text-error" size={11} />
          ) : (
            <User className="text-primary" size={11} />
          )}

          <span
            className={
              member.role === "admin"
                ? "text-error"
                : "text-primary"
            }
          >
            {member.role}
          </span>
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="px-3 pb-3 flex flex-col">
      
      {/* Avatar */}
      <div className="relative -mt-7 mb-2 w-fit">
        <img
          src={
            (member.imageUrl )?.trim()
              ? member.imageUrl 
              : "/user1.png"
          }
          alt={member.name}
        className="
w-14 h-14
rounded-full
border-2 border-base-100
object-cover
shadow
"
        />
      </div>

      {/* Name */}
      <h2 className="text-sm font-bold text-base-content truncate">
        {member.name}
      </h2>

      {/* Email */}
      <div className="flex items-center gap-1.5 text-xs text-base-content/70 mt-1 mb-2">
        <Mail size={12} />
        <p className="truncate">{member.email}</p>
      </div>

      {/* Phone */}
      <div className="flex items-center gap-1.5 text-xs text-base-content/70 mb-2">
        <Phone size={12} />
        <p>{member.phone || "No phone number"}</p>
      </div>

      {/* Gender */}
      <div className="flex items-center gap-1.5 text-xs text-base-content/70 capitalize mb-3">
        <User size={12} />
        <p>{member.gender || "Not specified"}</p>
      </div>

      {/* Delete */}
      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(member._id);
          }}
          className="mt-auto rounded-lg bg-error py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02]"
        >
          Delete Member
        </button>
      )}
    </div>
  </div>
);

};
export default MemberCard;
