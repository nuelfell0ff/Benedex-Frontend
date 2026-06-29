import { useState } from "react";
import axios from "axios";
import "./AdminNotificationForm.css"; // Importing our clean stylesheet structure

function AdminNotificationForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/student/dashboard");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
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
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        "https://benedex-backend.onrender.com/api/notifications/admin-broadcast",
        formData,
        config
      );

      if (response.data.success) {
        setStatusMessage({ type: "success", text: response.data.message });
        setTitle("");
        setBody("");
        setImageFile(null);
      }
    } catch (error) {
      console.error("Broadcast transmission error:", error);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to dispatch system broadcast layout.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="broadcast-container">
      <h2 className="broadcast-header">
        <span>📢</span> Control Panel Broadcast
      </h2>
      
      {statusMessage.text && (
        <div className={`broadcast-alert ${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleBroadcastSubmit}>
        <div className="form-group">
          <label>Notification Heading Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Immediate System Server Upgrade"
            required
          />
        </div>

        <div className="form-group">
          <label>Message Announcement Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your official announcement content here..."
            required
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Target Interface Route (Redirect Link)</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/student/dashboard"
          />
        </div>

        <div className="form-group">
          <label>Banner Cover Image (Cloudinary Storage Pipeline)</label>
          <div className="file-dropzone">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="broadcast-submit-btn"
        >
          {loading ? "Processing Assets & Dispatched..." : "Transmit Broadcast Signal"}
        </button>
      </form>
    </div>
  );
}

export default AdminNotificationForm;