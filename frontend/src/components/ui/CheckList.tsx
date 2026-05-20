// import { MdAdd, MdClose } from "react-icons/md";
// import type { ChecklistItem } from "@/type/task";
// import { useState } from "react";

// interface Props {
//   value: ChecklistItem[];
//   onChange: (items: ChecklistItem[]) => void;
// }

// export default function Checklist({ value, onChange }: Props) {
//   const [text, setText] = useState("");

//   const addItem = () => {
//     if (!text.trim()) return;
//     onChange([
//       ...value,
//       { _id: crypto.randomUUID(), title: text, completed: false },
//     ]);
//     setText("");
//   };

//   return (
//     <div className="space-y-2">
//       <label className="text-xs text-base-content/60">
//         Checklist
//       </label>

//       {value.map((item) => (
//         <div
//           key={item._id}
//           className="flex items-center gap-2 
//           bg-base-100 border border-base-300 
//           rounded-lg px-3 py-2"
//         >
//           <input
//             type="checkbox"
//             checked={item.completed}
//             onChange={() =>
//               onChange(
//                 value.map((i) =>
//                   i._id === item._id
//                     ? { ...i, completed: !i.completed }
//                     : i
//                 )
//               )
//             }
//           />
//           <span
//             className={`flex-1 text-sm ${
//               item.completed ? "line-through text-base-content/50" : ""
//             }`}
//           >
//             {item.title}
//           </span>

//           <button
//             onClick={() =>
//               onChange(value.filter((i) => i._id !== item._id))
//             }
//           >
//             <MdClose />
//           </button>
//         </div>
//       ))}

//       <div className="flex gap-2">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Add checklist item"
//           className="input input-bordered w-full border border-base-300 focus:ring-0"
//         />
//         <button
//           className="btn btn-square btn-primary"
//           onClick={addItem}
//         >
//           <MdAdd />
//         </button>
//       </div>
//     </div>
//   );
// }



import { MdAdd, MdClose, MdChecklist } from "react-icons/md";
import type { ChecklistItem } from "@/type/task";
import { useState } from "react";

interface Props {
  value: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export default function Checklist({ value, onChange }: Props) {
  const [text, setText] = useState("");

  const addItem = () => {
    if (!text.trim()) return;
    onChange([
      ...value,
      { _id: crypto.randomUUID(), title: text, completed: false },
    ]);
    setText("");
  };

  return (
    <div className="space-y-3">
     

      {/* Checklist Items */}
      <div className="space-y-2">
        {value.length === 0 && (
          <p className="text-sm text-base-content/60">
            No checklist items yet
          </p>
        )}

        {value.map((item) => (
          <div
            key={item._id}
       className="flex items-center gap-3 
w-full
bg-base-100 border border-base-300 
rounded-xl px-3 py-2
opacity-100"
          >
            <input
              type="checkbox"
              className="checkbox border placeholder:text-base-content/70 border-base-content focus:outline-none focus:ring-2 focus:ring-primary/40 checkbox-primary checkbox-sm mt-[1px] !opacity-100 "
              checked={item.completed}
              onChange={() =>
                onChange(
                  value.map((i) =>
                    i._id === item._id
                      ? { ...i, completed: !i.completed }
                      : i
                  )
                )
              }
            />

            <span
              className={`flex-1 text-sm ${
                item.completed
                  ? "line-through text-base-content/50"
                  : ""
              }`}
            >
              {item.title}
            </span>

            <button
              className="btn btn-ghost btn-xs"
              onClick={() =>
                onChange(value.filter((i) => i._id !== item._id))
              }
            >
              <MdClose size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Item */}
      <div className="flex gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add checklist item..."
          className="input placeholder:text-base-content/70 rounded-lg w-full border border-base-300 focus:ring-0 focus:outline-none focus:ring-primary/40"
        />

        <button
          className="btn btn-primary btn-square"
          onClick={addItem}
        >
          <MdAdd size={18} />
        </button>
      </div>
    </div>
  );
}