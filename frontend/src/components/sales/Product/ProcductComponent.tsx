/* ── Reusable Components ── */
export const FormSection = ({ title, children, defaultExpanded = false }: { title: string, children: React.ReactNode, defaultExpanded?: boolean }) => (
  <div className="collapse collapse-arrow bg-base-100 border border-base-300 rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
    <input type="checkbox" defaultChecked={defaultExpanded} />
    <div className="collapse-title text-[18px] font-[600] border-b border-base-200 bg-base-200/30">
      {title}
    </div>
    <div className="collapse-content padding-top-[20px] space-y-[16px]">
      {children}
    </div>
  </div>
);

export const InfoCard = ({ title, value }: { title: string, value: string | number | React.ReactNode }) => (
  <div className="bg-base-200/50 p-2 rounded-[12px] border border-base-200 text-[14px]">
    <p className="text-base-content/50 font-[500] margin-bottom-[4px] uppercase text-[11px]">{title}</p>
    <p className="font-[600] text-base-content">{value}</p>
  </div>
);





/* ── Shared Component: Form Row ── */
export const FormRow = ({ label, required, error, children }: { label: string, required?: boolean, error?: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-start gap-4">
    <label className="text-[14px] font-[500] text-base-content/80 padding-top-[10px]">
      {label} {required && <span className="text-error">*</span>}
    </label>
    <div className="width-full">
      {children}
      {error && <p className="text-error text-[12px] margin-top-[4px]">{error}</p>}
    </div>
  </div>
);