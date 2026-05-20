
import  Button  from "../ui/Button";
type Status = "all" | "approved" | "pending" | "absent";


interface Props {
  value: Status;
  onChange: (value: Status) => void;
}

 function StatusPills({ value, onChange }: Props) {
  const items: { id: Status; label: string }[] = [
    { id: "all", label: "All" },
    { id: "approved", label: "Approved" },
    // { id: "pending", label: "Pending" },
    { id: "absent", label: "Absent" },
  ];

  return ( 
    <div className="flex gap-2 flex-wrap  border-base-content text-base-content ">
      {items.map((item) => (
        <Button
          key={item.id}
          onClick={() => onChange(item.id)}
          variant={value === item.id ? "primary" : "ghost"}
          className={`${value === item.id
                ? "bg-primary text-primary-content border-primary"
                : "bg-base-100 border-base-300 hover:bg-base-200"
            }`}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
}

export default StatusPills;
//                 ? "bg-primary text-primary-content border-primary"
//                 : "bg-base-100 border-base-300 hover:bg-base-200"
//             }`}
//         >
//           {item.label}
//         </button>
//       ))}
//     </div>
//   );
// }
