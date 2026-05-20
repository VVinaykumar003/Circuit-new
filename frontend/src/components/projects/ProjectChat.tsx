import { connect, socket } from "@/ws";
import { useEffect, useState , useRef } from "react";
import { useAuth } from "@/auth/AuthContext"; // Import useAuth
import API from "@/api/axios";

interface Message {
  _id: string;
  projectId?: string; 
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface Props {
  projectId: string;
  currentUser: any; // Ideally more specific type like { userId: string; name: string; ... }
}


function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProjectChat({ projectId, currentUser }: Props) {
  const socketRef = useRef<any>(null); // Use any for now, better to type the socket.io client
  const name = currentUser?.name || "Unknown User";
  const {auth} = useAuth();
  // console.log(currentUser)
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  // Initialize the Audio object once
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio("/sounds/notification.mp3"); 
    
    // Catch missing file errors gracefully
    audioRef.current.onerror = () => {
      console.warn("Could not load sound file. Please ensure /sounds/notification.mp3 exists in your frontend/public folder.");
    };
  }, []);

  // 🔥 Future: Load from backend
  useEffect(() => {
    socketRef.current = connect(); // Connect to WebSocket

    // Join the specific project room
    socketRef.current.emit("joinProject", projectId,currentUser?.name);

    // Listen for room join notifications
    socketRef.current.on("joinRoom", (notification: string) => {
      console.log("notification",notification);
    });

    // Listen for incoming messages from others
    socketRef.current.on("newMessage", (message: Message) => {
      setMessages((prev) => {
        // Prevent duplicates if the server broadcasts the message back to sender
        if (prev.some((m) => m._id === message._id)) return prev;
        
        // Play sound if the message is from someone else
        const isOwnMessage = message.senderId === (currentUser?.userId || currentUser?._id);
        if (!isOwnMessage && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.warn("Browser blocked the notification sound.", error);
          });
        }
        
        return [...prev, message];
      });
    });

    // Fetch historical messages from backend
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/messages/${auth.slug}/${projectId}`);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();

    // Proper React cleanup function to avoid duplicate listeners
    return () => {
      if (socketRef.current) {
        socketRef.current.off("joinRoom");
        socketRef.current.off("newMessage");
        // socketRef.current.emit("leaveProject", projectId);
      }
    };
  }, [projectId]); // Re-run effect if projectId changes

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const optimisticMessage: Message = {
      _id: Date.now().toString(),
      senderId: currentUser?.userId || currentUser?._id, // Use actual user ID
      senderName: currentUser?.name || "You", // Use actual user name
      text: newMessage,
      createdAt: new Date().toISOString(),
      projectId,
    };

    // Show instantly
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      setLoading(true);

      // Emit message to server via socket.io
      socketRef.current.emit("sendMessage", {
        projectId,
        senderId: currentUser?.userId || currentUser?._id,
        senderName: currentUser?.name || "You",
        text: newMessage,
      });

    } catch (err) {
      console.log("Message saved locally only",err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 border border-base-300 rounded-lg flex flex-col h-[500px]">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwnMessage = msg.senderId === currentUser?.userId || msg.senderId === currentUser?._id;
          return (
            <div
            key={msg._id}
            className={`flex ${
              isOwnMessage
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm text-sm  ${
                isOwnMessage
                  ? "bg-purple-400 text-primary-content"
                  : "bg-base-200 text-base-content"
              }`}
            >
              <div className="flex justify-between items-center mb-1 gap-1">
              <p className="font-medium text-xs text-base-content">
                  {msg.senderName}
                </p>
              <p className="text-[10px] text-base-content">
                  {formatTime(msg.createdAt)}
                </p>
              </div>
              <p>{msg.text}</p>
            </div>
          </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t border-base-300 p-3 flex gap-2">
        <input
          type="text"
         
          placeholder="Type a message..."
          className="input input-bordered w-full placeholder:text-base-content/70 text-base-content"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}