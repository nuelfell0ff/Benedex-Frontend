import { useEffect, useState } from "react";
import { FiCheck, FiX, FiRefreshCw, FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";
import API from "../../services/api";

export default function AdminAiTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Failed to load AI tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🆕 FIX 1: Automatically fetch the tickets when the component mounts
  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (ticketId, action) => {
    const notes = rejectionNotes[ticketId] || ""; // 🆕 FIX 2: Correctly reference notes from state array
    if (action === "rejected" && !notes.trim()) {
      alert("Please provide a reason for rejecting this payment transaction.");
      return;
    }

    setProcessingId(ticketId);
    try {
      await API.put(`/admin/tickets/${ticketId}`, {
        action,
        adminNotes: notes
      });
      fetchTickets();
    } catch (err) {
      console.error("Action submit execution error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNoteChange = (ticketId, val) => {
    setRejectionNotes(prev => ({ ...prev, [ticketId]: val }));
  };

  return (
    <div className="admin-tickets-container" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "22px", color: "#194066", margin: 0 }}>Benedex AI Support Tickets</h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>Verify and reconcile payment disputes forwarded by the AI assistant.</p>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#0d5aa0", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
        >
          <FiRefreshCw className={loading ? "ai-spin-icon" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading tickets dashboard logs...</div>
      ) : tickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#64748b" }}>
          No support tickets available matching this filter.
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#1e293b" }}>
                <th style={{ padding: "14px" }}>Student Details</th>
                <th style={{ padding: "14px" }}>Requested Course</th>
                <th style={{ padding: "14px" }}>Reference Token</th>
                <th style={{ padding: "14px" }}>Payment Timestamp</th>
                <th style={{ padding: "14px" }}>Status</th>
                <th style={{ padding: "14px", textAlign: "right" }}>Actions / Resolution Notes</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} style={{ borderBottom: "1px solid #e2e8f0", color: "#334155" }}>
                  <td style={{ padding: "14px" }}>
                    <strong>{ticket.userId?.fullName || "Unknown"}</strong>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{ticket.userId?.email}</div>
                  </td>
                  <td style={{ padding: "14px" }}>{ticket.courseName}</td>
                  <td style={{ padding: "14px" }}><code style={{ backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{ticket.paymentReference}</code></td>
                  <td style={{ padding: "14px" }}>{ticket.paymentTime}</td>
                  <td style={{ padding: "14px" }}>
                    {ticket.status === "pending" && <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}><FiClock /> Pending</span>}
                    {ticket.status === "resolved" && <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#dcfce7", color: "#15803d", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}><FiCheckCircle /> Approved</span>}
                    {ticket.status === "rejected" && <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#fee2e2", color: "#b91c1c", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "500" }}><FiAlertCircle /> Rejected</span>}
                  </td>
                  <td style={{ padding: "14px" }}>
                    {ticket.status === "pending" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "260px", marginLeft: "auto" }}>
                        <input
                          type="text"
                          placeholder="Reason for rejection notes..."
                          value={rejectionNotes[ticket._id] || ""}
                          onChange={(e) => handleNoteChange(ticket._id, e.target.value)}
                          style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "13px" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            disabled={processingId === ticket._id}
                            onClick={() => handleAction(ticket._id, "resolved")}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", backgroundColor: "#15803d", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            disabled={processingId === ticket._id}
                            onClick={() => handleAction(ticket._id, "rejected")}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", backgroundColor: "#b91c1c", color: "#fff", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", fontSize: "13px" }}
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", textAlign: "right" }}>
                        {ticket.adminNotes || "No notes added."}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}