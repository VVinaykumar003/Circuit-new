import React, { useState, useEffect } from "react";
import { FaSignInAlt, FaSignOutAlt, FaPlay } from "react-icons/fa";
import type { TodayAttendance } from "@/type/index";

interface Props {
  todayData: TodayAttendance;
  isLoading: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onStartBreak: (type: string) => void;
  onEndBreak: () => void;
}

const CheckInActions: React.FC<Props> = ({
  todayData,
  isLoading,
  onCheckIn,
  onCheckOut,
  onStartBreak,
  onEndBreak,
}) => {
  const { status, isOnBreak, checkIn, workingHours, checkOut, breaks } = todayData;
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (checkIn && status !== "Not Checked In" && !checkOut) {
      const checkInTime = new Date(checkIn).getTime();
      
      // Calculate the total duration of completed breaks in milliseconds
      const totalBreakMs = (breaks || [])
        .filter(b => b.endTime)
        .reduce((acc, b) => acc + (new Date(b.endTime!).getTime() - new Date(b.startTime).getTime()), 0);
        
      interval = setInterval(() => {
        const now = new Date().getTime();
        const elapsedMilliseconds = now - checkInTime;
        const totalSeconds = Math.floor((elapsedMilliseconds - totalBreakMs) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimer(
          `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
          )}:${String(seconds).padStart(2, "0")}`
        );
      }, 1000);
    } else {
      const initialMinutes = typeof workingHours === 'number' ? workingHours : 0;
      const hours = Math.floor(initialMinutes / 60);
      const minutes = initialMinutes % 60;
      setTimer(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
      );
    }
    return () => clearInterval(interval);
  }, [workingHours, checkIn, status, checkOut, breaks]);

  const canCheckIn = status === "Not Checked In" || status === "Absent";
  const canCheckOut = (status === "PRESENT" || status === "Late" || status === "PENDING") && !isOnBreak;

  const renderMainAction = () => {
    if (canCheckIn) {
      return (
        <button onClick={onCheckIn} disabled={isLoading} className="btn btn-primary btn-lg w-full shadow-lg">
          {isLoading ? <span className="loading loading-spinner"></span> : <FaSignInAlt />} Check In
        </button>
      );
    }
    if (canCheckOut) {
      return (
        <button onClick={onCheckOut} disabled={isLoading} className="btn btn-error btn-lg w-full shadow-lg">
          {isLoading ? <span className="loading loading-spinner"></span> : <FaSignOutAlt />} Check Out
        </button>
      );
    }
    return (
      <div className="text-center p-4 bg-base-200 rounded-lg">
        <div className="text-lg font-semibold">Day Ended</div>
        <div className="text-base-content/60">Checked out for today</div>
      </div>
    );
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-lg rounded-2xl">
      <div className="card-body items-center text-center p-6 md:p-8">
        <div className="text-5xl font-mono font-bold tracking-widest mb-4 p-4 bg-base-200 rounded-lg shadow-inner">
          {timer}
        </div>
        <div className="w-full max-w-xs mb-4">{renderMainAction()}</div>

        <div className="divider w-full max-w-xs">Breaks</div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {isOnBreak ? (
            <button onClick={onEndBreak} disabled={isLoading || !checkIn} className="btn btn-secondary col-span-2">
              <FaPlay /> End Break
            </button>
          ) : (
            <>
              <button onClick={() => onStartBreak("Lunch")} disabled={isLoading || !checkIn} className="btn btn-outline">
                Lunch
              </button>
              <button onClick={() => onStartBreak("Tea")} disabled={isLoading || !checkIn} className="btn btn-outline">
                Tea
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInActions;