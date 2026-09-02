import React, { type ReactNode } from "react";

export interface TabItem<T = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

export interface TabsProps<T = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: "bordered" | "boxed" | "lifted";
  className?: string;
}

export default function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = "bordered",
  className = "",
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`tabs ${
        variant === "bordered"
          ? "tabs-bordered"
          : variant === "boxed"
          ? "tabs-box bg-base-200 p-1 rounded-xl"
          : "tabs-lifted"
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`tab gap-2 text-xs md:text-sm font-semibold transition-all ${
              isActive
                ? "tab-active text-primary border-primary font-bold"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            {tab.icon && <span className="text-base shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`badge badge-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "badge-primary text-white" : "badge-ghost"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
