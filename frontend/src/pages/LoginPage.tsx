import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, LogIn, ShieldCheck, UserCheck } from "lucide-react";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/ToastContext";

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from;

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const profile = await login(targetEmail, targetPass);
      showToast(`Welcome back, ${profile.name}!`, "success");
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (profile.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div style={{ maxWidth: "480px", margin: "1.5rem auto" }}>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div>
          <span className="hero-eyebrow">
            <KeyRound size={13} /> OAuth2 + JWT Authentication
          </span>
          <h1 style={{ margin: "0 0 0.35rem", fontSize: "1.6rem", fontWeight: 800 }}>
            Sign in to PassDown
          </h1>
          <p style={{ margin: "0 0 1.4rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Log in with your email and password to contribute materials, post
            requests, or manage your dashboard.
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
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                placeholder="you@iub.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
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
              <LogIn size={16} />
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Quick Demo Credentials for Viva Evaluation */}
          <div
            style={{
              marginTop: "1.4rem",
              paddingTop: "1.1rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: "0.76rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-muted)",
                marginBottom: "0.65rem",
              }}
            >
              Quick Demo Accounts (1-Click Sign In)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={submitting}
                onClick={() => {
                  setEmail("admin@passdown.edu");
                  setPassword("Admin1234");
                  void performLogin("admin@passdown.edu", "Admin1234");
                }}
              >
                <ShieldCheck size={14} /> Demo Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={submitting}
                onClick={() => {
                  setEmail("student@passdown.edu");
                  setPassword("Student1234");
                  void performLogin("student@passdown.edu", "Student1234");
                }}
              >
                <UserCheck size={14} /> Demo Student
              </button>
            </div>
          </div>

          <p
            style={{
              margin: "1.25rem 0 0",
              textAlign: "center",
              fontSize: "0.88rem",
              color: "var(--text-secondary)",
            }}
          >
            Don&apos;t have an account yet?{" "}
            <Link
              to="/register"
              style={{ color: "var(--accent-primary)", fontWeight: 700 }}
            >
              Create a student account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
