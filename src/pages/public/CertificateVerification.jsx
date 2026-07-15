import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiAlertTriangle, FiAward, FiCalendar, FiUser, FiExternalLink } from "react-icons/fi";
import API from "../../services/api"; // Adjust this path based on your API configuration
import "./CertificateVerification.css";

const CertificateVerification = () => {
  const { certificateId } = useParams();
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        // Calls the public, unprotected endpoint we created in certificateRoutes.js
        const res = await API.get(`/certificates/verify/${certificateId}`);
        if (res.data?.success) {
          setVerificationData(res.data.data);
        } else {
          setError("This certificate identifier is not recognized by the Benedex Registry.");
        }
      } catch (err) {
        console.error("Verification Engine Error:", err);
        setError(
          err.response?.data?.message || 
          "Unable to communicate with the Benedex Registry. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="verify-page-loader">
        <div className="verify-spinner"></div>
        <p>Verifying Credential ID against Benedex Registry...</p>
      </div>
    );
  }

  return (
    <div className="verify-container">
      {/* Brand Header */}
      <header className="verify-header">
        <Link to="/" className="verify-brand">
          <span className="brand-blue">benedex</span>
          <span className="brand-dark">digital</span>
        </Link>
      </header>

      <main className="verify-card-wrapper">
        {error ? (
          /* FAILURE/INVALID STATE */
          <div className="verify-status-card invalid-card">
            <div className="verify-icon-badge error-badge">
              <FiAlertTriangle size={36} />
            </div>
            <h1 className="verify-title">Verification Failed</h1>
            <p className="verify-error-msg">{error}</p>
            <div className="verify-divider"></div>
            <p className="verify-instruction">
              If you believe this is a mistake, please verify that the URL matches the printed identifier on the bottom-right corner of your certificate, or contact Benedex Support.
            </p>
            <Link to="/" className="verify-home-btn">Go to Benedex Portal</Link>
          </div>
        ) : (
          /* SUCCESS/VALID CREDENTIAL STATE */
          <div className="verify-status-card valid-card">
            <div className="verify-icon-badge success-badge">
              <FiCheckCircle size={36} />
            </div>
            
            <span className="verification-pill">Official Registry Verification</span>
            <h1 className="verify-title">Credential Authenticated</h1>
            <p className="verify-intro-text">
              Benedex Digital Hub officially confirms the qualification and participation details for the following record:
            </p>

            <div className="verify-details-grid">
              <div className="verify-detail-row">
                <div className="verify-detail-label">
                  <FiUser size={16} /> <span>Recipient Name</span>
                </div>
                <div className="verify-detail-value recipient-highlight">
                  {verificationData?.studentName}
                </div>
              </div>

              <div className="verify-detail-row">
                <div className="verify-detail-label">
                  <FiAward size={16} /> <span>Course Completed</span>
                </div>
                <div className="verify-detail-value course-highlight">
                  {verificationData?.courseTitle}
                </div>
              </div>

              <div className="verify-detail-row">
                <div className="verify-detail-label">
                  <FiCalendar size={16} /> <span>Date of Issue</span>
                </div>
                <div className="verify-detail-value">
                  {verificationData?.issueDate 
                    ? new Date(verificationData.issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })
                    : "N/A"
                  }
                </div>
              </div>

              <div className="verify-detail-row">
                <div className="verify-detail-label">
                  <FiExternalLink size={16} /> <span>Credential ID</span>
                </div>
                <div className="verify-detail-value cert-id-code">
                  {verificationData?.certificateId}
                </div>
              </div>
            </div>

            <div className="verify-divider"></div>

            <div className="verify-footer-notes">
              <p>
                This verification was processed in real-time directly through Benedex Digital Hub secure servers. 
                Authenticated credentials demonstrate complete course requirement coverage, project assessment completions, and verified user profiles.
              </p>
            </div>
          </div>
        )}
      </main>
      
      <footer className="verify-footer">
        <p>&copy; {new Date().getFullYear()} Benedex Digital Hub. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default CertificateVerification;