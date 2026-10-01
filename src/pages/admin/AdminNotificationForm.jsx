import { useState } from "react";
import axios from "axios";
import {
  FiBell,
  FiSend,
  FiImage,
  FiLink,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiLoader,
  FiUploadCloud,
} from "react-icons/fi";
import "./AdminNotificationForm.css";

function AdminNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/student/dashboard");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "",
    text: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
    }
  };

  const handleBroadcastSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setStatusMessage({ type: "", text: "" });

  const formData = new FormData();

  formData.append("title", title);
  formData.append("body", body);
  formData.append("url", url);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      "http://localhost:5000/api/notifications/admin-broadcast",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      setStatusMessage({
        type: "success",
        text: response.data.message,
      });

      setTitle("");
      setBody("");
      setUrl("/student/dashboard");
      setImageFile(null);

      const fileInput = document.getElementById(
        "notification-image"
      );

      if (fileInput) {
        fileInput.value = "";
      }
    }
  } catch (error) {
    console.error("Broadcast transmission error:", error);

    setStatusMessage({
      type: "error",
      text:
        error.response?.data?.message ||
        "Failed to dispatch system notification.",
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="anf-workspace">
      <div className="anf-container">
        {/* Page Header */}
        <div className="anf-page-header">
          <div className="anf-header-main">
            <div className="anf-header-icon">
              <FiBell size={26} />
            </div>

            <div className="anf-header-content">
              <span className="anf-eyebrow">Communication</span>

              <h1>Broadcast Notification</h1>

              <p>
                Send an announcement directly to students across the
                Benedex platform.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage.text && (
          <div
            className={`anf-alert ${
              statusMessage.type === "error"
                ? "anf-alert-error"
                : "anf-alert-success"
            }`}
          >
            <div className="anf-alert-icon">
              {statusMessage.type === "error" ? (
                <FiAlertCircle size={19} />
              ) : (
                <FiCheckCircle size={19} />
              )}
            </div>

            <span>{statusMessage.text}</span>

            <button
              type="button"
              className="anf-alert-close"
              onClick={() =>
                setStatusMessage({
                  type: "",
                  text: "",
                })
              }
              aria-label="Close notification"
            >
              <FiX size={17} />
            </button>
          </div>
        )}

        {/* Main Layout */}
        <div className="anf-content-layout">
          <main className="anf-main-content">
            <form onSubmit={handleBroadcastSubmit}>
              {/* Notification Details */}
              <section className="anf-card">
                <div className="anf-section-header">
                  <div>
                    <span className="anf-section-eyebrow">
                      Notification Details
                    </span>

                    <h2>Announcement Content</h2>

                    <p>
                      Provide the information students should receive in
                      their notification.
                    </p>
                  </div>

                  <div className="anf-section-icon">
                    <FiFileText size={20} />
                  </div>
                </div>

                <div className="anf-form-content">
                  {/* Title */}
                  <div className="anf-form-group">
                    <label htmlFor="notification-title">
                      Notification Title
                      <span className="anf-required">*</span>
                    </label>

                    <div className="anf-input-wrapper">
                      <FiBell className="anf-input-icon" size={17} />

                      <input
                        id="notification-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Important platform announcement"
                        required
                      />
                    </div>

                    <span className="anf-help-text">
                      Keep the title short and clear so students can
                      understand it immediately.
                    </span>
                  </div>

                  {/* Body */}
                  <div className="anf-form-group">
                    <label htmlFor="notification-body">
                      Message
                      <span className="anf-required">*</span>
                    </label>

                    <textarea
                      id="notification-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write your announcement message here..."
                      required
                      rows="7"
                    />

                    <span className="anf-help-text">
                      This is the main content students will see when they
                      open the notification.
                    </span>
                  </div>

                  {/* URL */}
                  <div className="anf-form-group">
                    <label htmlFor="notification-url">
                      Redirect Route
                    </label>

                    <div className="anf-input-wrapper">
                      <FiLink className="anf-input-icon" size={17} />

                      <input
                        id="notification-url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="/student/dashboard"
                      />
                    </div>

                    <span className="anf-help-text">
                      The page students will be taken to when they open
                      the notification.
                    </span>
                  </div>
                </div>
              </section>

              {/* Image Upload */}
              <section className="anf-card">
                <div className="anf-section-header">
                  <div>
                    <span className="anf-section-eyebrow">
                      Media
                    </span>

                    <h2>Notification Image</h2>

                    <p>
                      Optionally attach a banner or cover image to your
                      notification.
                    </p>
                  </div>

                  <div className="anf-section-icon">
                    <FiImage size={20} />
                  </div>
                </div>

                <div className="anf-form-content">
                  <div className="anf-form-group">
                    <label htmlFor="notification-image">
                      Banner Cover Image
                    </label>

                    <label
                      htmlFor="notification-image"
                      className={`anf-upload-area ${
                        imageFile ? "anf-upload-selected" : ""
                      }`}
                    >
                      <div className="anf-upload-icon">
                        {imageFile ? (
                          <FiImage size={24} />
                        ) : (
                          <FiUploadCloud size={24} />
                        )}
                      </div>

                      <div className="anf-upload-content">
                        {imageFile ? (
                          <>
                            <strong>{imageFile.name}</strong>

                            <span>
                              Image selected successfully. Click to
                              replace it.
                            </span>
                          </>
                        ) : (
                          <>
                            <strong>Upload notification image</strong>

                            <span>
                              Click to browse your device for an image
                              file.
                            </span>
                          </>
                        )}
                      </div>

                      <span className="anf-upload-button">
                        {imageFile ? "Change Image" : "Choose Image"}
                      </span>

                      <input
                        id="notification-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>

                    <span className="anf-help-text">
                      Supported image files can be uploaded and processed
                      through the notification media pipeline.
                    </span>
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="anf-submit-section">
                <div className="anf-submit-info">
                  <div className="anf-submit-icon">
                    <FiSend size={18} />
                  </div>

                  <div>
                    <strong>Ready to broadcast?</strong>

                    <span>
                      Your notification will be dispatched to the
                      platform.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="anf-submit-btn"
                >
                  {loading ? (
                    <>
                      <FiLoader className="anf-loading-icon" size={18} />
                      Sending Notification...
                    </>
                  ) : (
                    <>
                      <FiSend size={18} />
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>

          {/* Sidebar */}
          <aside className="anf-sidebar">
            <div className="anf-sidebar-card">
              <div className="anf-sidebar-heading">
                <div className="anf-sidebar-heading-icon">
                  <FiBell size={18} />
                </div>

                <div>
                  <span>Broadcast</span>
                  <h3>Notification Guide</h3>
                </div>
              </div>

              <div className="anf-guide-list">
                <div className="anf-guide-item">
                  <span className="anf-guide-number">01</span>

                  <div>
                    <strong>Write clearly</strong>

                    <p>
                      Use a short title and a message that gets straight
                      to the point.
                    </p>
                  </div>
                </div>

                <div className="anf-guide-item">
                  <span className="anf-guide-number">02</span>

                  <div>
                    <strong>Choose a destination</strong>

                    <p>
                      Add the route students should visit after opening
                      the notification.
                    </p>
                  </div>
                </div>

                <div className="anf-guide-item">
                  <span className="anf-guide-number">03</span>

                  <div>
                    <strong>Add media if needed</strong>

                    <p>
                      Attach an image when the announcement benefits from
                      visual context.
                    </p>
                  </div>
                </div>

                <div className="anf-guide-item">
                  <span className="anf-guide-number">04</span>

                  <div>
                    <strong>Review before sending</strong>

                    <p>
                      Make sure the title, message and destination are
                      correct before broadcasting.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="anf-sidebar-card anf-preview-card">
              <div className="anf-sidebar-heading">
                <div className="anf-sidebar-heading-icon">
                  <FiSend size={18} />
                </div>

                <div>
                  <span>Delivery</span>
                  <h3>Broadcast Status</h3>
                </div>
              </div>

              <div className="anf-status-row">
                <span className="anf-status-dot"></span>

                <div>
                  <strong>Ready to send</strong>

                  <p>
                    Complete the form and submit the broadcast when
                    everything is ready.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AdminNotificationForm;