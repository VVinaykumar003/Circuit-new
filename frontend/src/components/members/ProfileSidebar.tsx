// import { useEffect, useState } from "react";
// import type { Member } from "../../type/member";
// import {
//   Mail,
//   User,
//   Calendar,
//   CheckCircle,
//   Edit2Icon,
//   SaveIcon,
//   MapPin,
// } from "lucide-react";

// interface Props {
//   member: Member;
//   onUpdate?: (updatedMember: Member) => void;
// }

// export default function ProfileSidebar({ member, onUpdate }: Props) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState<Member>(member);
//   useEffect(() => {
//     setFormData(member);
//   }, [member]);

//   const handleEditToggle = () => setIsEditing(!isEditing);

//   const handleChange = (field: keyof Member, value: string) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSave = () => {
//     setIsEditing(false);
//     onUpdate?.(formData);
//   };

//   return (
//     <div className="w-full md:w-[320px] shrink-0">
//       <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
//         {/* COVER */}
//         <div className="relative h-28 bg-sky-200 rounded-t-xl">
//           <button
//             onClick={isEditing ? handleSave : handleEditToggle}
//             className="cursor-pointer absolute top-3 right-3 bg-amber-50 text-amber-600 px-1 py-1 rounded-full text-xs font-medium "
//           >
//             {isEditing ? <SaveIcon size={14} /> : <Edit2Icon size={14} />}
//           </button>
//         </div>

//         {/* AVATAR */}
//         <div className="relative flex justify-center -mt-12">
//           <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
//             {formData?.imgUrl?.trim() ? (
//               <img
//                 src={formData.imgUrl}
//                 alt={formData.name || "User"}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-3xl font-semibold text-gray-400">
//                 {(formData?.name?.[0] || "?").toUpperCase()}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* CONTENT */}
//         <div className="px-6 py-4">
//           {/* NAME */}
//           <div className="text-center">
//             {isEditing ? (
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => handleChange("name", e.target.value)}
//                 className="input input-bordered w-full text-center text-lg font-semibold mb-2"
//               />
//             ) : (
//               <h2 className="text-lg font-semibold">{formData.name}</h2>
//             )}

//             {/* ROLE */}
//             {isEditing ? (
//               <input
//                 type="text"
//                 value={formData.role || ""}
//                 onChange={(e) => handleChange("role", e.target.value)}
//                 className="input input-bordered w-full text-center text-sm mb-2"
//               />
//             ) : (
//               formData.role && (
//                 <span className="inline-block rounded-lg bg-blue-100 px-3 py-0.5 text-xs text-blue-600 mt-1 capitalize">
//                   {formData.role}
//                 </span>
//               )
//             )}
//           </div>

//           {/* BASIC INFO */}
//           <h3 className="mt-6 mb-3 text-sm font-semibold text-gray-600">
//             Basic Information
//           </h3>

//           <div className="space-y-4 text-sm">
//             {/* EMAIL */}
//             {isEditing ? (
//               <input
//                 type="email"
//                 value={formData.email || ""}
//                 onChange={(e) => handleChange("email", e.target.value)}
//                 className="input input-bordered w-full"
//               />
//             ) : (
//               formData.email && (
//                 <div className="flex items-center gap-3">
//                   <Mail size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Email</p>
//                     <p className="font-medium">{formData.email}</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {/* JOINED AT */}
//             {isEditing ? (
//               <input
//                 type="date"
//                 value={formData.joinedAt || ""}
//                 onChange={(e) => handleChange("joinedAt", e.target.value)}
//                 className="input input-bordered w-full"
//               />
//             ) : (
//               formData.joinedAt && (
//                 <div className="flex items-center gap-3">
//                   <Calendar size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Joined At</p>
//                     <p className="font-medium">{formData.joinedAt}</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {/* STATUS */}
//             {isEditing ? (
//               <select
//                 value={formData.status || ""}
//                 onChange={(e) => handleChange("status", e.target.value)}
//                 className="input input-bordered w-full"
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             ) : (
//               formData.status && (
//                 <div className="flex items-center gap-3">
//                   <CheckCircle size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Status</p>
//                     <p className="font-medium capitalize">{formData.status}</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {/* GENDER */}
//             {isEditing ? (
//               <select
//                 value={formData.gender || ""}
//                 onChange={(e) => handleChange("gender", e.target.value)}
//                 className="input input-bordered w-full"
//               >
//                 <option value="">Select Gender</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             ) : (
//               formData.gender && (
//                 <div className="flex items-center gap-3">
//                   <User size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Gender</p>
//                     <p className="font-medium capitalize">{formData.gender}</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {/* PHONE */}
//             {isEditing ? (
//               <input
//                 type="tel"
//                 maxLength={10}
//                 value={formData.phone || ""}
//                 onChange={(e) => {
//                   const value = e.target.value.replace(/\D/g, "");
//                   handleChange("phone", value);
//                 }}
//                 className="input input-bordered w-full"
//               />
//             ) : (
//               formData.phone && (
//                 <div className="flex items-center gap-3">
//                   <User size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Phone</p>
//                     <p className="font-medium">{formData.phone}</p>
//                   </div>
//                 </div>
//               )
//             )}

//             {isEditing ? (
//               <input
//                 className="input input-bordered w-full"
//                 type="text"
//                 value={formData.address}
//                 onChange={(e) => handleChange("address", e.target.value)}
//               />
//             ) : (
//               formData.address && (
//                 <div className="flex items-center gap-3">
//                   <MapPin size={16} className="text-gray-400" />
//                   <div>
//                     <p className="text-xs text-gray-400">Address</p>
//                     <p className="font-medium">{formData.address}</p>
//                   </div>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import type { Member } from "../../type/member";
import {
  Mail,
  User,
  Calendar,
  CheckCircle,
  Edit2Icon,
  SaveIcon,
  MapPin,
} from "lucide-react";
import { updateMember } from "@/services/memberService";
import { toast } from "react-toastify";
import { getOrganizationSlug } from "@/utils/auth";
import { useAuth } from "@/auth/AuthContext";
import { uploadImage } from "@/services/uploadService";

interface Props {
  member: Member;
  onUpdate?: (updatedMember: Member) => void;
}

export default function ProfileSidebar({ member, onUpdate }: Props) {
  const { auth } = useAuth();
  const slug = auth?.slug;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Member>(member);
  const [isUploading, setIsUploading] = useState(false);



  useEffect(() => {
    setFormData(member);
  }, [member]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (field: keyof Member, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    // const targetId = member._id || (member as any).userId || member.id;

    // Remove immutable identifier fields to prevent MongoDB errors during update
    const { _id, ...payload } = formData as any;
 


    updateMember(slug, _id , payload)
      .then((response) => {
        toast.success("Member updated successfully");
        setIsEditing(false);
        onUpdate?.(response.data); // Pass the updated data from backend
      })
      .catch((error) => {
        toast.error("Error updating member",error);
        console.error("Error updating member:", error);
      });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imgUrl = await uploadImage(file);
      // Update both properties to handle any frontend mismatches safely
      setFormData((prev) => ({ ...prev, imageUrl: imgUrl}));
    } catch (error) {
      toast.error("Failed to upload image", error );
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full md:w-[320px] shrink-0">
      <div className="bg-base-100 border border-base-300 rounded-xl shadow-md overflow-hidden">

        {/* COVER */}
        <div className="relative h-28 bg-primary rounded-t-xl">
          <button
            onClick={isEditing ? handleSave : handleEditToggle}
            className="cursor-pointer absolute top-3 right-3 bg-base-100 text-base-content p-2 rounded-full shadow"

          >
            {isEditing ? <SaveIcon size={14} /> : <Edit2Icon size={14} />}
          </button>
        </div>

        {/* AVATAR */}
        <div className="relative flex justify-center -mt-12">
          <div className="w-24 h-24 rounded-full bg-base-100 border-4 border-base-100 shadow-lg flex items-center justify-center overflow-hidden relative group">
            {(formData?.imageUrl || formData?.imgUrl)?.trim() ? (
              <img
                src={formData.imageUrl || formData.imgUrl}
                alt={formData.name || "User"}
                className={`w-full h-full object-cover ${isUploading ? "opacity-50" : ""}`}
              />
            ) : (
              <span className="text-3xl font-semibold text-base-content/40">
                {(formData?.name?.[0] || "?").toUpperCase()}
              </span>
            )}

            {isEditing && (
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                <Edit2Icon size={16} className="mb-1" />
                {isUploading ? "..." : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-4">

          {/* NAME */}
          <div className="text-center">
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="input input-bordered w-full text-center text-lg font-semibold mb-2"
              />
            ) : (
              <h2 className="text-lg font-semibold text-base-content">
                {formData.name}
              </h2>
            )}

            {/* ROLE */}
            {isEditing ? (
              <input
                type="text"
                value={formData.role || ""}
                onChange={(e) => handleChange("role", e.target.value)}
                className="input input-bordered w-full text-center text-sm mb-2"
              />
            ) : (
              formData.role && (
                <span className="inline-block rounded-lg bg-primary/20 px-3 py-0.5 text-xs text-primary mt-1 capitalize">
                  {formData.role}
                </span>
              )
            )}
          </div>

          {/* BASIC INFO */}
          <h3 className="mt-6 mb-3 text-sm font-semibold text-base-content/70">
            Basic Information
          </h3>

          <div className="space-y-4 text-sm">

            {/* EMAIL */}
            {isEditing ? (
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="input input-bordered w-full"
              />
            ) : (
              formData.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Email</p>
                    <p className="font-medium text-base-content">
                      {formData.email}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* JOINED AT */}
            {isEditing ? (
              <input
                type="date"
                value={formData.joinedAt || ""}
                onChange={(e) => handleChange("joinedAt", e.target.value)}
                className="input input-bordered w-full"
              />
            ) : (
              formData.joinedAt && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Joined At</p>
                    <p className="font-medium text-base-content">
                      {formData.joinedAt}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* STATUS */}
            {isEditing ? (
              <select
                value={formData.status || ""}
                onChange={(e) => handleChange("status", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            ) : (
              formData.status && (
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Status</p>
                    <p className="font-medium capitalize text-base-content">
                      {formData.status}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* GENDER */}
            {isEditing ? (
              <select
                value={formData.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              formData.gender && (
                <div className="flex items-center gap-3">
                  <User size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Gender</p>
                    <p className="font-medium capitalize text-base-content">
                      {formData.gender}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* PHONE */}
            {isEditing ? (
              <input
                type="tel"
                maxLength={10}
                value={formData.phone || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleChange("phone", value);
                }}
                className="input input-bordered w-full"
              />
            ) : (
              formData.phone && (
                <div className="flex items-center gap-3">
                  <User size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Phone</p>
                    <p className="font-medium text-base-content">
                      {formData.phone}
                    </p>
                  </div>
                </div>
              )
            )}

            {/* ADDRESS */}
            {isEditing ? (
              <input
                className="input input-bordered w-full"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            ) : (
              formData.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-base-content/40" />
                  <div>
                    <p className="text-xs text-base-content/50">Address</p>
                    <p className="font-medium text-base-content">
                      {formData.address}
                    </p>
                  </div>
                </div>
              )
            )}

          </div>
        </div>
      </div>
    </div>
  );
}