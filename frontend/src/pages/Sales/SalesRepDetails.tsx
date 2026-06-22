import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MdSearch, MdAdd, MdFilterList, MdMoreVert } from "react-icons/md";

/* ─────────────────────────── types ─────────────────────────── */
export interface SalesRep {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  avatarUrl?: string;
}

interface SalesRepDetailsProps {
  reps?: SalesRep[];
  onAddRep?: () => void;
  onRepClick?: (rep: SalesRep) => void;
}

/* ─────────────────────────── sample data ───────────────────── */
const SAMPLE: SalesRep[] = [
  {
    id: "1",
    name: "V VINAY Kumar",
    address: "A15 shivam complex koni bilaspur,",
    email: "vvinaykumar300...",
    phone: "+918319145613",
  },
];

/* ─────────────────────────── rep card ──────────────────────── */
function RepCard({
  rep,
  onClick,
}: {
  rep: SalesRep;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-base-100 border border-base-300 rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:shadow-md hover:border-base-400 transition-all w-72 flex-shrink-0"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {rep.avatarUrl ? (
          <img src={rep.avatarUrl} alt={rep.name} className="w-full h-full object-cover" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28" height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-base-content/30"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-success truncate">{rep.name}</p>
        <p className="text-xs text-base-content/60 mt-0.5 truncate">{rep.address}</p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-success truncate">{rep.email}</span>
          <span className="text-xs text-base-content/70 whitespace-nowrap">{rep.phone}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── main component ────────────────── */
export default function SalesRepDetails({
  reps: propReps,
  onAddRep,
  onRepClick,
}: SalesRepDetailsProps) {
  const navigate = useNavigate();
  const [reps] = useState<SalesRep[]>(propReps ?? SAMPLE);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(
    () =>
      reps.filter((r) =>
        [r.name, r.email, r.phone, r.address]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [reps, search]
  );

  return (
    <div className="flex flex-col h-full bg-base-200">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-base-300 bg-base-100 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-base-content">
          Sales Rep Details
        </h1>

        <div className="flex items-center gap-2">
          {showSearch && (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => { if (!search) setShowSearch(false); }}
              placeholder="Search reps…"
              className="border border-base-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-success w-48 bg-base-100 transition-colors"
            />
          )}
          <button
            onClick={() => setShowSearch((v) => !v)}
            className="btn btn-ghost btn-sm btn-square"
          >
            <MdSearch size={18} />
          </button>
          <button
            onClick={() =>
              onAddRep ? onAddRep() : navigate("/sales/representatives/new")
            }
            className="btn btn-success btn-sm btn-square text-white"
          >
            <MdAdd size={18} />
          </button>
          <button className="btn btn-ghost btn-sm btn-square">
            <MdFilterList size={18} />
          </button>
          <button className="btn btn-ghost btn-sm btn-square">
            <MdMoreVert size={18} />
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* Section heading with green left border */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-success rounded-full" />
          <h2 className="text-sm font-semibold text-base-content">
            SMS ({filtered.length})
          </h2>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-base-content/40 text-sm">
            No sales reps found.
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {filtered.map((rep) => (
              <RepCard
                key={rep.id}
                rep={rep}
                onClick={() =>
                  onRepClick
                    ? onRepClick(rep)
                    : navigate(`/sales/representatives/${rep.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── usage example ─────────────────────

import SalesRepDetails from "./SalesRepDetails";
import { useNavigate } from "react-router-dom";

export default function SalesRepDetailsPage() {
  const navigate = useNavigate();
  const { data: reps } = useSalesReps(); // your hook/query

  return (
    <SalesRepDetails
      reps={reps ?? []}
      onAddRep={() => navigate("/sales/representatives/new")}
      onRepClick={(rep) => navigate(`/sales/representatives/${rep.id}`)}
    />
  );
}

──────────────────────────────────────────────────────────────── */