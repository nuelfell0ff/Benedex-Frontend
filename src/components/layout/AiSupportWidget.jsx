import { useState, useEffect, useRef } from "react";
import { FiMessageSquare, FiX, FiSend, FiLoader, FiCpu } from "react-icons/fi";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AiSupportWidget.css";

export default function AiSupportWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll inside chat window frame
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Pull existing session logs when drawer opens
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchHistory = async () => {
      try {
        const res = await API.get("/ai/history");
        setMessages(res.data || []);
      } catch (err) {
        console.error("Could not recover AI history tokens:", err);
      }
    };

    fetchHistory();
  }, [isOpen, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Optimistic frontend rendering match
    const temporaryUserLog = {
      _id: `temp-${Date.now()}`,
      role: "user",
      message: userMessage,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, temporaryUserLog]);
    setLoading(true);

    try {
      const res = await API.post("/ai/chat", { message: userMessage });
      // Replace or push the clean database response matching backend
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("AI stream processing failure:", err);
      setMessages((prev) => [
        ...prev,
        {
          _id: `err-${Date.now()}`,
          role: "model",
          message: "Sorry, I am experiencing connection delays. Please try typing your request again.",
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Hide widget if user is logged out completely

  return (
    <div className="ai-widget-root">
      {/* 1. Floating Round Trigger Action Button */}
      {!isOpen && (
        <button 
          className="ai-widget-trigger" 
          onClick={() => setIsOpen(true)}
          aria-label="Open Benedex Support"
        >
          <FiMessageSquare size={24} />
          <span className="ai-trigger-pulse"></span>
        </button>
      )}

      {/* 2. Messenger Style Floating Box Panel Drawer */}
      {isOpen && (
        <div className="ai-chat-drawer">
          <div className="ai-drawer-header">
            <div className="ai-header-profile">
              <div className="ai-avatar-badge">
                <FiCpu size={18} />
              </div>
              <div>
                <h4>Benedex AI</h4>
                <span>Admin Assistant</span>
              </div>
            </div>
            <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
              <FiX size={18} />
            </button>
          </div>

          {/* Messages viewport surface zone */}
          <div className="ai-drawer-body">
            {messages.length === 0 ? (
              <div className="ai-empty-state">
                <p>Hello {user?.fullName || "there"}! Need help with your dashboard, settings, or payments?</p>
                <span>Ask me anything below.</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`ai-msg-row ${msg.role === "user" ? "ai-row-user" : "ai-row-model"}`}
                >
                  <div className="ai-msg-bubble">
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="ai-msg-row ai-row-model">
                <div className="ai-msg-bubble ai-loading-bubble">
                  <FiLoader className="ai-spin-icon" /> Generating response...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input messaging interface */}
          <form className="ai-drawer-footer" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask Benedex support..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}