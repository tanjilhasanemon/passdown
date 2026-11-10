import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Sparkles } from "lucide-react";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastContext";

export function RegisterPage() {
  const { register, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await register({ name, email, password });
      await login(email, password);
      showToast("Account created! Welcome to PassDown.", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "480px", margin: "1.5rem auto" }}>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div>
          <span className="hero-eyebrow">
            <Sparkles size={13} /> Student Registration
          </span>
          <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.6rem", fontWeight: 800 }}>
            Create Your Account
          </h1>
          <p style={{ margin: "0 0 1.4rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Register a student account to contribute study links, request missing
            course materials, and track your submissions.
          </p>

          {errorMsg && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                background: "var(--danger-bg)",
                color: "var(--danger)",
                fontSize: "0.86rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name (2–100 chars) *</label>
              <input
                type="text"
                className="form-input"
                required
                minLength={2}
                maxLength={100}
                placeholder="e.g. Tanjil Hasan Emon"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                maxLength={254}
                placeholder="you@iub.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password (min 8 chars, at least 1 letter &amp; 1 digit) *
              </label>
              <input
                type="password"
                className="form-input"
                required
                minLength={8}
                maxLength={128}
                placeholder="At least 8 characters with letter & number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: "100%", marginTop: "0.5rem" }}
            >
              <UserPlus size={16} />
              {submitting ? "Creating account..." : "Register Account"}
            </button>
          </form>

          <p
            style={{
              margin: "1.25rem 0 0",
              textAlign: "center",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent-primary)", fontWeight: 700 }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
