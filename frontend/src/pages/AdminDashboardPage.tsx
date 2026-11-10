import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookMarked,
  CheckCircle2,
  ExternalLink,
  FolderKanban,
  HelpCircle,
  Layers,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";
import { adminApi } from "../api/admin";
import { contributionsApi } from "../api/contributions";
import { coursesApi } from "../api/courses";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import {
  ContributionStatusBadge,
  MaterialTypeBadge,
} from "../components/Badge";
import { useToast } from "../components/ToastContext";
import type {
  Contribution,
  ContributionStatus,
  Course,
  ModerationStatus,
  PlatformStats,
  User,
} from "../types";

type AdminTab = "moderation" | "users";

export function AdminDashboardPage() {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>("moderation");
  const [stats, setStats] = useState<PlatformStats>({
    users: 0,
    courses: 0,
    core_materials: 0,
    contributions: { pending: 0, approved: 0, rejected: 0 },
    requests: { open: 0, fulfilled: 0 },
  });

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContributionStatus | "">("pending");
  const [courseFilter, setCourseFilter] = useState<number | undefined>(undefined);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, contribRes, coursesRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        contributionsApi.listAll({
          status: statusFilter,
          course_id: courseFilter,
          limit: 100,
        }),
        coursesApi.list({ limit: 100 }),
        adminApi.listUsers({ limit: 100 }),
      ]);
      setStats(statsRes);
      setContributions(contribRes.items);
      setCourses(coursesRes.items);
      setUsers(usersRes.items);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, courseFilter, showToast]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleModerate = async (item: Contribution, nextStatus: ModerationStatus) => {
    try {
      await contributionsApi.updateStatus(item.id, nextStatus);
      showToast(
        `Contribution "${item.title}" marked as ${nextStatus}`,
        nextStatus === "approved" ? "success" : "info"
      );
      await loadAdminData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  const handleDeleteContribution = async (item: Contribution) => {
    try {
      await contributionsApi.remove(item.id);
      showToast(`Deleted "${item.title}"`, "info");
      await loadAdminData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  const handleToggleUserActive = async (targetUser: User) => {
    const nextActive = !targetUser.is_active;
    try {
      await adminApi.setUserActive(targetUser.id, nextActive);
      showToast(
        `${targetUser.name} (${targetUser.email}) ${
          nextActive ? "reactivated" : "deactivated"
        }`,
        nextActive ? "success" : "info"
      );
      await loadAdminData();
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    }
  };

  return (
    <div>
      {/* Admin Hero Banner */}
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
              <ShieldCheck size={14} /> Admin Control Center • RBAC Enforced
            </span>
            <h1 className="hero-title">Platform Overview &amp; Administration</h1>
            <p className="hero-subtitle">
              Monitor platform-wide metrics, review pending student contributions,
              and manage registered user accounts.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <Link to="/admin/courses" className="btn btn-primary">
              <FolderKanban size={16} /> Manage Courses
            </Link>
            <Link to="/admin/materials" className="btn btn-secondary">
              <BookMarked size={16} /> Manage Core Materials
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Statistics Grid (GET /admin/stats - FR-38, AC-24, AC-30) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Registered Users</div>
            <div className="stat-value">{stats.users}</div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <Users size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Courses &amp; Core Materials</div>
            <div className="stat-value">
              {stats.courses} / {stats.core_materials}
            </div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <Layers size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Contributions (P / A / R)</div>
            <div className="stat-value" style={{ fontSize: "1.35rem" }}>
              <span style={{ color: "var(--warning)" }}>
                {stats.contributions.pending}P
              </span>{" "}
              /{" "}
              <span style={{ color: "var(--success)" }}>
                {stats.contributions.approved}A
              </span>{" "}
              /{" "}
              <span style={{ color: "var(--danger)" }}>
                {stats.contributions.rejected}R
              </span>
            </div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <UploadCloud size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Requests (Open / Fulfilled)</div>
            <div className="stat-value" style={{ fontSize: "1.35rem" }}>
              {stats.requests.open} Open / {stats.requests.fulfilled} Done
            </div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <HelpCircle size={20} />
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "moderation"}
          className={`tab-btn ${activeTab === "moderation" ? "active" : ""}`}
          onClick={() => setActiveTab("moderation")}
        >
          <ShieldCheck size={16} />
          Moderation Queue
          <span className="badge badge-warning">{stats.contributions.pending} pending</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "users"}
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={16} />
          User Management
          <span className="badge badge-neutral">{users.length}</span>
        </button>
      </div>

      {/* TAB 1: Moderation Queue */}
      {activeTab === "moderation" && (
        <div>
          <div className="toolbar">
            <div className="filter-pills">
              <button
                type="button"
                className={`filter-pill ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending ({stats.contributions.pending})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "approved" ? "active" : ""}`}
                onClick={() => setStatusFilter("approved")}
              >
                Approved ({stats.contributions.approved})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected ({stats.contributions.rejected})
              </button>
              <button
                type="button"
                className={`filter-pill ${statusFilter === "" ? "active" : ""}`}
                onClick={() => setStatusFilter("")}
              >
                All Contributions
              </button>
            </div>

            <div style={{ minWidth: "240px" }}>
              <select
                className="form-select"
                value={courseFilter ?? ""}
                onChange={(e) =>
                  setCourseFilter(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading moderation queue...</div>
          ) : contributions.length === 0 ? (
            <div className="empty-state">
              <p>No contributions match the selected status and course filter.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Title &amp; Contributor</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Resource Link</th>
                    <th style={{ textAlign: "right" }}>Moderation Actions</th>
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
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.15rem",
                          }}
                        >
                          By <strong>{item.author_name}</strong>
                          {item.description ? ` • ${item.description}` : ""}
                        </div>
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
                          Inspect <ExternalLink size={13} />
                        </a>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {item.status !== "approved" && (
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => void handleModerate(item, "approved")}
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                          )}
                          {item.status !== "rejected" && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => void handleModerate(item, "rejected")}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => void handleDeleteContribution(item)}
                            title="Delete contribution"
                          >
                            <Trash2 size={14} />
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

      {/* TAB 2: User Management (GET /admin/users & PATCH /admin/users/{id}/active - FR-39, AC-25, AC-30) */}
      {activeTab === "users" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name &amp; Email</th>
                <th>Role</th>
                <th>Account Status</th>
                <th>Joined</th>
                <th style={{ textAlign: "right" }}>Access Control</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = currentAdmin?.id === u.id;
                return (
                  <tr key={u.id}>
                    <td className="mono">#{u.id}</td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {u.email}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin" ? "badge-info" : "badge-neutral"
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.is_active ? (
                        <span className="badge badge-success">
                          <UserCheck size={13} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <UserX size={13} /> Deactivated
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {isSelf ? (
                        <span className="badge badge-neutral">Current Admin (You)</span>
                      ) : u.is_active ? (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => void handleToggleUserActive(u)}
                        >
                          <UserX size={14} /> Deactivate
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-success btn-sm"
                          onClick={() => void handleToggleUserActive(u)}
                        >
                          <UserCheck size={14} /> Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
