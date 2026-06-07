import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from "socket.io-client";
import API from "../../services/api";
import { FiSend, FiMessageSquare, FiUser, FiClock, FiBookOpen, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import "../student/Messages.css"; 
import "./InstructorMessages.css";

const socket = io("https://benedex-backend.onrender.com");

function InstructorMessages() {
  const location = useLocation();
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [activeStudent, setActiveStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});
  const [unreadStatusMap, setUnreadStatusMap] = useState({}); 
  const [newLiveIncomingMap, setNewLiveIncomingMap] = useState({}); 

  const [mobileView, setMobileView] = useState("list");

  const loggedInUser = JSON.parse(localStorage.getItem("user")) || {};
  const currentInstructorId = loggedInUser._id;
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // PHASE 1: Fetch rosters, construct maps, and intercept remote routing instructions
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        setLoadingStudents(true);
        const res = await API.get("/courses/instructor/my-courses");
        
        const uniqueStudents = [];
        const seenIds = new Set();
        const initialTimestamps = {};
        const initialUnreadMap = {};

        if (res.data && Array.isArray(res.data)) {
          for (const courseItem of res.data) {
            if (courseItem.students && Array.isArray(courseItem.students)) {
              for (const student of courseItem.students) {
                if (student && student._id && !seenIds.has(student._id)) {
                  seenIds.add(student._id);
                  uniqueStudents.push({
                    ...student,
                    courseContext: courseItem.title || "Enrolled Course"
                  });
                }
              }
            }
          }

          // Build history maps for metadata tracking
          await Promise.all(
            uniqueStudents.map(async (student) => {
              try {
                const historyRes = await API.get(`/messages/${student._id}`);
                if (historyRes.data && historyRes.data.length > 0) {
                  const historyLogs = historyRes.data;
                  const lastMsg = historyLogs[historyLogs.length - 1];
                  
                  initialTimestamps[student._id] = new Date(lastMsg.createdAt).getTime();

                  const isIncoming = (typeof lastMsg.sender === "object" ? lastMsg.sender?._id : lastMsg.sender) === student._id;
                  if (isIncoming && lastMsg.read === false) {
                    initialUnreadMap[student._id] = true;
                  }
                } else {
                  initialTimestamps[student._id] = 0;
                }
              } catch (err) {
                console.error(`Error pulling timeline data for student ${student._id}:`, err);
                initialTimestamps[student._id] = 0;
              }
            })
          );
        }
        
        setLastMessageTimestamps(initialTimestamps);
        setUnreadStatusMap(initialUnreadMap);
        setEnrolledStudents(uniqueStudents);
        
        // 🚨 CHAT THREAD REDIRECTION INTERCEPTOR LOGIC
        if (location.state?.redirectedFromRoster && location.state?.targetStudentData) {
          const targetedStudent = location.state.targetStudentData;
          
          // Verify if the targeted student object exists in our unique manifest matching state
          const existingProfileMatch = uniqueStudents.find(s => s._id === targetedStudent._id);
          
          if (existingProfileMatch) {
            setActiveStudent(existingProfileMatch);
          } else {
            // Fallback strategy if student wasn't inside the array compilation structure
            setEnrolledStudents(prev => [targetedStudent, ...prev]);
            setActiveStudent(targetedStudent);
          }
          
          setMobileView("chat");

          // Clear history markers out
          window.history.replaceState({}, document.title);
          
        } else if (uniqueStudents.length > 0 && window.innerWidth > 768) {
          // Standard execution layer fallback if no explicit route navigation trigger exists
          const sortedInitialList = [...uniqueStudents].sort((a, b) => {
            const timeA = initialTimestamps[a._id] || 0;
            const timeB = initialTimestamps[b._id] || 0;
            return timeB - timeA;
          });
          
          const defaultActive = sortedInitialList[0];
          setActiveStudent(defaultActive);
          setMobileView("chat");
          
          if (initialUnreadMap[defaultActive._id]) {
            setUnreadStatusMap(prev => ({ ...prev, [defaultActive._id]: false }));
          }
        }
      } catch (error) {
        console.error("Failed to sync enrolled course roster maps:", error);
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchEnrolledStudents();
  }, [location.state]);

  // PHASE 2: Live Room Streaming Channel Control Setup
  useEffect(() => {
    if (!currentInstructorId || !activeStudent?._id) return;

    const activeChatPartnerId = activeStudent._id;
    const privateRoomId = [currentInstructorId, activeChatPartnerId].sort().join("-");
    
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

      setLastMessageTimestamps((prev) => ({
        ...prev,
        [incomingSenderId]: timestamp
      }));

      if (incomingSenderId === activeChatPartnerId) {
        setMessages((prev) => [...prev, incomingMsg]);
      } else {
        setNewLiveIncomingMap((prev) => ({
          ...prev,
          [incomingSenderId]: true
        }));
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [activeStudent, currentInstructorId]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !activeStudent?._id) return;

    const textToSend = message.trim();
    const activeChatPartnerId = activeStudent._id;
    setMessage("");

    const currentTimeString = new Date().toISOString();
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: optimisticId,
      message: textToSend,
      sender: {
        _id: currentInstructorId,
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
          _id: currentInstructorId,
          fullName: loggedInUser.fullName || "You",
          profileImage: loggedInUser.profileImage
        }
      };

      setMessages((prev) =>
        prev.map((msg) => (msg._id === optimisticId ? normalizedDatabaseRecord : msg))
      );

      const privateRoomId = [currentInstructorId, activeChatPartnerId].sort().join("-");
      socket.emit("send-message", {
        room: privateRoomId,
        ...normalizedDatabaseRecord,
      });

    } catch (error) {
      console.error("Failed to commit chat token downstream:", error);
    }
  };

  const handleSelectStudent = (student) => {
    setActiveStudent(student);
    setMobileView("chat");
    setNewLiveIncomingMap((prev) => ({ ...prev, [student._id]: false }));
    setUnreadStatusMap((prev) => ({ ...prev, [student._id]: false }));
  };

  const handleBackToRoster = () => {
    setMobileView("list");
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  const sortedStudents = [...enrolledStudents].sort((a, b) => {
    const timeA = lastMessageTimestamps[a._id] || 0;
    const timeB = lastMessageTimestamps[b._id] || 0;
    return timeB - timeA; 
  });

  if (loadingStudents) {
    return (
      <div className="scd-loader-container">
        <div className="scd-spinner" />
        <p>Resolving Enrolled Student Portals...</p>
      </div>
    );
  }

  return (
    <div className="message-layout-root">
      <div className={`benedex-container messaging-flex-box mobile-view-${mobileView}`}>
        
        {/* SIDEBAR ROSTER MENU COMPONENT */}
        <div className="faculty-channels-sidebar">
          <div className="sidebar-header-node">
            <FiBookOpen className="sidebar-icon-badge" />
            <div>
              <h3>Enrolled Students</h3>
              <span>Active Rosters ({sortedStudents.length})</span>
            </div>
          </div>
          <div className="faculty-list-scroll-area">
            {sortedStudents.length > 0 ? (
              sortedStudents.map((student) => {
                const isSelected = activeStudent?._id === student._id;
                const hasNewLiveAlert = newLiveIncomingMap[student._id];
                const hasUnreadHistory = unreadStatusMap[student._id];

                return (
                  <button
                    key={student._id}
                    className={`faculty-channel-item ${isSelected ? "active-channel" : ""} ${hasNewLiveAlert ? "has-new-alert" : ""}`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="faculty-avatar-wrapper">
                      {student.profileImage ? (
                        <img src={student.profileImage} alt={student.fullName} />
                      ) : (
                        <div className="faculty-avatar-initials">{getInitials(student.fullName)}</div>
                      )}
                      <span className="live-status-indicator"></span>
                    </div>
                    <div className="faculty-channel-details">
                      <strong>{student.fullName}</strong>
                      <span title={student.courseContext}>{student.courseContext}</span>
                    </div>

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
                <p>No registered class students detected yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* MAIN COMMUNICATIONS PANEL COMPONENT */}
        <div className="chat-window-surface">
          {activeStudent ? (
            <>
              <div className="chat-stream-header">
                <div className="chat-header-identity">
                  <button type="button" className="mobile-back-button" onClick={handleBackToRoster}>
                    <FiArrowLeft size={20} />
                  </button>
                  
                  <div className="avatar-room-placeholder">
                    {activeStudent.profileImage ? (
                      <img src={activeStudent.profileImage} alt={activeStudent.fullName} className="header-avatar-img" />
                    ) : (
                      <div className="header-avatar-fallback">{getInitials(activeStudent.fullName)}</div>
                    )}
                  </div>
                  <div>
                    <h2>{activeStudent.fullName}</h2>
                    <span className="live-pulse-badge">
                      <span className="pulse-dot"></span> {activeStudent.courseContext}
                    </span>
                  </div>
                </div>
              </div>

              {/* MESSAGES VIEWPORT MATRIX */}
              <div className="chat-messages-viewport">
                {loadingMessages ? (
                  <div className="chat-viewport-inline-loader">
                    <div className="scd-spinner-sm" />
                    <p>Syncing discussion records...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
                    const isOwnMessage = senderId === currentInstructorId;
                    const displayName = isOwnMessage ? "You" : (msg.sender?.fullName || activeStudent.fullName);

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
                    <p>Provide instructional feedback or answers to student queries here. Chat history is stored securely.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT FORM MATRIX */}
              <form className="chat-input-bar-form" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder={`Write your direct reply to ${activeStudent.fullName}...`}
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
              <h3>No Selected Student</h3>
              <p>Please click on an active enrolled student from the sidebar roster pane to open communication channels.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default InstructorMessages;