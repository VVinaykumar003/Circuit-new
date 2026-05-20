import {BarChart, BarChart3, CalendarCheck, ClipboardCopy, ClipboardList, Clock ,MarsStroke,NotepadText } from "lucide-react"



  type AttendanceTab = "records" | "mark";

interface Props {
  active: AttendanceTab;
  onChange: (tab: AttendanceTab) => void;
}

export default function MobileTabs({
  active,
  onChange,
}: Props) {
  const tabs = [
    { key: "mark", icon: CalendarCheck  },
    { key: "records", icon: ClipboardList },
    
    { key: "summary", icon:BarChart3   },
  
  ] as const;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 flex justify-around py-2 md:hidden z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
       

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center text-xs cursor-pointer ${
              isActive
                ? "text-primary"
                : "text-base-content/60"
            }`}
          >
            <Icon size={22} />
          </button>
        );
      })}
    </div>
  );
}