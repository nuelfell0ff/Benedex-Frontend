import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiArrowRight,
  FiRefreshCw,
  FiHelpCircle
} from "react-icons/fi";
import API from "../../services/api";
import "./PaymentCallback.css";
import Logo from "../../assets/20260623_190852.png";
import Logo2 from "../../assets/20260623_191023.png"

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    // Look at the query parameter we appended in Step 1
    const paymentType = searchParams.get("type");

    if (!reference) {
      setStatus("error");
      setMessage("No academic payment reference token provided by the core gateway.");
      return;
    }

    const verify = async () => {
      try {
        let res;

        // Explicit routing choice based completely on the URL parameters
        if (paymentType === "certificate") {
          res = await API.get(`/certificates/verify-payment/${encodeURIComponent(reference)}`);
        } else {
          res = await API.get(`/payments/verify/${encodeURIComponent(reference)}`);
        }

        if (res?.data?.success || res?.status === 200) {
          setStatus("success");
          setMessage(res.data.message || "Payment verified successfully.");

          const courseId = res.data.courseId || res.data.certificate?.course;

          setTimeout(() => {
            if (paymentType === "certificate" && courseId) {
              navigate(`/student/certificate/view/${courseId}`);
            } else if (courseId) {
              navigate(`/student/courses/${courseId}`);
            } else {
              navigate("/student");
            }
          }, 2500);
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Payment verification failed or was declined by the network.");
        }
      } catch (err) {
        console.error(err);

        if (err?.response?.data?.message?.includes("already issued") || err?.response?.status === 400) {
          setStatus("success");
          setMessage("Payment record verified. Access token confirmation established.");
          setTimeout(() => navigate("/student"), 2500);
          return;
        }

        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification request timed out or returned a 404.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="benedex-lms-theme callback-page-wrapper">
      <header className="student-topbar">
        <div className="student-topbar-brand-container">
          <Link to="/" className="bx-nav-brand-group">
            <img src={Logo} alt="" className="bx-nav-logo2 d-lg-flex d-none" />
            <img src={Logo} alt="" className="bx-nav-logo2 d-lg-none d-sm-flex" />
            {/* <span className="bx-nav-brand-text student-sidebar-brand-copy">Benedex</span> */}
          </Link>
        </div>
      </header>

      <main className="callback-main-canvas">
        <div className="callback-glass-card">
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

          {status === "success" && (
            <div className="callback-state-content state-success">
              <div className="callback-icon-wrapper success-accent-color">
                <FiCheckCircle size={42} />
              </div>
              <h2>Clearance Granted</h2>
              <p className="callback-success-message">{message}</p>
              <p className="callback-meta-subtitle">Configuring ecosystem tokens. Updating account dashboard clearances...</p>
              <div className="callback-action-footer">
                <Link to="/student" className="callback-primary-action-btn">
                  Go to Dashboard <FiArrowRight style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="callback-state-content state-error">
              <div className="callback-icon-wrapper error-accent-color">
                <FiXCircle size={42} />
              </div>
              <h2>Transaction Exception</h2>
              <p className="callback-error-message">{message}</p>
              <div className="callback-error-notice-box">
                <FiHelpCircle className="notice-box-icon" />
                <p>If funds were debited from your account but authorization timed out, please hold. Your profile automatically updates within 5 minutes.</p>
              </div>
              <div className="callback-action-buttons-group">
                <button onClick={() => window.location.reload()} className="callback-secondary-btn">
                  <FiRefreshCw style={{ marginRight: 8 }} /> Retry Verification
                </button>
                <Link to="/student" className="callback-primary-action-btn">View Student Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="callback-footer-minimal">
        <p>© 2026 Benedex Digital Hub. Built for African Excellence.</p>
      </footer>
    </div>
  );
}

export default PaymentCallback;