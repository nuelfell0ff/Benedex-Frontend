import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  LuShieldAlert, 
  LuRefreshCw, 
  LuCalendar, 
  LuUser, 
  LuLayers, 
  LuActivity, 
  LuFileText,
  LuFilterX
} from "react-icons/lu";
import "./AdminActivityLog.css";

function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://benedex-backend.onrender.com/api/notifications/admin-logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setLogs(response.data.logs);
        setFilteredLogs(response.data.logs);
      }
    } catch (err) {
      console.error("System operations audit pipeline sync crash:", err);
      setError("Failed to stream administrative action metrics from secure data pipelines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logic runs whenever startDate, endDate, or the master logs array changes
  useEffect(() => {
    let result = [...logs];

    if (startDate) {
      // Set start of day for comparison (00:00:00)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((log) => new Date(log.createdAt) >= start);
    }

    if (endDate) {
      // Set end of day for comparison (23:59:59)
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.createdAt) <= end);
    }

    setFilteredLogs(result);
  }, [startDate, endDate, logs]);

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const formatTimestamp = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cleanModuleName = (moduleString) => {
    if (!moduleString) return "SYSTEM";
    return moduleString.replace("_", " ");
  };

  return (
    <div className="logs-page-container">
      <div className="logs-page-header">
        <div className="header-left-side">
          <h2 className="logs-page-title">
            <LuShieldAlert className="title-icon-svg" /> Security Operations Audit Trail
          </h2>
          <p className="logs-page-subtitle">
            Unalterable chronological snapshot ledger of administrative ecosystem interactions.
          </p>
        </div>
        
        {/* Date Filter Controls & Refresh Block */}
        <div className="header-actions-group">
          <div className="date-filter-panel">
            <div className="date-input-wrapper">
              <label htmlFor="startDate">From:</label>
              <input 
                type="date" 
                id="startDate"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="date-picker-input"
              />
            </div>
            <div className="date-input-wrapper">
              <label htmlFor="endDate">To:</label>
              <input 
                type="date" 
                id="endDate"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="date-picker-input"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={clearFilters} 
                className="clear-filter-btn" 
                title="Clear Filters"
              >
                <LuFilterX />
              </button>
            )}
          </div>

          <motion.button 
            className="refresh-logs-btn" 
            onClick={fetchLogs} 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LuRefreshCw className={`refresh-icon ${loading ? "spinning" : ""}`} />
            {loading ? "Syncing Grid..." : "Refresh Log Stream"}
          </motion.button>
        </div>
      </div>

      <div className="logs-table-card">
        {loading ? (
          <div className="logs-loading-container">
            <LuRefreshCw className="loading-spinner spinning" />
            <p>Streaming secure administrative interaction log matrix...</p>
          </div>
        ) : error ? (
          <div className="logs-empty-container operational-error-state">
            <p>{error}</p>
            <motion.button 
              className="refresh-logs-btn error-retry-btn" 
              onClick={fetchLogs}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Retry Stream
            </motion.button>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="logs-empty-container">
            <p>
              {logs.length > 0 
                ? "No administrative actions found matching the selected date range."
                : "No logged system manipulations or views registered across environment nodes yet."
              }
            </p>
            {(startDate || endDate) && (
              <button onClick={clearFilters} className="refresh-logs-btn" style={{ margin: "15px auto 0" }}>
                Reset Date Filters
              </button>
            )}
          </div>
        ) : (
          <div className="logs-table-wrapper">
            <table className="audit-matrix-table">
              <thead>
                <tr>
                  <th><div className="th-cell"><LuCalendar /> Date & Time</div></th>
                  <th><div className="th-cell"><LuUser /> Administrator</div></th>
                  <th><div className="th-cell"><LuLayers /> Target Module</div></th>
                  <th><div className="th-cell"><LuActivity /> Action Type</div></th>
                  <th><div className="th-cell"><LuFileText /> Operation Details</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="log-timestamp">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="log-admin-identity">
                      {log.adminName}
                    </td>
                    <td>
                      <span className="badge-module">
                        {cleanModuleName(log.module)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-action ${log.actionType}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className={`log-details-text ${log.actionType === 'DELETE' ? 'delete-alert-text' : ''}`}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminActivityLog;