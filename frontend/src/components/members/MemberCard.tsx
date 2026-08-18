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
//  console.log("Rendering MemberCard for:", member); 
//   return (
//     <div
//       onClick={() => navigate(`/members/${member._id}`)}
//       className="max-w-[400px] group relative bg-base-100 rounded-xl shadow-md hover:shadow-lg border-2 border-primary/40 w-full overflow-hidden transition-all duration-200 flex flex-col cursor-pointer"
//     >
//       {/* Header */}
//       <div className="h-16 bg-primary  relative">
//         <span
//           className={`absolute top-2 right-2 text-[10px] uppercase px-3 py-1 rounded-full font-semibold
//             ${
//               member.status === "active"
//                 ? "bg-success text-white"
//                 : "bg-base-300 text-base-content/60"
//             }`}
//         >
//           {member.status}
//         </span>
//       </div>

//       {/* Body */}
//       <div className="px-4 pb-4 flex flex-col  flex-1">
//         {/* Avatar */}
//         <div className="relative -mt-8 mb-2">
//           <img
//             src={
//               (member.imageUrl || member.imgUrl)?.trim()
//                 ? member.imageUrl || member.imgUrl
//                 : "/user1.png"
//             }
//             alt={member.name}
//             className="w-16 h-16 rounded-full border-2 border-base-100 object-cover bg-base-200 shadow-sm"
//           />
//           <span
//             className={`absolute bottom-0.5 left-0.5 w-3 h-3 rounded-full border border-base-100
//               ${
//                 member.status === "active" ? "bg-success" : "bg-base-content/40"
//               }`}
//           />
//         </div>

//         {/* Info */}
//         <h2 className="text-base-content text-md font-semibold truncate w-full ">
//           {member.name}
//         </h2>

//         <p className="text-sm text-base-content truncate w-full  mb-2.5">
//           {member.email}
//         </p>
//         <div className="flex items-center justify-between gap-2 mb-3 text-sm text-base-content/80">
//   <p className="truncate">
//     📞 {member.phone || "No phone"}
//   </p>

//   <p className="capitalize whitespace-nowrap">
//     {member.gender || "N/A"}
//   </p>
// </div>
//         {/* Role */}
//         <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-base-200 text-base-content/70 capitalize">
//           {member.role === "admin" ? (
//             <MdOutlineAdminPanelSettings className="text-error" size={14} />
//           ) : (
//             <MdOutlinePersonOutline className="text-primary" size={14} />
//           )}
//           <span
//             className={member.role === "admin" ? "text-error" : "text-primary"}
//           >
//             {member.role}
//           </span>
//         </div>

//         {/* Actions */}
//         {isAdmin && (
//           <div className="flex gap-2 w-full mt-3">
//             {/* <button
//               onClick={() => navigate(`/members/${member._id}`)}
//               className="flex-1 py-1.5 text-xs font-medium bg-primary text-primary-content rounded-lg hover:bg-primary/90"
//             >
//               Manage
//             </button> */}

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onDelete?.(member._id);
//               }}
//               className="flex-1 py-1.5 text-xs  font-bold bg-error text-white rounded-lg   cursor-pointer mt-3.5"
//             >
//               Delete
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );



return (
  <div
    onClick={() => navigate(`/members/${member._id}`)}
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
            (member.imageUrl || member.imgUrl)?.trim()
              ? member.imageUrl || member.imgUrl
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
