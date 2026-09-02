/* ── Reusable Components ── */
export const FormSection = ({ title, children, defaultExpanded = false }: { title: string, children: React.ReactNode, defaultExpanded?: boolean }) => (
  <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-lg shadow-xs">
    <input type="checkbox" defaultChecked={defaultExpanded} />
    <div className="collapse-title text-sm font-semibold py-2.5 px-3.5 border-b border-base-200 bg-base-200/30">
      {title}
    </div>
    <div className="collapse-content pt-3 px-3.5 space-y-2.5">
      {children}
    </div>
  </div>
);

export const InfoCard = ({ title, value }: { title: string, value: string | number | React.ReactNode }) => (
  <div className="bg-base-200/50 p-2 rounded-lg border border-base-200 text-xs">
    <p className="text-base-content/50 font-medium mb-0.5 uppercase text-[10px]">{title}</p>
    <p className="font-semibold text-base-content">{value}</p>
  </div>
);

/* ── Shared Component: Form Row ── */
export const FormRow = ({ label, required, error, children }: { label: string, required?: boolean, error?: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-start gap-3">
    <label className="text-xs font-medium text-base-content/80 pt-1.5">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="w-full">
      {children}
      {error && <p className="text-error text-[11px] mt-1">{error}</p>}
    </div>
  </div>
);