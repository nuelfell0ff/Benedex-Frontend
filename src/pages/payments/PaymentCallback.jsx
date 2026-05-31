import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API from "../../services/api";

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("No payment reference provided.");
      return;
    }

    const verify = async () => {
      try {
        const res = await API.get(`/payments/verify?reference=${encodeURIComponent(reference)}`);

        // backend should return a shape like { success: true, enrolled: true, courseId }
        if (res?.data?.success) {
          setStatus("success");
          setMessage(res.data.message || "Payment verified — enrollment complete.");

          // if backend indicates a course id, redirect to the course or student dashboard
          const courseId = res.data.courseId;
          setTimeout(() => {
            if (courseId) navigate(`/student/courses/${courseId}`);
            else navigate("/student");
          }, 1400);
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Payment verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification request failed.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Payment status</h2>
      {status === "verifying" && <p>Verifying payment — please wait...</p>}
      {status === "success" && (
        <div>
          <p style={{ color: "#0d5aa0" }}>{message}</p>
          <p>Redirecting you now — or <Link to="/student">go to dashboard</Link>.</p>
        </div>
      )}
      {status === "error" && (
        <div>
          <p style={{ color: "#b42318" }}>{message}</p>
          <p>
            If you were charged but enrollment didn't complete, contact support or check your
            payments in the admin panel.
          </p>
          <p>
            <button onClick={() => window.location.reload()}>Retry verification</button>
          </p>
        </div>
      )}
    </div>
  );
}

export default PaymentCallback;
