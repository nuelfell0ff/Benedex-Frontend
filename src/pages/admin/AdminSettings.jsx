import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../../services/api";
import { 
  FiSettings, FiGlobe, FiMail, FiSliders, FiAlertTriangle, 
  FiSave, FiCheckCircle, FiLoader 
} from "react-icons/fi";
import "./AdminSettings.css";

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "",
    supportEmail: "",
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await API.get("/settings");
        // Ensure standard object mapping even if database returns null or incomplete collections
        setSettings({
          siteName: res.data?.siteName || "",
          supportEmail: res.data?.supportEmail || "",
          maintenanceMode: res.data?.maintenanceMode || false
        });
      } catch (error) {
        console.error("Platform master configurations fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      await API.put("/settings", settings);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000); // Reset success notification state
    } catch (error) {
      console.error("Configuration updates storage exception:", error);
      alert("Failed to write systemic parameter matrices: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // EXACT UNIFORM PLATFORM SYSTEM LOADER ACCROSS PANELS
  if (loading) {
    return (
      <div className="bx-st-loading-pane">
        <div className="bx-st-spinner"></div>
        <p className="mt-3 text-muted font-weight-bold">Accessing Master System Configuration Registry...</p>
      </div>
    );
  }

  return (
    <div className="bx-st-workspace container-fluid py-4">
      
      {/* HEADER MASTER STRIP */}
      <header className="bx-st-header mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bx-st-icon-box">
            <FiSettings size={24} />
            <span className="bx-st-pulse-light" />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h3 mb-0 font-weight-bold">System Parameters</h1>
              <span className="bx-st-ver-badge">Core Config v1.0</span>
            </div>
            <p className="text-muted mb-0 small">Modify application metadata variables, support nodes, and override operational execution flags.</p>
          </div>
        </div>
      </header>

      {/* SYSTEM CONFIRMATION TOAST */}
      {saveSuccess && (
        <motion.div 
          className="bx-st-toast alert alert-success d-flex align-items-center gap-2 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiCheckCircle size={18} />
          <span><strong>Registry Update Complete:</strong> Variables successfully deployed across environment nodes.</span>
        </motion.div>
      )}

      {/* MASTER FORM ARCHITECTURE */}
      <form onSubmit={handleSubmit} className="row g-4">
        
        {/* BRANDING AND METADATA CARD */}
        <div className="col-12 col-xl-7">
          <div className="bx-st-card">
            <div className="bx-st-card-header d-flex align-items-center gap-2 mb-4">
              <FiGlobe className="text-muted" />
              <h2 className="h5 mb-0 font-weight-bold">Application Environmental Identity</h2>
            </div>
            
            <div className="bx-st-field-group mb-3">
              <label className="bx-st-input-label">Ecosystem Base Call-Sign (Site Name)</label>
              <div className="bx-st-input-wrapper">
                <FiGlobe className="bx-st-field-icon" />
                <input 
                  type="text" 
                  name="siteName" 
                  placeholder="e.g., Adonis College Portal" 
                  value={settings.siteName} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bx-st-field-group">
              <label className="bx-st-input-label">System Default Support Communication Vector (Email)</label>
              <div className="bx-st-input-wrapper">
                <FiMail className="bx-st-field-icon" />
                <input 
                  type="email" 
                  name="supportEmail" 
                  placeholder="e.g., tech-ops@school.edu" 
                  value={settings.supportEmail} 
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY & MAINTENANCE COMMAND CONTROL CARD */}
        <div className="col-12 col-xl-5">
          <div className="bx-st-card d-flex flex-column justify-content-between h-100">
            <div>
              <div className="bx-st-card-header d-flex align-items-center gap-2 mb-3">
                <FiSliders className="text-muted" />
                <h2 className="h5 mb-0 font-weight-bold">Administrative System Overrides</h2>
              </div>
              <p className="text-muted small mb-4">
                Toggling systemic execution metrics alters operational availability configurations layout instantaneously.
              </p>

              {/* TOGGLE ELEMENT PIPELINE */}
              <div className="bx-st-toggle-row d-flex align-items-center justify-content-between p-3 rounded mb-3">
                <div className="pe-3">
                  <span className="d-block font-weight-bold text-dark small">Maintenance Execution Engine</span>
                  <span className="text-muted d-block extra-small mt-1">Locks non-administrative tokens out of the API query layer.</span>
                </div>
                <label className="bx-st-switch">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode" 
                    checked={settings.maintenanceMode} 
                    onChange={handleChange} 
                  />
                  <span className="bx-st-slider"></span>
                </label>
              </div>

              {/* WARNING SHIELD VECTOR */}
              {settings.maintenanceMode && (
                <motion.div 
                  className="bx-st-warning-box p-3 rounded d-flex gap-3 align-items-start"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <FiAlertTriangle className="text-warning flex-shrink-0 mt-1" size={18} />
                  <span className="small text-warning-muted">
                    <strong>Caution:</strong> Activating this node broadcasts 503 Service Unavailable parameters to frontend users. Instructors and Students will drop active connections.
                  </span>
                </motion.div>
              )}
            </div>

            {/* ACTION TRIGGERS AREA */}
            <div className="bx-st-action-zone mt-4 border-top pt-4 text-end">
              <button 
                type="submit" 
                className="bx-st-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FiLoader className="bx-st-spin-icon" />
                    <span>Synchronizing Variables...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Save Platform States</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default AdminSettings;