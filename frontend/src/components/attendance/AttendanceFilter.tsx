// import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

interface Props {
  name?: string;
  fromDate?: string;
  toDate?: string;
  onChange: (filters: {
    name?: string;
    fromDate?: string;
    toDate?: string;
  }) => void;
  isAdmin?: boolean;
}

export default function AttendanceFilters({
  name,
  fromDate,
  toDate,
  onChange,
  isAdmin = false,
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  return (
    // <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full text-base-content">
    //   {/* Name search (Admin only) */}
    //   {isAdmin && (
    //     <div className="flex flex-col gap-1 w-full md:w-1/3">
    //       <label className="text-xs text-base-content/60">
    //        Employee Name
    //       </label>
    //       <Input
    //         type="text"
    //         value={name}
    //         onChange={(e) =>
    //           onChange({
    //             name: e.target.value,
    //             fromDate,
    //             toDate,
    //           })
    //         }
    //         placeholder=" Search by name"
    //         className="w-full px-4 py-2.5 rounded-xl border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    //       />
    //     </div>
    //   )}

    //   {/* From date */}
    //   <div className="flex flex-col gap-1 w-full md:w-1/4">
    //     <label className="text-xs text-base-content/60">
    //       From
    //     </label>
    //     <input
          
    //       type="date"
    //       value={fromDate}
    //       onChange={(e) =>
    //         onChange({
    //           name,
    //           fromDate: e.target.value,
    //           toDate,
    //         })
    //       }
    //       className="w-full px-4 py-2.5 rounded-xl border border-base-content bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    //     />
    //   </div>

    //   {/* To date */}
    //   <div className="flex flex-col gap-1 w-full md:w-1/4">
    //    <label className="text-xs text-base-content/60">
    //       To
    //     </label>
    //     <input
    //       type="date"
    //       value={toDate}
    //       onChange={(e) =>
    //         onChange({
    //           name,
    //           fromDate,
    //           toDate: e.target.value,
    //         })
    //       }
    //       className="w-full px-4 py-2.5 rounded-xl border border-base-content bg-base-100 text-base-content focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
    //     />
    //   </div>

    //   {/* Clear */}
    //   <div className="w-full md:w-auto flex justify-end text-base-content border border-base-content rounded-xl ">
    //     <Button
    //       variant="outline"
    //       className="w-full md:w-auto h-[46px]"
    //       onClick={() => onChange({})}
    //     >
    //       Reset
    //     </Button>
    //   </div>
    // </div>


    <div className="flex flex-col md:flex-row gap-3 items-start md:items-end w-full text-base-content text-sm ">

  {/* Name search (Admin only) */}
  {isAdmin && (
    <div className="flex flex-col gap-1 w-full md:w-1/3">
      <label className="text-[11px] text-base-content/50">
        Employee Name
      </label>
      <Input
        type="text"
        value={name}
        onChange={(e) =>
          onChange({
            name: e.target.value,
            fromDate,
            toDate,
          })
        }
        placeholder="Search name"
        className="w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
    </div>
  )}

  {/* From date */}
  <div className="flex flex-col gap-1 w-full md:w-1/4">
    <label className="text-xs font-medium text-base-content/70">
      From
    </label>
    <input
      type="date"
      value={fromDate || today}
      onChange={(e) =>
        onChange({
          name,
          fromDate: e.target.value,
          toDate,
        })
      }
      className="w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50"
    />
  </div>

  {/* To date */}
  <div className="flex flex-col gap-1 w-full md:w-1/4">
    <label className="text-xs font-medium  text-base-content/70">
      To
    </label>
    <input
      type="date"
      value={toDate || today}
      onChange={(e) =>
        onChange({
          name,
          fromDate,
          toDate: e.target.value,
        })
      }
      className="w-full px-3 py-2 rounded-lg border border-base-300 bg-base-100 text-base-content focus:outline-none focus:ring-1 focus:ring-primary/50"
    />
  </div>

  {/* Reset */}
  <div className="w-full md:w-auto flex justify-end">
    <Button
      variant="outline"
      className="w-full md:w-auto h-9 px-3 text-sm rounded-lg bg-base-100"
      onClick={() => onChange({})}
    >
      Reset
    </Button>
  </div>

</div>
  );
}
