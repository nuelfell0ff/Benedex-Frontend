import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiLoader, 
  FiArrowRight, 
  FiRefreshCw, 
  FiHelpCircle 
} from "react-icons/fi";
import API from "../../services/api";
import "./PaymentCallback.css"; // Styling layout provided below

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("No academic payment reference token provided by the core gateway.");
      return;
    }

    const verify = async () => {
      try {
        // backend exposes GET /api/payments/verify/:reference
        const res = await API.get(`/payments/verify/${encodeURIComponent(reference)}`);

        if (res?.data?.success) {
          setStatus("success");
          setMessage(res.data.message || "Payment verified successfully — enrollment clearance active.");

          const courseId = res.data.courseId;
          setTimeout(() => {
            if (courseId) navigate(`/student/courses/${courseId}`);
            else navigate("/student");
          }, 2500); // Slightly prolonged to let the student appreciate the luxury success state
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Payment verification failed or was declined by the network.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification request timed out. Connection drop detected.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="benedex-lms-theme callback-page-wrapper">
      {/* BRANDING TOPBAR FOR PREMIUM CONSISTENCY */}
      <header className="student-topbar">
        <div className="student-topbar-brand-container">
          <div className="student-sidebar-brand">
            <span className="student-sidebar-mark" aria-hidden="true">
              <FiActivity />
            </span>
            <div className="student-sidebar-brand-copy">
              <strong>Benedex Digital</strong>
              <span>Premium Learning Hub</span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE CARTRIDGE AREA */}
      <main className="callback-main-canvas">
        <div className="callback-glass-card">
          
          {/* VERIFYING STATE */}
          {status === "verifying" && (
            <div className="callback-state-content state-verifying">
              <div className="callback-icon-wrapper spinner-animated">
                <FiLoader size={40} />
              </div>
              <h2>Verifying Secure Order</h2>
              <p className="callback-meta-subtitle">Communicating with interbank gateway ledger. Please do not close or reload this browser tab...</p>
              <div className="premium-progress-bar">
                <div className="premium-progress-shimmer"></div>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="callback-state-content state-success">
              <div className="callback-icon-wrapper success-accent-color">
                <FiCheckCircle size={42} />
              </div>
              <h2>Clearance Granted</h2>
              <p className="callback-success-message">{message}</p>
              <p className="callback-meta-subtitle">
                Configuring classroom tokens. Redirecting you to your course track dashboard...
              </p>
              <div className="callback-action-footer">
                <Link to="/student" className="callback-primary-action-btn">
                  Go to Dashboard <FiArrowRight style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="callback-state-content state-error">
              <div className="callback-icon-wrapper error-accent-color">
                <FiXCircle size={42} />
              </div>
              <h2>Transaction Exception</h2>
              <p className="callback-error-message">{message}</p>
              
              <div className="callback-error-notice-box">
                <FiHelpCircle className="notice-box-icon" />
                <p>
                  If funds were debited from your account but authorization timed out, please hold. Your track profile updates inside the student dashboard within 5 minutes automatically.
                </p>
              </div>

              <div className="callback-action-buttons-group">
                <button onClick={() => window.location.reload()} className="callback-secondary-btn">
                  <FiRefreshCw style={{ marginRight: 8 }} /> Retry Verification
                </button>
                <Link to="/student" className="callback-primary-action-btn">
                  View Student Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MINIMAL FOOTER FOR BALANCED LAYOUT CONTENT */}
      <footer className="callback-footer-minimal">
        <p>© 2026 Benedex Digital Hub. Built for African Excellence.</p>
      </footer>
    </div>
  );
}

export default PaymentCallback;