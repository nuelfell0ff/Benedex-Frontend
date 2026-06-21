import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiDownload, FiImage } from "react-icons/fi";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./CertificateView.css";

const CertificateView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await API.get(`/certificates/course/${courseId}`);
        if (res.data?.isPaid || res.data?.hasCertificate) {
          setCert(res.data);
        } else {
          alert("Access Denied: Certificate payment not verified yet.");
          navigate(`/student/courses/${courseId}`);
        }
      } catch (err) {
        console.error("Frontend Certificate Load Exception:", err);
        alert("Failed to load official credential records.");
        navigate(`/student/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [courseId, navigate]);

  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, 
        useCORS: true, 
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); 
      const pdfHeight = pdf.internal.pageSize.getHeight(); 
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      const safeName = (cert?.courseTitle || "Course").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`benedex_certificate_${safeName}.pdf`);
    } catch (error) {
      console.error("PDF generation engine exception:", error);
      alert("Something went wrong compiling your PDF document.");
    } finally {
      setDownloading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = (cert?.courseTitle || "Course").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `benedex_certificate_${safeName}.png`;
      link.href = imgUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Image capture engine exception:", error);
      alert("Something went wrong formatting your certificate image.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="cert-loading-screen">
        <FiLoader size={44} className="cert-spinner" />
        <p>RETRIEVING SECURE CREDENTIALS...</p>
      </div>
    );
  }

  const issueDate = cert?.issuedAt 
    ? new Date(cert.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' }) 
    : new Date().toLocaleDateString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="cert-page-wrapper">
      
      {/* TOOLBAR CONTROLS */}
      <div className="cert-action-bar">
        <button 
          onClick={() => navigate(`/student/courses/${courseId}`)} 
          className="cert-back-btn"
          disabled={downloading}
        >
          <FiArrowLeft /> Back to Course Dashboard
        </button>

        <div className="cert-download-actions-group">
          <button onClick={downloadAsImage} className="cert-secondary-action-btn" disabled={downloading}>
            {downloading ? <FiLoader className="cert-spinner" /> : <FiImage size={16} />} 
            Save as PNG Image
          </button>
          
          <button onClick={downloadAsPDF} className="cert-print-btn" disabled={downloading}>
            {downloading ? <FiLoader className="cert-spinner" /> : <FiDownload size={16} />} 
            {downloading ? "Compiling..." : "Download Official PDF"}
          </button>
        </div>
      </div>

      {/* FIXED LANDSCAPE SCALING WRAPPER FOR RESPONSIVENESS */}
      <div className="cert-scale-container">
        
        {/* SECURE CERTIFICATE CANVAS (1000px X 700px Native Proportion) */}
        <div className="certificate-print-canvas" ref={certificateRef}>
          
          {/* Subtle Guilloche/Rosette watermark circle layer */}
          <div className="cert-watermark-rosette"></div>

          {/* Thin Classic Double Border Frame */}
          <div className="cert-inner-border"></div>

          {/* LEFT CONTENT CONTAINER COLUMN */}
          <div className="cert-left-column">
            
            {/* BRAND LOGO */}
            <div className="cert-brand-logo-area">
              <span className="brand-logo-blue">benedex</span>
              <span className="brand-logo-dark">digital</span>
            </div>

            {/* ISSUE TIMESTAMPS */}
            <div className="cert-date-stamp">
              {issueDate}
            </div>

            {/* STUDENT NAME BLOCK */}
            <div className="cert-recipient-block">
              <h1 className="cert-student-name">
                {user?.fullName || "Valued Student Member"}
              </h1>
            </div>

            {/* ATTESTATION DETAILS LOCK */}
            <div className="cert-attestation-details">
              <p className="conferred-lead-text">has successfully completed</p>
              <h2 className="cert-course-title">{cert?.courseTitle || "Advanced Technical Mastery Track"}</h2>
              <p className="cert-course-description">
                an online non-credit course authorized by Benedex Digital Hub and offered through its learning portal.
              </p>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="cert-signature-section">
              <div className="signature-wrapper">
                {/* Decorative Signature Script Line */}
                <div className="signature-graphic-mock">John Doe</div>
                <div className="signature-line"></div>
                <p className="signatory-name">John Doe</p>
                <p className="signatory-title">Director, Benedex Digital Hub</p>
              </div>
            </div>
          </div>

          {/* RIGHT BADGE / RIBBON FEATURE COLUMN */}
          <div className="cert-right-column">
            <div className="cert-vertical-ribbon">
              <div className="ribbon-text-group">
                <span className="ribbon-title">COURSE</span>
                <span className="ribbon-subtitle">CERTIFICATE</span>
              </div>
              
              {/* Embossed Round Stamp Seal Design */}
              <div className="ribbon-seal-circle">
                <div className="seal-inner-dotted">
                  <div className="seal-center-core">
                    <span className="seal-core-brand">benedex</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOWER VALIDATION AND CREDENTIAL IDENTIFIERS */}
            <div className="cert-validation-footer">
              <p>{cert?.certificateId || "BX-PENDING-TOKEN"}</p>
              <p>Benedex has confirmed the identity of this individual and their participation in the course.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CertificateView;