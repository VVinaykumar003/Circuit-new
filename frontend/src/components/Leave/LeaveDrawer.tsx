// import { useState } from "react";
// import { MdClose, MdDelete } from "react-icons/md";
// import type { LeaveRequest } from "@/type/leave";
// import Button from "@/components/ui/Button";

// interface Props {
//   leave: LeaveRequest | null;
//   onClose: () => void;
//   onUpdate: (leave: LeaveRequest) => void;
//   mode?: "edit" | "view";
// }

// export default function LeaveDrawer({
//   leave,
//   onClose,
//   onUpdate,
//   mode = "view",
// }: Props) {
//   if (!leave) return null;

//   const [edited, setEdited] = useState({
//     ...leave,
//     attachments: leave.attachments || [],
//   });

//   /* ================= ADD ATTACHMENT ================= */
//   const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return;

//     const newFiles = Array.from(e.target.files);

//     setEdited((prev) => ({
//       ...prev,
//       attachments: [...prev.attachments, ...newFiles],
//     }));
//   };

//   /* ================= REMOVE FILE ================= */
//   const removeFile = (index: number) => {
//     setEdited((prev) => ({
//       ...prev,
//       attachments: prev.attachments.filter((_, i) => i !== index),
//     }));
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
//       <div className="w-full max-w-md bg-base-100 h-full shadow-xl p-6 overflow-y-auto">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold">Leave Details</h3>
//           <button onClick={onClose} className="btn btn-sm btn-ghost">
//             <MdClose size={18} />
//           </button>
//         </div>

//         <div className="space-y-5">
//           {/* TYPE */}
//           <div>
//             <label className="text-xs text-base-content/60">Type</label>
//             <input
//               value={edited.type}
//               readOnly={mode === "view"}
//               onChange={(e) =>
//                 setEdited({
//                   ...edited,
//                   type: e.target.value,
//                 })
//               }
//               className={`input input-bordered w-full ${
//                 mode === "view" ? "bg-base-200 cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           {/* FROM */}
//           <div>
//             <label className="text-xs text-base-content/60">From Date</label>
//             <input
//               value={edited.fromDate}
//               readOnly={mode === "view"}
//               onChange={(e) =>
//                 setEdited({
//                   ...edited,
//                   fromDate: e.target.value,
//                 })
//               }
//               className={`input input-bordered w-full ${
//                 mode === "view" ? "bg-base-200 cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           {/* TO */}
//           <div>
//             <label className="text-xs text-base-content/60">To Date</label>
//             <input
//               value={edited.toDate}
//               readOnly={mode === "view"}
//               onChange={(e) =>
//                 setEdited({
//                   ...edited,
//                   toDate: e.target.value,
//                 })
//               }
//               className={`input input-bordered w-full ${mode === "view" ? "bg-base-200 cursor-not-allowed" : ""}`}
//             />
//           </div>

//           {/* REASON */}
//           <div>
//             <label className="text-xs text-base-content/60">Reason</label>
//             <textarea
//               value={edited.reason}
//               readOnly={mode === "view"}
//               onChange={(e) =>
//                 setEdited({
//                   ...edited,
//                   reason: e.target.value,
//                 })
//               }
//               className={`textarea textarea-bordered w-full ${
//                 mode === "view" ? "bg-base-200 cursor-not-allowed" : ""
//               }`}
//             />
//           </div>

//           {/* ================= ATTACHMENTS ================= */}
//           <div>
//             <label className="text-xs text-base-content/60">Attachments</label>

//             {/* Existing Files */}
//             {edited.attachments.length > 0 ? (
//               <div className="space-y-3 mt-2">
//                 {edited.attachments.map((file: any, index: number) => {
//                   const isImage = file.type?.startsWith("image/");

//                   return (
//                     <div
//                       key={index}
//                       className="border rounded-lg p-3 flex items-center justify-between"
//                     >
//                       <div className="flex items-center gap-3">
//                         {isImage ? (
//                           <img
//                             src={URL.createObjectURL(file)}
//                             alt="preview"
//                             className="w-12 h-12 object-cover rounded-md"
//                           />
//                         ) : (
//                           <div className="w-12 h-12 bg-base-200 flex items-center justify-center rounded-md text-xs">
//                             FILE
//                           </div>
//                         )}

//                         <div className="text-sm truncate max-w-[150px]">
//                           {file.name}
//                         </div>
//                       </div>

//                       {mode === "edit" && (
//                         <button
//                           onClick={() => removeFile(index)}
//                           className="btn btn-xs btn-error btn-outline"
//                         >
//                           <MdDelete size={14} />
//                         </button>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <p className="text-xs text-base-content/50 mt-1">
//                 No attachments
//               </p>
//             )}

//             {/* Add New */}
//             {mode === "edit" && (
//               <input
//                 type="file"
//                 multiple
//                 onChange={handleAddFiles}
//                 className={`file-input file-input-bordered w-full mt-3 ${
//                   mode === "view" ? "cursor-not-allowed" : ""
//                 }`}
//               />
//             )}
//           </div>

//           {/* SAVE */}
//           {mode === "edit" && (
//             <Button
//               variant="primary"
//               onClick={() => {
//                 onUpdate(edited);
//                 onClose();
//               }}
//             >
//               Save Changes
//             </Button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { MdClose, MdDelete } from "react-icons/md";
import type { LeaveRequest } from "@/type/leave";
import Button from "@/components/ui/Button";

interface Props {
  leave: LeaveRequest | null;
  onClose: () => void;
  onUpdate?: (leave: LeaveRequest) => void;
  mode?: "edit" | "view";
}

export default function LeaveDrawer({
  leave,
  onClose,
  onUpdate,
  mode = "view",
}: Props) {
  const [edited, setEdited] = useState<any>(null);

  useEffect(() => {
    if (leave) {
      setEdited({
        ...leave,
        attachments: leave.attachments || [],
      });
    }
  }, [leave]);

  if (!leave || !edited) return null;

  /* ================= ADD ATTACHMENT ================= */
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);

    setEdited((prev: any) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles],
    }));
  };

  /* ================= REMOVE FILE ================= */
  const removeFile = (index: number) => {
    setEdited((prev: any) => ({
      ...prev,
      attachments: prev.attachments.filter((_: any, i: number) => i !== index),
    }));
  };

  /* ================= REUSABLE FIELD ================= */
  const Field = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange?: (val: string) => void;
  }) => (
    <div className="space-y-1">
      <p className="text-xs text-base-content/60">{label}</p>

      {mode === "view" ? (
        <div className="bg-base-200 px-3 py-2 rounded-md text-sm">
          {value || "-"}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="input input-bordered w-full"
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 ">
      <div className="w-full max-w-md bg-base-100 h-full shadow-xl flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h3 className="text-lg font-semibold">
            {mode === "view" ? "Leave Details" : "Edit Leave"}
          </h3>

          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <MdClose size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <Field
            label="Type"
            value={edited.type}
            onChange={(val) =>
              setEdited({ ...edited, type: val })
            }
          />

          <Field
            label="From Date"
            value={edited.fromDate}
            onChange={(val) =>
              setEdited({ ...edited, fromDate: val })
            }
          />

          <Field
            label="To Date"
            value={edited.toDate}
            onChange={(val) =>
              setEdited({ ...edited, toDate: val })
            }
          />

          {/* REASON */}
          <div className="space-y-1">
            <p className="text-xs text-base-content/60">Reason</p>

            {mode === "view" ? (
              <div className="bg-base-200 px-3 py-2 rounded-md text-sm whitespace-pre-wrap">
                {edited.reason || "-"}
              </div>
            ) : (
              <textarea
                value={edited.reason}
                onChange={(e) =>
                  setEdited({ ...edited, reason: e.target.value })
                }
                className="textarea textarea-bordered w-full"
              />
            )}
          </div>

          {/* ================= ATTACHMENTS ================= */}
          <div className="space-y-2">
            <p className="text-xs text-base-content/60">Attachments</p>

            {edited.attachments.length > 0 ? (
              <div className="space-y-3">
                {edited.attachments.map((file: any, index: number) => {
                  const isImage = file.type?.startsWith("image/");

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between border border-base-300 rounded-lg p-2"
                    >
                      <div className="flex items-center gap-3">
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-base-200 flex items-center justify-center rounded-md text-xs">
                            FILE
                          </div>
                        )}

                        <p className="text-sm truncate max-w-[150px]">
                          {file.name}
                        </p>
                      </div>

                      {mode === "edit" && (
                        <button
                          onClick={() => removeFile(index)}
                          className="btn btn-xs btn-error btn-outline"
                        >
                          <MdDelete size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-base-content/50">
                No attachments
              </p>
            )}

            {mode === "edit" && (
              <input
                type="file"
                multiple
                onChange={handleAddFiles}
                className="file-input file-input-bordered w-full"
              />
            )}
          </div>
        </div>

        {/* FOOTER */}
        {mode === "edit" && (
          <div className="p-4 border-t border-base-300 bg-base-100 sticky bottom-0">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onUpdate?.(edited);
                onClose();
              }}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}