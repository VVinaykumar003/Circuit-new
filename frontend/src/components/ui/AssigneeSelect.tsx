// import { useState } from "react";

// type User = {
//   id: string;
//   name: string;
// };

// interface Props {
//   users: User[];
//   value?: User;
//   onChange: (user: User) => void;
// }

// export default function AssigneeSelect({
//   users,
//   value,
//   onChange,
// }: Props) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");

//   const filtered = users.filter((u) =>
//     u.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="relative">
//       <button
//         className="input input-bordered w-full text-left flex items-center gap-2"
//         onClick={() => setOpen(!open)}
//         type="button"
//       >
//         👤 {value ? value.name : "Assign to"}
//       </button>

//       {open && (
//         <div className="absolute z-20 mt-1 w-full bg-base-100 border border-base-300 rounded-lg shadow">
//           <input
//             autoFocus
//             className="input input-sm w-full border-b rounded-none"
//             placeholder="Search user…"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//           />

//           <ul className="max-h-48 overflow-auto">
//             {filtered.map((user) => (
//               <li
//                 key={user.id}
//                 onClick={() => {
//                   onChange(user);
//                   setOpen(false);
//                   setQuery("");
//                 }}
//                 className="px-3 py-2 cursor-pointer hover:bg-base-200"
//               >
//                 {user.name}
//               </li>
//             ))}

//             {filtered.length === 0 && (
//               <li className="px-3 py-2 text-sm text-base-content/60">
//                 No users found
//               </li>
//             )}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type User = {
  id: string;
  name: string;
};

interface Props {
  users: User[];
  value?: User;
  onChange: (user: User) => void;
}

export default function AssigneeSelect({
  users,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  // close on outside click
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* SELECT BUTTON */}
      <button
        className="w-full px-3 py-2.5 border border-base-300 rounded-lg bg-base-100 
        flex items-center justify-between text-sm 
        focus:outline-none focus:ring-2 focus:ring-primary/40 "
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="flex items-center gap-2">
          <span className="text-base-content/60">👤</span>

          {value ? (
            <span className="text-base-content">{value.name}</span>
          ) : (
            <span className="text-base-content/70">
              Select assignee
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180 text-primary" : "text-base-content/50"
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
          
          {/* SEARCH */}
          <input
            autoFocus
            className="w-full px-3 py-2 text-sm border-b border-base-200 outline-none bg-base-100"
            placeholder="Search user..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* OPTIONS */}
          <ul className="max-h-48 overflow-auto text-sm">
            {filtered.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  onChange(user);
                  setOpen(false);
                  setQuery("");
                }}
                className={`px-3 py-2 cursor-pointer flex items-center justify-between
                hover:bg-primary/10 transition
                ${
                  value?.id === user.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-base-content"
                }`}
              >
                {user.name}

                {value?.id === user.id && (
                  <Check size={14} className="text-primary" />
                )}
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-base-content/60">
                No users found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}