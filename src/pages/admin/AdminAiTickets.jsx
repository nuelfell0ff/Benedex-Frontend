import { useEffect, useState } from "react";
import {
  FiCheck,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiUser,
  FiBookOpen,
  FiHash,
  FiCalendar,
  FiMessageSquare,
} from "react-icons/fi";
import API from "../../services/api";
import "./AdminAiTickets.css";

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

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (ticketId, action) => {
    const notes = rejectionNotes[ticketId] || "";

    if (action === "rejected" && !notes.trim()) {
      alert(
        "Please provide a reason for rejecting this payment transaction."
      );
      return;
    }

    setProcessingId(ticketId);

    try {
      await API.put(`/admin/tickets/${ticketId}`, {
        action,
        adminNotes: notes,
      });

      fetchTickets();
    } catch (err) {
      console.error("Action submit execution error:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleNoteChange = (ticketId, val) => {
    setRejectionNotes((prev) => ({
      ...prev,
      [ticketId]: val,
    }));
  };

  const getStatusBadge = (status) => {
    if (status === "pending") {
      return (
        <span className="ait-status-badge ait-status-pending">
          <FiClock size={14} />
          Pending
        </span>
      );
    }

    if (status === "resolved") {
      return (
        <span className="ait-status-badge ait-status-resolved">
          <FiCheckCircle size={14} />
          Approved
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="ait-status-badge ait-status-rejected">
          <FiAlertCircle size={14} />
          Rejected
        </span>
      );
    }

    return (
      <span className="ait-status-badge ait-status-default">
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="ait-workspace">
      <div className="ait-container">
        {/* Page Header */}
        <div className="ait-page-header">
          <div className="ait-header-main">
            <div className="ait-header-icon">
              <FiCreditCard size={25} />
            </div>

            <div className="ait-header-content">
              <span className="ait-eyebrow">AI Support</span>

              <h1>Benedex AI Support Tickets</h1>

              <p>
                Review payment disputes forwarded by the AI assistant
                and resolve them from the admin workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchTickets}
            disabled={loading}
            className="ait-refresh-btn"
          >
            <FiRefreshCw
              size={17}
              className={loading ? "ait-spin-icon" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="ait-summary-grid">
          <div className="ait-summary-card">
            <div className="ait-summary-icon ait-summary-icon-blue">
              <FiMessageSquare size={19} />
            </div>

            <div>
              <span>Total Tickets</span>
              <strong>{tickets.length}</strong>
            </div>
          </div>

          <div className="ait-summary-card">
            <div className="ait-summary-icon ait-summary-icon-warning">
              <FiClock size={19} />
            </div>

            <div>
              <span>Pending Review</span>
              <strong>
                {
                  tickets.filter(
                    (ticket) => ticket.status === "pending"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="ait-summary-card">
            <div className="ait-summary-icon ait-summary-icon-success">
              <FiCheckCircle size={19} />
            </div>

            <div>
              <span>Approved</span>
              <strong>
                {
                  tickets.filter(
                    (ticket) => ticket.status === "resolved"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="ait-summary-card">
            <div className="ait-summary-icon ait-summary-icon-danger">
              <FiAlertCircle size={19} />
            </div>

            <div>
              <span>Rejected</span>
              <strong>
                {
                  tickets.filter(
                    (ticket) => ticket.status === "rejected"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="ait-card">
          <div className="ait-card-header">
            <div>
              <span className="ait-section-eyebrow">
                Payment Disputes
              </span>

              <h2>Support Ticket Queue</h2>

              <p>
                Verify payment information and resolve outstanding AI
                support requests.
              </p>
            </div>

            <div className="ait-ticket-count">
              <FiMessageSquare size={16} />
              {tickets.length}{" "}
              {tickets.length === 1 ? "ticket" : "tickets"}
            </div>
          </div>

          {loading ? (
            <div className="ait-state-container">
              <div className="ait-loading-spinner">
                <FiRefreshCw size={22} />
              </div>

              <h3>Loading support tickets</h3>

              <p>
                Fetching the latest payment dispute records...
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="ait-state-container ait-empty-state">
              <div className="ait-empty-icon">
                <FiCheckCircle size={25} />
              </div>

              <h3>No support tickets</h3>

              <p>
                There are currently no AI support tickets available
                for review.
              </p>
            </div>
          ) : (
            <div className="ait-table-wrapper">
              <table className="ait-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Requested Course</th>
                    <th>Payment Reference</th>
                    <th>Payment Time</th>
                    <th>Status</th>
                    <th className="ait-actions-heading">
                      Resolution
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket._id}>
                      {/* Student */}
                      <td>
                        <div className="ait-student">
                          <div className="ait-student-avatar">
                            <FiUser size={17} />
                          </div>

                          <div className="ait-student-info">
                            <strong>
                              {ticket.userId?.fullName ||
                                "Unknown"}
                            </strong>

                            <span>
                              {ticket.userId?.email ||
                                "No email available"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td>
                        <div className="ait-course-cell">
                          <div className="ait-cell-icon">
                            <FiBookOpen size={15} />
                          </div>

                          <span>
                            {ticket.courseName || "Unknown course"}
                          </span>
                        </div>
                      </td>

                      {/* Reference */}
                      <td>
                        <div className="ait-reference">
                          <FiHash size={14} />

                          <code>
                            {ticket.paymentReference ||
                              "No reference"}
                          </code>
                        </div>
                      </td>

                      {/* Payment Time */}
                      <td>
                        <div className="ait-date-cell">
                          <FiCalendar size={14} />

                          <span>
                            {ticket.paymentTime || "Not available"}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td>{getStatusBadge(ticket.status)}</td>

                      {/* Actions */}
                      <td>
                        {ticket.status === "pending" ? (
                          <div className="ait-resolution-box">
                            <div className="ait-note-input">
                              <FiMessageSquare size={15} />

                              <input
                                type="text"
                                placeholder="Reason for rejection..."
                                value={
                                  rejectionNotes[ticket._id] || ""
                                }
                                onChange={(e) =>
                                  handleNoteChange(
                                    ticket._id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="ait-action-buttons">
                              <button
                                type="button"
                                disabled={
                                  processingId === ticket._id
                                }
                                onClick={() =>
                                  handleAction(
                                    ticket._id,
                                    "resolved"
                                  )
                                }
                                className="ait-action-btn ait-approve-btn"
                              >
                                <FiCheck size={15} />

                                {processingId === ticket._id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                disabled={
                                  processingId === ticket._id
                                }
                                onClick={() =>
                                  handleAction(
                                    ticket._id,
                                    "rejected"
                                  )
                                }
                                className="ait-action-btn ait-reject-btn"
                              >
                                <FiX size={15} />

                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="ait-admin-note">
                            <span>Admin resolution</span>

                            <p>
                              {ticket.adminNotes ||
                                "No notes added."}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}