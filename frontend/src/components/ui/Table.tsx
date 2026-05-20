import type { ReactNode } from "react";

interface TableProps {
  headers: ReactNode[];
  children: ReactNode; 
}

export default function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-x-auto   rounded-lg border border-primary/30 overflow-hidden">
      <table className="table table-zebra w-full ">
        <thead className="">
          <tr className="bg-primary  text-md text-primary-content uppercase divide-x divide-white/20 ">
            {headers.map((h,i) => (
                <th key={i}>{h}</th> 
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
