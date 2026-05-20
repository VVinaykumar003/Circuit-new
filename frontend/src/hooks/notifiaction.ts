import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { socket } from "@/socket";
import { useAuth } from "@/auth/AuthContext";





// Path to the sound file in your public directory
const NOTIFY_SOUND_URL = "/notification.mp3";

export function useNotificationSocket(userId: string, onNotification?: () => void) {
  // 1. Initialize the Audio object once using useRef
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {auth} = useAuth();
  const  user  =auth.user;
  const { role } = user?.role ? user.role : {};
  useEffect(() => {
    // Only initialize it on the client side
    audioRef.current = new Audio(NOTIFY_SOUND_URL);
    
    // Catch missing file errors gracefully
    audioRef.current.onerror = () => {
      console.warn(`Could not load sound file. Please ensure ${NOTIFY_SOUND_URL} exists in your frontend/public folder.`);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    if (role === "admin") {
  socket.emit("joinAdminRoom");
  console.log("👑 Joined admin room");
}

    // Join a specific room for this user to receive personal notifications
    socket.emit("joinUserRoom", userId);

    // 3. Define the event handler
    const handleNotification = (data: any) => {
      console.log("New notification received:", data);
      
      // Trigger the optional callback to refresh data
      if (onNotification) onNotification();

      // Use the message from the backend payload, or a default fallback
      const message = data?.message || data?.title || "You have a new notification!";
      toast.info(message);

      // 4. Play the notification sound
      if (audioRef.current) {
        // Reset the audio to start in case it's already playing
        audioRef.current.currentTime = 0; 
        
        audioRef.current.play().catch((error) => {
          // 5. Handle browser autoplay policy restrictions
          console.warn("Browser blocked the notification sound.", error);
          // Usually, you might want to show a UI banner asking the user to interact 
          // with the page so sounds can be unmuted.
        });
      }
    };

    // Listen for various ERP events
    socket.on("notification", handleNotification);
    socket.on("attendanceMarked", handleNotification);
    socket.on("new_notification", handleNotification);
    socket.on("itemCreated", handleNotification);

    // Cleanup the socket connection and listener when the component unmounts
    return () => {
      socket.off("notification", handleNotification);
      socket.off("attendanceMarked", handleNotification);
      socket.off("new_notification", handleNotification);
      socket.off("itemCreated", handleNotification);
    };
  }, [userId]);
}
