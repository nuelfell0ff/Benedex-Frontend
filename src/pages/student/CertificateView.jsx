import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLoader, FiAward, FiShield, FiDownload, FiImage } from "react-icons/fi";
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
  
  // Attach a reference node handle straight to the targeted certificate container canvas
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

  // Method 1: Export purely as a perfectly sized landscape A4 PDF Document
  const downloadAsPDF = async () => {
    if (!certificateRef.current) return;
    try {
      setDownloading(true);
      
      // Render HTML canvas element with clear high-definition scaling parameters
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Multiplies resolution scale pixel density so the text stays crisp on high-res displays
        useCORS: true, // Prevents image security tracking blocks if external images are used
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // Create landscape A4 size pdf document instance
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth(); // ~297mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // ~210mm
      
      // Paint the snapshot perfectly edge-to-edge on the document
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      // Format file name safely
      const safeName = (cert?.courseTitle || "Course").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`benedex_certificate_${safeName}.pdf`);
    } catch (error) {
      console.error("PDF generation engine exception:", error);
      alert("Something went wrong compiling the PDF document track.");
    } finally {
      setDownloading(false);
    }
  };

  // Method 2: Export purely as a high-quality PNG image file 
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
      
      // Trigger instant programmatically native file downloader interface download anchor link injection
      const link = document.createElement("a");
      const safeName = (cert?.courseTitle || "Course").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `benedex_certificate_${safeName}.png`;
      link.href = imgUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Image capture engine exception:", error);
      alert("Something went wrong formatting your certificate graphic image.");
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

  return (
    <div className="cert-page-wrapper">
      
      {/* ACTION BAR: Completely updated with elegant isolated action workflows */}
      <div className="cert-action-bar">
        <button 
          onClick={() => navigate(`/student/courses/${courseId}`)} 
          className="cert-back-btn"
          disabled={downloading}
        >
          <FiArrowLeft /> Back to Course Dashboard
        </button>

        <div className="cert-download-actions-group">
          <button 
            onClick={downloadAsImage} 
            className="cert-secondary-action-btn"
            disabled={downloading}
          >
            {downloading ? <FiLoader className="cert-spinner" /> : <FiImage size={16} />} 
            Save as PNG Image
          </button>
          
          <button 
            onClick={downloadAsPDF} 
            className="cert-print-btn"
            disabled={downloading}
          >
            {downloading ? <FiLoader className="cert-spinner" /> : <FiDownload size={16} />} 
            {downloading ? "Compiling Document..." : "Download Official PDF"}
          </button>
        </div>
      </div>

      {/* SECURE CERTIFICATE CANVAS CONTAINER */}
      <div className="certificate-print-canvas" ref={certificateRef}>
        
        {/* Decorative Geometric Design Corner Brackets */}
        <div className="cert-corner-bracket top-left"></div>
        <div className="cert-corner-bracket top-right"></div>
        <div className="cert-corner-bracket bottom-left"></div>
        <div className="cert-corner-bracket bottom-right"></div>

        {/* BRANDING CREST HEADER BLOCK */}
        <div className="cert-header-section">
          <div className="cert-logo-group">
            <FiAward size={36} className="cert-brand-icon" />
            <h2>Benedex Digital</h2>
          </div>
          <p className="cert-brand-subtitle">Hub for Digital Excellence</p>
          <div className="cert-header-divider"></div>
        </div>

        {/* CORE ATTESTATION CONTENT LOCK */}
        <div className="cert-body-section">
          <h4>Certificate of Completion</h4>
          <p className="cert-conferred-text">This official dynamic credential token is proudly conferred upon</p>
          <h1 className="cert-student-name">
            {user?.fullName || "Valued Student Member"}
          </h1>
          <p className="cert-fulfillment-text">
            for successfully completing and fulfilling all assessment criteria, testing metrics, module exercises, and specialized development track profiles mapped for
          </p>
          <h3 className="cert-course-title">
            {cert?.courseTitle}
          </h3>
        </div>

        {/* VERIFICATION AND METRIC DATA FOOTER LAYOUT */}
        <div className="cert-footer-section">
          
          {/* ISSUE DATE METRIC */}
          <div className="cert-footer-block text-left">
            <p className="cert-footer-label">Issued On:</p>
            <strong className="cert-footer-value">
              {cert?.issuedAt 
                ? new Date(cert.issuedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) 
                : new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </strong>
          </div>
          
          {/* METRIC SECURITY EMBLEM STAMP */}
          <div className="cert-seal-wrapper">
            <div className="cert-seal-inner">
              <FiShield size={24} />
              <span>VERIFIED</span>
            </div>
          </div>

          {/* VERIFICATION SECURE HASH */}
          <div className="cert-footer-block text-right">
            <p className="cert-footer-label">Credential ID:</p>
            <strong className="cert-footer-value hash-code">
              {cert?.certificateId || "BX-PENDING-TOKEN"}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateView;