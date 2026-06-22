import { useEffect, useState } from "react";
import StatusBadge from "../ui/StatusBadge";
import Button from "../ui/Button";
import {
  MdBusiness,
  MdHomeWork,
  MdAccessTime
} from "react-icons/md";
import { markAttendance , getMyAttendance } from "@/services/attendanceService";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "react-toastify";
// TODO: Adjust this import path to match your actual frontend socket file!
import { socket } from "@/socket";

type AttendanceMode = "office" | "wfh" | "half-day";
type AttendanceStatus = "not-marked" | "pending" | "approved" | "rejected";

export default function MarkAttendanceCard() {
  const { auth } = useAuth();
  const user = auth?.user;
  const currentUserName = user?.name || "Someone";

  const [mode, setMode] = useState<AttendanceMode>("office");
  const [status, setStatus] = useState<AttendanceStatus>("not-marked");
  const [location, setLocation] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeNow = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  /* ---------- LOCATION ---------- */
  const fetchLocation = () => {
    if (!navigator.geolocation) return;

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(
          `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        );
        setLoadingLocation(false);
      },
      () => {
        setLocation("Permission denied");
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (mode === "office") fetchLocation();
    else setLocation(null);
  }, [mode]);

  useEffect(() => {
    if (!auth.slug) {
      setLoadingStatus(false);
      return;
    }

    const checkStatus = (isSilent = false) => {
      if (!isSilent) setLoadingStatus(true);
      const todayISO = new Date().toISOString().split("T")[0];

      getMyAttendance(auth.slug, { date: todayISO })
        .then((res) => {
          const attendanceForToday = res.data?.data || [];
          if (attendanceForToday.length > 0) {
            const todaysDoc = attendanceForToday[0];
            if (todaysDoc && todaysDoc.record) {
              const backendStatus = (todaysDoc.record.status || "").toUpperCase();
              if (backendStatus === "PRESENT" || backendStatus === "HALF_DAY") {
                setStatus("approved");
              } else if (backendStatus === "REJECTED" || backendStatus === "ABSENT") {
                setStatus("rejected");
              } else if (backendStatus === "PENDING") {
                setStatus("pending");
              }
            }
          }
        })
        .catch(() => { /* Fail silently, assume not marked */

          
          setStatus("not-marked");

         })
        .finally(() => { if (!isSilent) setLoadingStatus(false); });
    };

    checkStatus();
    // Auto-refresh every 30 seconds to catch admin approval
    const intervalId = setInterval(() => checkStatus(true), 30000);
    return () => clearInterval(intervalId);
  }, [auth.slug]);

const submitAttendance = () => {
  if (!auth.user || !auth.slug) return;

  let lat, lon;
  if (mode === "office" && location && !location.includes("denied")) {
    [lat, lon] = location.split(",").map(s => parseFloat(s.trim()));
  }

  const attendanceData = {
    date: new Date().toISOString().split("T")[0],
    departmentId: auth.user.department || undefined,
    latitude: lat,
    longitude: lon,
    mode: mode,
  };

  markAttendance(auth.slug, attendanceData)
    .then(() => {
      setStatus("pending");
      toast.success("Attendance submitted for approval!");
      
      // 🟢 Emit real-time notification to Admins
      if (socket) {
        socket.emit("notifyAdmins", {
          title: "Attendance Marked",
          message: `${currentUserName} has checked in (${mode}).`,
          type: "attendance",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("Failed to submit attendance");
    });
};
const statusStyles: Record<AttendanceStatus, string> = {
  "not-marked": "",
  pending:
    "bg-warning/50 border-warning/60 text-warning-content",
  approved:
    "bg-success/50 border-success/60 text-success-content",
  rejected:
    "bg-error/50 border-error/60 text-error-content",
};
// return (
//   <div className="w-full max-w-3xl bg-white/60 border border-base-300 rounded-2xl p-6 shadow-sm">

//     {/* HEADER */}
//     <div className="flex justify-between items-center mb-5">
//       <div>
//         <h3 className="text-xl font-semibold">Mark Attendance</h3>
//         <p className="text-sm text-base-content/90">{today}</p>
//       </div>

//       {status !== "not-marked" && <StatusBadge status={status} />}
//     </div>

//     {/* TIME */}
//     <div className="text-center mb-6">
//       <p className="text-md font-medium text-base-content/90">Check-in time</p>
//       <p className="text-4xl font-bold tracking-wide mt-1">
//         {timeNow}
//       </p>
//     </div>

//     {/* MODE */}
//     <div className="mb-6">
//       <p className="text-sm font-medium mb-2">Attendance Type</p>

//       <div className="flex gap-3">
//         {[
//           { id: "office", label: "Office", icon: <MdBusiness /> },
//           { id: "wfh", label: "WFH", icon: <MdHomeWork /> },
//           { id: "half-day", label: "Half Day", icon: <MdAccessTime /> },
//         ].map((item) => (
//           <button
//             key={item.id}
//             onClick={() => setMode(item.id as AttendanceMode)}
//             className={`
//               flex-1 py-3 rounded-xl text-sm font-medium
//               transition-all duration-200
//               border
//               ${
//                 mode === item.id
//                   ? "bg-primary text-primary-content border-primary shadow-sm"
//                   : "bg-base-100 text-base-content border-base-300 hover:bg-base-200"
//               }
//             `}
//           >
//             <div className="flex flex-col items-center gap-1">
//               <span className="text-lg">{item.icon}</span>
//               {item.label}
//             </div>
//           </button>
//         ))}
//       </div>
//     </div>

//     {/* LOCATION */}
//     {mode === "office" && (
//       <div className="mb-5 p-4 rounded-xl bg-base-200 border border-base-300">
//         <p className="text-xs text-base-content mb-1">Location</p>
//         <p className="text-sm font-medium text-base-content">
//           {loadingLocation ? "Fetching location..." : location ?? "Not available"}
//         </p>
//       </div>
//     )}

//     {/* INFO */}
//     {(mode === "wfh" || mode === "half-day") && (
//       <div className="mb-5 text-xs text-base-content bg-base-200 p-3 rounded-lg">
//         {mode === "half-day"
//           ? "Half-day attendance requires admin approval."
//           : "Work from home does not require location."}
//       </div>
//     )}

//     {/* ACTION */}
//     {status === "not-marked" ? (
//       <Button
//         className="w-full py-3 text-base font-medium"
//         onClick={submitAttendance}
//         disabled={loadingStatus}
//       >
//         {loadingStatus ? "Checking Status..." : "Submit Attendance"}
//       </Button>
//     ) : (
//       <div  className={`
//     p-4 rounded-xl text-center border
//     ${statusStyles[status]}
//   `}>
//         <p className="font-medium capitalize">
//           Attendance is {status}
//         </p>
//         <p className="text-xs font-medium text-base-content mt-1">
//           View details in Records tab
//         </p>
//       </div>
//     )}

//   </div>
// );

return (
  <div
    className="
      w-full max-w-3xl
      bg-white/60 border border-base-300
      rounded-2xl
      p-4 sm:p-6
      shadow-sm
    "
  >
    {/* HEADER */}
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
      <div>
        <h3 className="text-lg sm:text-xl font-semibold">
          Mark Attendance
        </h3>

        <p className="text-xs sm:text-sm text-base-content/90">
          {today}
        </p>
      </div>

      {status !== "not-marked" && (
        <div className="self-start sm:self-auto">
          <StatusBadge status={status} />
        </div>
      )}
    </div>

    {/* TIME */}
    <div className="text-center mb-6">
      <p className="text-sm sm:text-md font-medium text-base-content/90">
        Check-in time
      </p>

      <p className="text-3xl sm:text-4xl font-bold tracking-wide mt-1">
        {timeNow}
      </p>
    </div>

    {/* MODE */}
    <div className="mb-6">
      <p className="text-sm font-medium mb-3">
        Attendance Type
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { id: "office", label: "Office", icon: <MdBusiness /> },
          { id: "wfh", label: "WFH", icon: <MdHomeWork /> },
          { id: "half-day", label: "Half Day", icon: <MdAccessTime /> },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id as AttendanceMode)}
            className={`
              py-3 rounded-xl text-sm font-medium
              transition-all duration-200 border
              min-h-[90px]

              ${
                mode === item.id
                  ? "bg-primary text-primary-content border-primary shadow-sm"
                  : "bg-base-100 text-base-content border-base-300 hover:bg-base-200"
              }
            `}
          >
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-lg sm:text-xl">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* LOCATION */}
    {mode === "office" && (
      <div className="mb-5 p-3 sm:p-4 rounded-xl bg-base-200 border border-base-300">
        <p className="text-xs text-base-content mb-1">
          Location
        </p>

        <p className="text-sm break-words font-medium text-base-content">
          {loadingLocation
            ? "Fetching location..."
            : location ?? "Not available"}
        </p>
      </div>
    )}

    {/* INFO */}
    {(mode === "wfh" || mode === "half-day") && (
      <div className="mb-5 text-xs sm:text-sm text-base-content bg-base-200 p-3 rounded-lg">
        {mode === "half-day"
          ? "Half-day attendance requires admin approval."
          : "Work from home does not require location."}
      </div>
    )}

    {/* ACTION */}
    {status === "not-marked" ? (
      <Button
        className="w-full py-3 text-sm sm:text-base font-medium"
        onClick={submitAttendance}
        disabled={loadingStatus}
      >
        {loadingStatus
          ? "Checking Status..."
          : "Submit Attendance"}
      </Button>
    ) : (
      <div
        className={`
          p-4 rounded-xl text-center border
          ${statusStyles[status]}
        `}
      >
        <p className="font-medium capitalize text-sm sm:text-base">
          Attendance is {status}
        </p>

        <p className="text-xs font-medium text-base-content mt-1">
          View details in Records tab
        </p>
      </div>
    )}
  </div>
);


}
