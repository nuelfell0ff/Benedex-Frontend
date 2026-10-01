import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LuShieldAlert,
  LuRefreshCw,
  LuCalendar,
  LuUser,
  LuLayers,
  LuActivity,
  LuFileText,
  LuFilterX,
  LuDatabase,
  LuClock3,
  LuCircleAlert,
  LuListFilter,
  LuChevronDown,
} from "react-icons/lu";
import API from "../../services/api";
import "./AdminActivityLog.css";

function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LOGS_PER_PAGE = 20;

  // Filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /*
   * =========================================================
   * FETCH LOGS
   * =========================================================
   *
   * We only request 20 logs at a time.
   *
   * Page 1:
   * /admin-logs?page=1&limit=20
   *
   * Page 2:
   * /admin-logs?page=2&limit=20
   *
   * etc.
   */
  const fetchLogs = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await API.get(
        `/notifications/admin-logs?page=${page}&limit=${LOGS_PER_PAGE}`
      );

      if (response.data.success) {
        const newLogs = response.data.logs || [];

        if (append) {
          setLogs((prevLogs) => [...prevLogs, ...newLogs]);
        } else {
          setLogs(newLogs);
        }

        /*
         * If the backend provides hasMore, use it.
         *
         * Otherwise, if fewer than 20 records were returned,
         * we know there is nothing else to load.
         */
        if (typeof response.data.hasMore === "boolean") {
          setHasMore(response.data.hasMore);
        } else {
          setHasMore(newLogs.length === LOGS_PER_PAGE);
        }

        setCurrentPage(page);
      }
    } catch (err) {
      console.error(
        "System operations audit pipeline sync crash:",
        err
      );

      setError(
        "Failed to load administrative activity logs. Please try again."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  /*
   * Initial load
   */
  useEffect(() => {
    fetchLogs(1, false);
  }, []);

  /*
   * =========================================================
   * FILTER LOGS
   * =========================================================
   */
  useEffect(() => {
    let result = [...logs];

    if (startDate) {
      const start = new Date(startDate);

      start.setHours(0, 0, 0, 0);

      result = result.filter(
        (log) => new Date(log.createdAt) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);

      result = result.filter(
        (log) => new Date(log.createdAt) <= end
      );
    }

    setFilteredLogs(result);
  }, [startDate, endDate, logs]);

  /*
   * =========================================================
   * LOAD MORE
   * =========================================================
   */
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;

    fetchLogs(currentPage + 1, true);
  };

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */
  const handleRefresh = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchLogs(1, false);
  };

  /*
   * =========================================================
   * CLEAR FILTERS
   * =========================================================
   */
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  /*
   * =========================================================
   * FORMAT TIMESTAMP
   * =========================================================
   */
  const formatTimestamp = (dateString) => {
    if (!dateString) return "Unknown";

    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * =========================================================
   * CLEAN MODULE NAME
   * =========================================================
   */
  const cleanModuleName = (moduleString) => {
    if (!moduleString) return "SYSTEM";

    return moduleString.replace(/_/g, " ");
  };

  /*
   * =========================================================
   * ACTION CLASS
   * =========================================================
   */
  const getActionClass = (actionType) => {
    if (!actionType) return "default";

    return actionType.toUpperCase();
  };

  /*
   * =========================================================
   * SUMMARY COUNTS
   * =========================================================
   *
   * These counts represent the logs currently loaded into the
   * browser, not necessarily every record in the database.
   */
  const totalLogs = logs.length;

  const createCount = logs.filter(
    (log) => log.actionType?.toUpperCase() === "CREATE"
  ).length;

  const updateCount = logs.filter(
    (log) => log.actionType?.toUpperCase() === "UPDATE"
  ).length;

  const deleteCount = logs.filter(
    (log) => log.actionType?.toUpperCase() === "DELETE"
  ).length;

  return (
    <div className="aal-workspace">
      <div className="aal-container">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="aal-page-header">
          <div className="aal-header-main">
            <div className="aal-header-icon">
              <LuShieldAlert size={25} />
            </div>

            <div className="aal-header-content">
              <span className="aal-eyebrow">
                System Security
              </span>

              <h1>Administrative Activity Log</h1>

              <p>
                Monitor and review administrative actions performed
                across the Benedex ecosystem.
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            className="aal-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LuRefreshCw
              size={17}
              className={loading ? "aal-spinning" : ""}
            />

            {loading ? "Refreshing..." : "Refresh Logs"}
          </motion.button>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="aal-summary-grid">
          <div className="aal-summary-card">
            <div className="aal-summary-icon aal-summary-blue">
              <LuDatabase size={19} />
            </div>

            <div>
              <span>Loaded Activities</span>
              <strong>{totalLogs}</strong>
            </div>
          </div>

          <div className="aal-summary-card">
            <div className="aal-summary-icon aal-summary-green">
              <LuActivity size={19} />
            </div>

            <div>
              <span>Created</span>
              <strong>{createCount}</strong>
            </div>
          </div>

          <div className="aal-summary-card">
            <div className="aal-summary-icon aal-summary-orange">
              <LuRefreshCw size={19} />
            </div>

            <div>
              <span>Updated</span>
              <strong>{updateCount}</strong>
            </div>
          </div>

          <div className="aal-summary-card">
            <div className="aal-summary-icon aal-summary-red">
              <LuShieldAlert size={19} />
            </div>

            <div>
              <span>Deleted</span>
              <strong>{deleteCount}</strong>
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER CARD
        ===================================================== */}

        <section className="aal-filter-card">
          <div className="aal-filter-heading">
            <div className="aal-filter-icon">
              <LuListFilter size={17} />
            </div>

            <div>
              <h2>Filter Activity</h2>

              <p>
                Narrow the loaded audit trail by date range.
              </p>
            </div>
          </div>

          <div className="aal-filter-controls">
            <div className="aal-date-field">
              <label htmlFor="aal-start-date">
                <LuCalendar size={14} />
                From
              </label>

              <input
                type="date"
                id="aal-start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="aal-date-field">
              <label htmlFor="aal-end-date">
                <LuCalendar size={14} />
                To
              </label>

              <input
                type="date"
                id="aal-end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                className="aal-clear-btn"
                onClick={clearFilters}
              >
                <LuFilterX size={15} />
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* =====================================================
            MAIN LOG CARD
        ===================================================== */}

        <section className="aal-card">
          <div className="aal-card-header">
            <div>
              <span className="aal-section-eyebrow">
                Audit Trail
              </span>

              <h2>Administrative Activity</h2>

              <p>
                Chronological record of actions performed by
                administrators.
              </p>
            </div>

            <div className="aal-record-count">
              <LuClock3 size={15} />

              Showing {filteredLogs.length}{" "}
              {filteredLogs.length === 1 ? "record" : "records"}
            </div>
          </div>

          {/* ===================================================
              LOADING
          =================================================== */}

          {loading ? (
            <div className="aal-state">
              <div className="aal-loading-icon">
                <LuRefreshCw size={22} />
              </div>

              <h3>Loading activity logs</h3>

              <p>
                Fetching the latest 20 administrative activity
                records...
              </p>
            </div>
          ) : error ? (
            /* =================================================
               ERROR
            ================================================= */

            <div className="aal-state aal-error-state">
              <div className="aal-state-icon aal-error-icon">
                <LuCircleAlert size={24} />
              </div>

              <h3>Unable to load activity logs</h3>

              <p>{error}</p>

              <button
                type="button"
                className="aal-retry-btn"
                onClick={handleRefresh}
              >
                <LuRefreshCw size={15} />
                Retry
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================= */

            <div className="aal-state">
              <div className="aal-state-icon aal-empty-icon">
                <LuFileText size={24} />
              </div>

              <h3>
                {logs.length > 0
                  ? "No matching activities"
                  : "No activity logs yet"}
              </h3>

              <p>
                {logs.length > 0
                  ? "No administrative actions were found within the selected date range."
                  : "Administrative actions will appear here once they are recorded."}
              </p>

              {(startDate || endDate) && (
                <button
                  type="button"
                  className="aal-reset-btn"
                  onClick={clearFilters}
                >
                  <LuFilterX size={15} />
                  Reset Date Filters
                </button>
              )}
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <>
              <div className="aal-table-wrapper">
                <table className="aal-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="aal-th-content">
                          <LuCalendar size={14} />
                          Date &amp; Time
                        </div>
                      </th>

                      <th>
                        <div className="aal-th-content">
                          <LuUser size={14} />
                          Administrator
                        </div>
                      </th>

                      <th>
                        <div className="aal-th-content">
                          <LuLayers size={14} />
                          Target Module
                        </div>
                      </th>

                      <th>
                        <div className="aal-th-content">
                          <LuActivity size={14} />
                          Action
                        </div>
                      </th>

                      <th>
                        <div className="aal-th-content">
                          <LuFileText size={14} />
                          Operation Details
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.map((log) => {
                      const actionClass = getActionClass(
                        log.actionType
                      );

                      return (
                        <tr key={log._id}>
                          <td>
                            <div className="aal-timestamp">
                              <LuClock3 size={14} />

                              <span>
                                {formatTimestamp(log.createdAt)}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="aal-admin">
                              <div className="aal-admin-avatar">
                                <LuUser size={15} />
                              </div>

                              <span>
                                {log.adminName ||
                                  "Unknown administrator"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className="aal-module-badge">
                              {cleanModuleName(log.module)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`aal-action-badge aal-action-${actionClass}`}
                            >
                              {log.actionType || "UNKNOWN"}
                            </span>
                          </td>

                          <td>
                            <div
                              className={`aal-details ${
                                actionClass === "DELETE"
                                  ? "aal-delete-details"
                                  : ""
                              }`}
                            >
                              {log.details ||
                                "No operation details available."}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  LOAD MORE
              ================================================= */}

              <div className="aal-load-more-container">
                {hasMore ? (
                  <button
                    type="button"
                    className="aal-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <LuRefreshCw
                          size={16}
                          className="aal-spinning"
                        />
                        Loading 20 More...
                      </>
                    ) : (
                      <>
                        <LuChevronDown size={17} />
                        Load 20 More
                      </>
                    )}
                  </button>
                ) : (
                  <div className="aal-end-message">
                    <LuShieldAlert size={14} />
                    You've reached the end of the activity log.
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminActivityLog;