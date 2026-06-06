import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import API from "../../services/api";
import { FiSend, FiMessageSquare, FiUser, FiClock, FiBookOpen, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import "./Messages.css";

const socket = io("https://benedex-backend.onrender.com");

function Messages() {
  const [instructors, setInstructors] = useState([]);
  const [activeInstructor, setActiveInstructor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingInstructors, setLoadingInstructors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // Tracking infrastructure for dynamic badging states and top sorting arrays
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});
  const [unreadStatusMap, setUnreadStatusMap] = useState({}); // Historical unread db state
  const [newLiveIncomingMap, setNewLiveIncomingMap] = useState({}); // Realtime live runtime alerts

  // Track mobile navigation layer context: 'list' vs 'chat'
  const [mobileView, setMobileView] = useState("list");

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentUserId = loggedInUser._id;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // PHASE 1: Fetch instructors, extract timelines, and map historical unread markers
  useEffect(() => {
    const fetchRegisteredInstructors = async () => {
      try {
        setLoadingInstructors(true);
        const res = await API.get("/courses/student/registered");
        
        const uniqueInstructors = [];
        const seenIds = new Set();
        const initialTimestamps = {};
        const initialUnreadMap = {};

        if (res.data && Array.isArray(res.data)) {
          res.data.forEach((courseItem) => {
            const instructor = courseItem.instructor;
            if (instructor && instructor._id && !seenIds.has(instructor._id)) {
              if (instructor.role === "instructor" || instructor.role === "Instructor") {
                seenIds.add(instructor._id);
                uniqueInstructors.push({
                  ...instructor,
                  courseContext: courseItem.title || "Registered Course"
                });
              }
            }
          });

          // Look up chat logs to extract latest timestamps and determine reading markers
          await Promise.all(
            uniqueInstructors.map(async (faculty) => {
              try {
                const historyRes = await API.get(`/messages/${faculty._id}`);
                if (historyRes.data && historyRes.data.length > 0) {
                  const historyLogs = historyRes.data;
                  const lastMsg = historyLogs[historyLogs.length - 1];

                  initialTimestamps[faculty._id] = new Date(lastMsg.createdAt).getTime();

                  // If the last message was incoming from the instructor and marked unread
                  const isIncoming = (typeof lastMsg.sender === "object" ? lastMsg.sender?._id : lastMsg.sender) === faculty._id;
                  if (isIncoming && lastMsg.read === false) {
                    initialUnreadMap[faculty._id] = true;
                  }
                } else {
                  initialTimestamps[faculty._id] = 0; // Default lower bound for sorting
                }
              } catch (err) {
                console.error(`Error pulling matrix timeline for instructor ${faculty._id}:`, err);
                initialTimestamps[faculty._id] = 0;
              }
            })
          );
        }
        
        setLastMessageTimestamps(initialTimestamps);
        setUnreadStatusMap(initialUnreadMap);
        setInstructors(uniqueInstructors);
        
        // Auto-select top item array only on large viewport displays
        if (uniqueInstructors.length > 0 && window.innerWidth > 768) {
          const sortedInitialList = [...uniqueInstructors].sort((a, b) => {
            const timeA = initialTimestamps[a._id] || 0;
            const timeB = initialTimestamps[b._id] || 0;
            return timeB - timeA;
          });

          const defaultActive = sortedInitialList[0];
          setActiveInstructor(defaultActive);
          setMobileView("chat");

          if (initialUnreadMap[defaultActive._id]) {
            setUnreadStatusMap(prev => ({ ...prev, [defaultActive._id]: false }));
          }
        }
      } catch (error) {
        console.error("Failed to sync registered course faculty maps:", error);
      } finally {
        setLoadingInstructors(false);
      }
    };

    fetchRegisteredInstructors();
  }, []);

  // PHASE 2: Live Room Streaming Connections
  useEffect(() => {
    if (!currentUserId || !activeInstructor?._id) return;

    const activeChatPartnerId = activeInstructor._id;
    const privateRoomId = [currentUserId, activeChatPartnerId].sort().join("-");
    
    socket.emit("join-room", privateRoomId);

    const fetchChatHistory = async () => {
      try {
        setLoadingMessages(true);
        const res = await API.get(`/messages/${activeChatPartnerId}`);
        if (res.data) {
          setMessages(res.data);
        }
      } catch (error) {
        console.error("Backend historical message query breakdown:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchChatHistory();

    socket.on("receive-message", (incomingMsg) => {
      const incomingSenderId = typeof incomingMsg.sender === "object" ? incomingMsg.sender?._id : incomingMsg.sender;
      const timestamp = new Date(incomingMsg.createdAt).getTime();

      // Dynamic bump up trigger targeting our reactive state lists
      setLastMessageTimestamps((prev) => ({
        ...prev,
        [incomingSenderId]: timestamp
      }));

      if (incomingSenderId === activeChatPartnerId) {
        setMessages((prev) => [...prev, incomingMsg]);
      } else {
        // Apply bright red live notice badge marker
        setNewLiveIncomingMap((prev) => ({
          ...prev,
          [incomingSenderId]: true
        }));
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [activeInstructor, currentUserId]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !activeInstructor?._id) return;

    const textToSend = message.trim();
    const activeChatPartnerId = activeInstructor._id;
    setMessage("");

    const currentTimeString = new Date().toISOString();
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      message: textToSend,
      sender: {
        _id: currentUserId,
        fullName: loggedInUser.fullName || "You",
        profileImage: loggedInUser.profileImage
      },
      createdAt: currentTimeString
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    setLastMessageTimestamps((prev) => ({
      ...prev,
      [activeChatPartnerId]: new Date(currentTimeString).getTime()
    }));

    try {
      const res = await API.post("/messages", {
        receiver: activeChatPartnerId,
        message: textToSend,
      });

      const normalizedDatabaseRecord = {
        ...res.data,
        sender: {
          _id: currentUserId,
          fullName: loggedInUser.fullName || "You",
          profileImage: loggedInUser.profileImage
        }
      };

      setMessages((prev) =>
        prev.map((msg) => (msg._id === optimisticId ? normalizedDatabaseRecord : msg))
      );

      const privateRoomId = [currentUserId, activeChatPartnerId].sort().join("-");
      socket.emit("send-message", {
        room: privateRoomId,
        ...normalizedDatabaseRecord,
      });

    } catch (error) {
      console.error("Failed to commit chat token downstream:", error);
    }
  };

  const handleSelectInstructor = (instructor) => {
    setActiveInstructor(instructor);
    setMobileView("chat");

    // Instantly wipe badging markers out of application memory states
    setNewLiveIncomingMap((prev) => ({ ...prev, [instructor._id]: false }));
    setUnreadStatusMap((prev) => ({ ...prev, [instructor._id]: false }));
  };

  const handleBackToList = () => {
    setMobileView("list");
  };

  const getInitials = (name) => {
    if (!name) return "IN";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  // Perform chronological layout ordering safely
  const sortedInstructors = [...instructors].sort((a, b) => {
    const timeA = lastMessageTimestamps[a._id] || 0;
    const timeB = lastMessageTimestamps[b._id] || 0;
    return timeB - timeA;
  });

  if (loadingInstructors) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Resolving Academic Faculty Channels...</p>
      </div>
    );
  }

  return (
    <div className="message-layout-root">
      <div className={`benedex-container messaging-flex-box mobile-view-${mobileView}`}>
        
        {/* SIDEBAR BLOCK ENTRY PANEL */}
        <div className="faculty-channels-sidebar">
          <div className="sidebar-header-node">
            <FiBookOpen className="sidebar-icon-badge" />
            <div>
              <h3>Course Instructors</h3>
              <span>Active Portals ({sortedInstructors.length})</span>
            </div>
          </div>
          <div className="faculty-list-scroll-area">
            {sortedInstructors.length > 0 ? (
              sortedInstructors.map((faculty) => {
                const isSelected = activeInstructor?._id === faculty._id;
                const hasNewLiveAlert = newLiveIncomingMap[faculty._id];
                const hasUnreadHistory = unreadStatusMap[faculty._id];

                return (
                  <button
                    key={faculty._id}
                    className={`faculty-channel-item ${isSelected ? "active-channel" : ""} ${hasNewLiveAlert ? "has-new-alert" : ""}`}
                    onClick={() => handleSelectInstructor(faculty)}
                  >
                    <div className="faculty-avatar-wrapper">
                      {faculty.profileImage ? (
                        <img src={faculty.profileImage} alt={faculty.fullName} />
                      ) : (
                        <div className="faculty-avatar-initials">{getInitials(faculty.fullName)}</div>
                      )}
                      <span className="live-status-indicator"></span>
                    </div>
                    <div className="faculty-channel-details">
                      <strong>{faculty.fullName}</strong>
                      <span title={faculty.courseContext}>{faculty.courseContext}</span>
                    </div>

                    {/* DYNAMIC ALERT BADGING PANE */}
                    <div className="roster-badge-cell-zone">
                      {hasNewLiveAlert ? (
                        <span className="roster-badge-indicator live-new-red">New</span>
                      ) : hasUnreadHistory ? (
                        <span className="roster-badge-indicator historical-unread-gray">Unread</span>
                      ) : null}
                      <FiChevronRight className="channel-arrow" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-sidebar-fallback">
                <FiUser size={24} />
                <p>No assigned course instructors detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* CHAT WINDOW INTERFACE PANEL */}
        <div className="chat-window-surface">
          {activeInstructor ? (
            <>
              <div className="chat-stream-header">
                <div className="chat-header-identity">
                  <button type="button" className="mobile-back-button" onClick={handleBackToList}>
                    <FiArrowLeft size={20} />
                  </button>
                  
                  <div className="avatar-room-placeholder">
                    {activeInstructor.profileImage ? (
                      <img src={activeInstructor.profileImage} alt={activeInstructor.fullName} className="header-avatar-img" />
                    ) : (
                      <div className="header-avatar-fallback">{getInitials(activeInstructor.fullName)}</div>
                    )}
                  </div>
                  <div>
                    <h2>{activeInstructor.fullName}</h2>
                    <span className="live-pulse-badge">
                      <span className="pulse-dot"></span> {activeInstructor.courseContext}
                    </span>
                  </div>
                </div>
              </div>

              <div className="chat-messages-viewport">
                {loadingMessages ? (
                  <div className="chat-viewport-inline-loader">
                    <div className="scd-spinner-sm" />
                    <p>Syncing historical chat metrics...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
                    const isOwnMessage = senderId === currentUserId;
                    const displayName = isOwnMessage ? "You" : (msg.sender?.fullName || activeInstructor.fullName);

                    return (
                      <div 
                        key={msg._id || index} 
                        className={`message-bubble-wrapper ${isOwnMessage ? "outgoing-node" : "incoming-node"}`}
                      >
                        <div className="message-user-badge">
                          <FiUser size={10} style={{ marginRight: '2px' }} />
                          <span>{displayName}</span>
                        </div>
                        <div className="message-text-bubble">
                          <p>{msg.message}</p>
                          <span className="timestamp-delivery">
                            <FiClock size={10} />
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-chat-placeholder">
                    <FiMessageSquare size={40} />
                    <h3>Discussion Matrix Initiated</h3>
                    <p>Transmit an opening query regarding course tasks. Records persist securely on your dashboard environment.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder={`Write your private message to ${activeInstructor.fullName}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="btn-send-message-action" disabled={!message.trim() || loadingMessages}>
                  <FiSend /> <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat-placeholder mobile-hidden-placeholder">
              <FiUser size={40} />
              <h3>No Selected Channel</h3>
              <p>Please click on an active instructor from the left list block pane to open channels.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Messages;