import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Edit3,
  ExternalLink,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Trash2,
  UploadCloud,
  UserCog,
} from "lucide-react";
import { contributionsApi } from "../api/contributions";
import { extractErrorMessage } from "../api/client";
import { meApi } from "../api/me";
import { requestsApi } from "../api/requests";
import { useAuth } from "../auth/AuthContext";
import {
  ContributionStatusBadge,
  MaterialTypeBadge,
  RequestStatusBadge,
} from "../components/Badge";
import { Modal } from "../components/Modal";
import { useToast } from "../components/ToastContext";
import {
  MATERIAL_TYPES,
  type Contribution,
  type ContributionStatus,
  type ContributionUpdatePayload,
  type MaterialRequest,
  type MaterialType,
  type RequestStatus,
  type UserSummary,
} from "../types";

type DashTab = "contributions" | "requests" | "settings";

export function DashboardPage() {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<DashTab>("contributions");
  const [summary, setSummary] = useState<UserSummary>({
    contributions: { pending: 0, approved: 0, rejected: 0 },
    requests: { open: 0, fulfilled: 0 },
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [contribFilter, setContribFilter] = useState<ContributionStatus | "">("");

  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState<RequestStatus | "">("");

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Edit Pending Contribution Modal
  const [editingContrib, setEditingContrib] = useState<Contribution | null>(null);
  const [contribEditForm, setContribEditForm] = useState<ContributionUpdatePayload>({
    title: "",
    type: "notes",
    url: "",
    description: "",
  });

  // Profile & Password Forms (FR-37, US-21)
  const [displayName, setDisplayName] = useState<string>(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name);
    }
  }, [user?.name]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, contribRes, reqRes] = await Promise.all([
        meApi.getSummary(),
        meApi.listContributions({ status: contribFilter, limit: 100 }),
        meApi.listRequests({ status: requestFilter, limit: 100 }),
      ]);
      setSummary(summaryRes);
      setContributions(contribRes.items);
      setRequests(reqRes.items);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [contribFilter, requestFilter, showToast]);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const openEditContribution = (item: Contribution) => {
    setEditingContrib(item);
    setContribEditForm({
      title: item.title,
      type: item.type,
      url: item.url,
      description: item.description ?? "",
    });
  };

  const handleSaveContribution = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingContrib) return;
    setSubmitting(true);
    try {
      await contributionsApi.update(editingContrib.id, contribEditForm);
      showToast("Pending contribution updated", "success");
      setEditingContrib(null);
      await loadDashboardData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContribution = async (item: Contribution) => {
    try {
      await contributionsApi.remove(item.id);
      showToast(`Deleted "${item.title}"`, "info");
      await loadDashboardData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  const handleFulfillRequest = async (req: MaterialRequest) => {
    try {
      await requestsApi.fulfill(req.id);
      showToast(`Marked "${req.title}" as fulfilled`, "success");
      await loadDashboardData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  const handleDeleteRequest = async (req: MaterialRequest) => {
    try {
      await requestsApi.remove(req.id);
      showToast(`Deleted request "${req.title}"`, "info");
      await loadDashboardData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  const handleUpdateName = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await meApi.updateProfile({ name: displayName });
      await refreshProfile();
      showToast("Display name updated!", "success");
      await loadDashboardData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await meApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      showToast("Password changed! Use your new password next time you sign in.", "success");
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="hero-eyebrow">
              <LayoutDashboard size={14} /> Personal Workspace • {user?.role?.toUpperCase()}
            </span>
            <h1 className="hero-title">Welcome, {user?.name}</h1>
            <p className="hero-subtitle">
              Signed in as <strong>{user?.email}</strong>. Track the approval status
              of your contributed study links, manage your open material requests,
              or update your account credentials.
            </p>
          </div>
          <Link to="/" className="btn btn-primary">
            Explore Courses
          </Link>
        </div>
      </section>

      {/* Summary Statistics Cards (GET /me/summary - FR-36, AC-22, AC-29) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Contributions</div>
            <div className="stat-value" style={{ color: "var(--warning)" }}>
              {summary.contributions.pending}
            </div>
          </div>
          <span className="badge badge-warning">
            <Clock size={15} /> In Review
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Approved Contributions</div>
            <div className="stat-value" style={{ color: "var(--success)" }}>
              {summary.contributions.approved}
            </div>
          </div>
          <span className="badge badge-success">
            <CheckCircle2 size={15} /> Published
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Rejected Contributions</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>
              {summary.contributions.rejected}
            </div>
          </div>
          <span className="badge badge-danger">Needs Revision</span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">My Material Requests</div>
            <div className="stat-value">
              {summary.requests.open} Open / {summary.requests.fulfilled} Done
            </div>
          </div>
          <span className="badge badge-info">
            <HelpCircle size={15} /> Requests
          </span>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "contributions"}
          className={`tab-btn ${activeTab === "contributions" ? "active" : ""}`}
          onClick={() => setActiveTab("contributions")}
        >
          <UploadCloud size={16} /> My Contributions ({contributions.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "requests"}
          className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
        >
          <HelpCircle size={16} /> My Requests ({requests.length})
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <UserCog size={16} /> Profile &amp; Password
        </button>
      </div>

      {/* TAB 1: My Contributions */}
      {activeTab === "contributions" && (
        <div>
          <div className="toolbar">
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${contribFilter === "" ? "active" : ""}`}
                onClick={() => setContribFilter("")}
              >
                All ({summary.contributions.pending + summary.contributions.approved + summary.contributions.rejected})
              </button>
              <button
                type="button"
                className={`filter-pill ${contribFilter === "pending" ? "active" : ""}`}
                onClick={() => setContribFilter("pending")}
              >
                Pending ({summary.contributions.pending})
              </button>
              <button
                type="button"
                className={`filter-pill ${contribFilter === "approved" ? "active" : ""}`}
                onClick={() => setContribFilter("approved")}
              >
                Approved ({summary.contributions.approved})
              </button>
              <button
                type="button"
                className={`filter-pill ${contribFilter === "rejected" ? "active" : ""}`}
                onClick={() => setContribFilter("rejected")}
              >
                Rejected ({summary.contributions.rejected})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading your contributions...</div>
          ) : contributions.length === 0 ? (
            <div className="empty-state">
              <p>You have no contributions matching this filter yet.</p>
              <Link to="/" className="btn btn-primary btn-sm">
                Browse Courses to Contribute
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Title &amp; Description</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Resource Link</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link
                          to={`/courses/${item.course_id}`}
                          className="course-code-badge"
                        >
                          {item.course_code || `Course #${item.course_id}`}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{item.title}</div>
                        {item.description && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <MaterialTypeBadge type={item.type} />
                      </td>
                      <td>
                        <ContributionStatusBadge status={item.status} />
                      </td>
                      <td>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          Open <ExternalLink size={13} />
                        </a>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.4rem",
                          }}
                        >
                          {item.status === "pending" && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditContribution(item)}
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => void handleDeleteContribution(item)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Requests */}
      {activeTab === "requests" && (
        <div>
          <div className="toolbar">
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${requestFilter === "" ? "active" : ""}`}
                onClick={() => setRequestFilter("")}
              >
                All ({summary.requests.open + summary.requests.fulfilled})
              </button>
              <button
                type="button"
                className={`filter-pill ${requestFilter === "open" ? "active" : ""}`}
                onClick={() => setRequestFilter("open")}
              >
                Open ({summary.requests.open})
              </button>
              <button
                type="button"
                className={`filter-pill ${requestFilter === "fulfilled" ? "active" : ""}`}
                onClick={() => setRequestFilter("fulfilled")}
              >
                Fulfilled ({summary.requests.fulfilled})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <p>You have not posted any material requests matching this filter.</p>
              <Link to="/" className="btn btn-primary btn-sm">
                Browse Courses to Post a Request
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Request Title &amp; Details</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <Link
                          to={`/courses/${req.course_id}`}
                          className="course-code-badge"
                        >
                          {req.course_code || `Course #${req.course_id}`}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{req.title}</div>
                        {req.description && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {req.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <RequestStatusBadge status={req.status} />
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.45rem",
                          }}
                        >
                          {req.status === "open" && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => void handleFulfillRequest(req)}
                            >
                              <CheckCircle2 size={14} /> Mark Fulfilled
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => void handleDeleteRequest(req)}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Profile & Password Settings (FR-37, US-21) */}
      {activeTab === "settings" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="glass-card">
            <form onSubmit={handleUpdateName}>
              <h3 style={{ margin: "0 0 0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserCog size={18} /> Update Display Name
              </h3>
              <p style={{ margin: "0 0 1.2rem", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                Your display name is shown automatically on all your contributions and requests.
              </p>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email ?? ""}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Display Name (2–100 chars) *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  minLength={2}
                  maxLength={100}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Display Name"}
              </button>
            </form>
          </div>

          <div className="glass-card">
            <form onSubmit={handleUpdatePassword}>
              <h3 style={{ margin: "0 0 0.4rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <KeyRound size={18} /> Change Password
              </h3>
              <p style={{ margin: "0 0 1.2rem", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                Enter your current password to set a new password (min 8 chars, at least 1 letter and 1 digit).
              </p>

              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  minLength={8}
                  maxLength={128}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pending Contribution Modal */}
      <Modal
        isOpen={Boolean(editingContrib)}
        title="Edit Pending Contribution"
        onClose={() => setEditingContrib(null)}
      >
        <form onSubmit={handleSaveContribution}>
          <div className="form-group">
            <label className="form-label">Resource Title *</label>
            <input
              type="text"
              className="form-input"
              required
              minLength={3}
              maxLength={200}
              value={contribEditForm.title}
              onChange={(e) =>
                setContribEditForm({ ...contribEditForm, title: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Material Type *</label>
            <select
              className="form-select"
              value={contribEditForm.type}
              onChange={(e) =>
                setContribEditForm({
                  ...contribEditForm,
                  type: e.target.value as MaterialType,
                })
              }
            >
              {MATERIAL_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Resource URL *</label>
            <input
              type="url"
              className="form-input"
              required
              value={contribEditForm.url}
              onChange={(e) =>
                setContribEditForm({ ...contribEditForm, url: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              maxLength={1000}
              value={contribEditForm.description ?? ""}
              onChange={(e) =>
                setContribEditForm({
                  ...contribEditForm,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.65rem",
              marginTop: "1.25rem",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingContrib(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
