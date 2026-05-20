

// import { useState, useEffect } from "react";
// import { MdClose, MdCurrencyRupee, MdDelete } from "react-icons/md";
// import Button from "@/components/ui/Button";
// import LabeledInput from "@/components/ui/LabeledInput";
// import type { SalaryStructure, SalaryComponent } from "./SalaryStructureCard";

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   onSave: (data: SalaryStructure) => void;
//   initialData?: SalaryStructure | null;
// }

// export default function SalaryStructureModal({
//   open,
//   onClose,
//   onSave,
//   initialData,
// }: Props) {
//   if (!open) return null;

//   const [form, setForm] = useState<SalaryStructure>({
//     id: crypto.randomUUID(),
//     name: "",
//     components: [
//       {
//         id: crypto.randomUUID(),
//         label: "Basic Salary",
//         amount: 0,
//         type: "earning",
//       },
//     ],
//   });

//   useEffect(() => {
//     if (initialData) {
//       setForm(initialData);
//     }
//   }, [initialData]);

//   const addComponent = (type: "earning" | "deduction") => {
//     const newComponent: SalaryComponent = {
//       id: crypto.randomUUID(),
//       label: "",
//       amount: 0,
//       type,
//     };

//     setForm({
//       ...form,
//       components: [...form.components, newComponent],
//     });
//   };

//   const removeComponent = (id: string) => {
//     setForm({
//       ...form,
//       components: form.components.filter((c) => c.id !== id),
//     });
//   };

//   const updateComponent = (
//     id: string,
//     key: "label" | "amount",
//     value: string
//   ) => {
//     setForm({
//       ...form,
//       components: form.components.map((c) =>
//         c.id === id
//           ? {
//               ...c,
//               [key]: key === "amount" ? Number(value) : value,
//             }
//           : c
//       ),
//     });
//   };

//   const totalEarnings = form.components
//     .filter((c) => c.type === "earning")
//     .reduce((sum, c) => sum + c.amount, 0);

//   const totalDeductions = form.components
//     .filter((c) => c.type === "deduction")
//     .reduce((sum, c) => sum + c.amount, 0);

//   const netSalary = totalEarnings - totalDeductions;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="w-full max-w-xl bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">

//         {/* HEADER */}
//         <div className="flex justify-between items-center px-6 py-4 border-b border-base-300">
//           <h3 className="text-lg font-semibold">
//             {initialData ? "Edit Salary Structure" : "Create Salary Structure"}
//           </h3>
//           <button onClick={onClose} className="btn btn-sm btn-ghost">
//             <MdClose size={18} />
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="p-6 space-y-5">

//           {/* Structure Name */}
//           <div>
//             {/* <label className="text-sm text-base-content/70 mb-1">
//               Structure Name
//             </label> */}
//             <LabeledInput
//             label="Structure Name"
//               placeholder="Structure Name (e.g. Senior Developer)"
//               value={form.name}
//               onChange={(e) =>
//                 setForm({ ...form, name: e.target.value })
//               }
//             />
//           </div>

//           {/* Components Grid */}
//           <div className="grid grid-cols-2 gap-4">
//             {form.components.map((comp) => (
//               <div key={comp.id} className="relative">

//                 {/* Editable Label */}
//                 {/* <LabeledInput
//                   label="Base Salary"
//                   placeholder="Component Name"
//                   value={comp.label}
//                   onChange={(e) =>
//                     updateComponent(comp.id, "label", e.target.value)
//                   }
                 
//                 /> */}

//                 {/* Amount */}
//                 <LabeledInput
//                 label={`${comp.type === "earning" ? "Earning" : "Deduction"} Amount`}
//                   type="number"
//                   placeholder="Amount"
//                   value={comp.amount}
//                   onChange={(e) =>
//                     updateComponent(comp.id, "amount", e.target.value)
//                   }
//                 />

//                 {/* Delete Button */}
//                 <button
//                   onClick={() => removeComponent(comp.id)}
//                   className="absolute top-1 right-1 text-error text-lg"
//                 >
//                   -
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Add Buttons */}
//           <div className="flex gap-3">
//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => addComponent("earning")}
//             >
//               + Add Earning
//             </Button>

//             <Button
//               size="sm"
//               variant="outline"
//               onClick={() => addComponent("deduction")}
//             >
//               + Add Deduction
//             </Button>
//           </div>

//           {/* Net Salary Preview */}
//           <div className="bg-base-200 border border-base-300 rounded-xl p-4 flex justify-between items-center">
//             <span className="font-medium text-base-content">
//               Net Salary
//             </span>

//             <span className="text-xl font-semibold text-primary flex items-center gap-1">
//               <MdCurrencyRupee size={20} />
//               {netSalary.toLocaleString()}
//             </span>
//           </div>
//         </div>

//         {/* FOOTER */}
//         <div className="px-6 py-4 border-t border-base-300 flex justify-end gap-2">
//           <Button variant="ghost" onClick={onClose}>
//             Cancel
//           </Button>

//           <Button
//             variant="primary"
//             disabled={!form.name}
//             onClick={() => {
//               onSave(form);
//               onClose();
//             }}
//           >
//             {initialData ? "Update" : "Create"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { MdClose, MdCurrencyRupee, MdDelete } from "react-icons/md";
import Button from "@/components/ui/Button";
import LabeledInput from "@/components/ui/LabeledInput";
import type { SalaryStructure, SalaryComponent } from "./SalaryStructureCard";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: SalaryStructure) => void;
  initialData?: SalaryStructure | null;
}

export default function SalaryStructureModal({
  open,
  onClose,
  onSave,
  initialData,
}: Props) {

  const [form, setForm] = useState<SalaryStructure>({
    id: crypto.randomUUID(),
    name: "",
    components: [
      {
        id: crypto.randomUUID(),
        label: "Basic Salary",
        amount: 0,
        type: "earning",
      },
    ],
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  if (!open) return null;

  /* ---------------- COMPONENT ACTIONS ---------------- */

  const addComponent = (type: "earning" | "deduction") => {
    const newComponent: SalaryComponent = {
      id: crypto.randomUUID(),
      label: "",
      amount: 0,
      type,
    };

    setForm({
      ...form,
      components: [...form.components, newComponent],
    });
  };

  const removeComponent = (id: string) => {
    setForm({
      ...form,
      components: form.components.filter((c) => c.id !== id),
    });
  };

  const updateComponent = (
    id: string,
    key: "label" | "amount",
    value: string
  ) => {
    setForm({
      ...form,
      components: form.components.map((c) =>
        c.id === id
          ? {
              ...c,
              [key]: key === "amount" ? Number(value) : value,
            }
          : c
      ),
    });
  };

  /* ---------------- CALCULATIONS ---------------- */

  const totalEarnings = form.components
    .filter((c) => c.type === "earning")
    .reduce((sum, c) => sum + c.amount, 0);

  const totalDeductions = form.components
    .filter((c) => c.type === "deduction")
    .reduce((sum, c) => sum + c.amount, 0);

  const netSalary = totalEarnings - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/70 backdrop-blur-sm ">

      <div className="w-full max-w-xl bg-base-100 rounded-2xl shadow-xl border border-base-300 overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-base-content/10 text-base-content">
          <h3 className="text-lg font-semibold">
            {initialData ? "Edit Salary Structure" : "Create Salary Structure"}
          </h3>

          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <MdClose size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">

          {/* Structure Name */}
          <LabeledInput
         
            label="Structure Name"
            placeholder="e.g. Senior Developer"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          {/* Components */}
          <div className="space-y-4">

            {form.components.map((comp) => (

              <div
                key={comp.id}
                className="grid grid-cols-2 gap-3 relative bg-base-200 border border-base-content/10 p-3 rounded-lg"
              >

                <LabeledInput
                  label="Component Name"
                  placeholder="Basic / HRA / PF"
                   className="placeholder:text-base-content/40"
                  value={comp.label}
                  onChange={(e) =>
                    updateComponent(comp.id, "label", e.target.value)
                  }
                />

                <LabeledInput
                  label="Amount"
                  type="number"
                  value={comp.amount}
                  onChange={(e) =>
                    updateComponent(comp.id, "amount", e.target.value)
                  }
                />

                <button
                  onClick={() => removeComponent(comp.id)}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 shadow"
                >
                  <MdDelete size={14} />
                </button>

              </div>

            ))}

          </div>

          {/* Add Buttons */}
          <div className="flex gap-3">

            <Button
              size="sm"
              variant="outline"
              onClick={() => addComponent("earning")}
            >
              + Add Earning
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => addComponent("deduction")}
            >
              + Add Deduction
            </Button>

          </div>

          {/* Net Salary */}
          <div className="bg-primary/10 border-primary/20 border  rounded-xl p-4 flex justify-between items-center">

            <span className="font-medium text-base-content">
              Net Salary
            </span>

            <span className="text-xl font-semibold text-primary flex items-center gap-1">
              <MdCurrencyRupee size={20} />
              {netSalary.toLocaleString()}
            </span>

          </div>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-base-300 flex justify-end gap-2">

          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            disabled={!form.name}
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            {initialData ? "Update" : "Create"}
          </Button>

        </div>

      </div>
    </div>
  );
}