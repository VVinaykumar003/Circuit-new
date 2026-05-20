import {
  MdDashboard,
  MdAssignment,
  MdAccountBalanceWallet,
  MdCalendarMonth,
  MdMenuBook,
} from "react-icons/md";
import type { IconType } from "react-icons";

type TabType =
  | "overview"
  | "my-leaves"
  | "balance"
  | "calendar"
  | "policy"
  | "requests"
  | string;

interface Props {
  active: string;
  onChange: (tab: any) => void;
  tabs?: { key: TabType; icon: IconType }[];
}

export default function MobileLeaveTabs({
  active,
  onChange,
  tabs,
}: Props) {
  const defaultTabs = [
    { key: "overview", icon: MdDashboard },
    { key: "my-leaves", icon: MdAssignment },
    { key: "balance", icon: MdAccountBalanceWallet },
    { key: "calendar", icon: MdCalendarMonth },
    { key: "policy", icon: MdMenuBook },
  ];

  const displayTabs = tabs || defaultTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 flex justify-around py-2 md:hidden z-50">
      {displayTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center text-xs ${
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