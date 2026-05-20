 import {
  MdViewList,
  MdDashboard
 } from "react-icons/md";
 
 type TabType =
   | "table"
   | "kanban"
  
 
 interface Props {
   active: TabType;
   onChange: (tab: TabType) => void;
 }
 
 export default function MobileTabs({
   active,
   onChange,
 }: Props) {
   const tabs = [
     { key: "table", icon: MdDashboard },
     { key: "kanban", icon: MdViewList },
   
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