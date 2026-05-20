import { MdInfoOutline } from "react-icons/md";

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
}



export default function StatutorySettingsCard({
  checked,
  onChange,
}: Props) {
  return (
    <div className="bg-primary text-primary-content border border-white/20 
                    rounded-3xl p-6  shadow-xl space-y-5">

      {/* Title */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-xs tracking-widest text-primary-content uppercase">
            2. Statutory Settings
          </p>

          <h3 className="mt-2 text-sm font-semibold">
            Limit PF to Statutory Ceiling (₹15,000)
          </h3>
        </div>

        {/* Toggle
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="toggle toggle-primary text-gray-600 w-full"
          />
        </label> */}
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 
                      bg-white/10 rounded-2xl p-4 
                      border border-white/10">

        <MdInfoOutline
          size={18}
          className="text-white/70 mt-0.5"
        />

        <p className="text-xs text-primary-content leading-relaxed">
          If enabled, PF is calculated on a max basis of ₹15,000
          even if Basic + DA is higher. This is standard statutory
          policy.
        </p>
      </div>
    </div>
  );
}
