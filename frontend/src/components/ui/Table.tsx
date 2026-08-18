import type { ReactNode } from "react";

interface TableProps {
  headers: ReactNode[];
  children: ReactNode; 
}

export default function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto   rounded-lg border border-primary/30 overflow-hidden">
      <table className="table table-sm table-zebra w-full  ">
        <thead className="">
          <tr className="bg-primary  text-primary-content uppercase divide-x divide-white/20 ">
            {headers.map((h,i) => (
                <th className=" text-[13px] " key={i}>{h}</th> 
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
