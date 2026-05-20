// interface TabItem<T extends string> {
//   key: T;
//   label: string;
// }

// interface TabsProps<T extends string> {
//   value: T;
//   onChange: (tab: T) => void;
//   tabs: TabItem<T>[];
// }

// export default function Tabs<T extends string>({
//   value,
//   onChange,
//   tabs,
// }: TabsProps<T>) {
//   return (
//     <div className="tabs tabs-boxed bg-base-200 w-fit mb-6 text-base-content">
//       {tabs.map((tab) => (
//         <button
//           key={tab.key}
//           className={`tab ${value === tab.key ? "tab-active" : ""}`}
//           onClick={() => onChange(tab.key)}
//         >
//           {tab.label}
//         </button>
//       ))}
//     </div>
//   );
// }


interface TabItem<T extends string> {
  key: T;
  label: string;
  icon?: React.ReactNode; // optional (future use 😉)
}

interface TabsProps<T extends string> {
  value: T;
  onChange: (tab: T) => void;
  tabs: TabItem<T>[];
}

export default function Tabs<T extends string>({
  value,
  onChange,
  tabs,
}: TabsProps<T>) {
  return (
    <div className="mb-5 mt-4">
      <div className="bg-base-200 p-1 rounded-lg inline-flex gap-1">

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                value === tab.key
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-base-content/60 hover:bg-base-100"
              }`}
          >
            {tab.icon && tab.icon}
            {tab.label}
          </button>
        ))}

      </div>
    </div>
  );
}