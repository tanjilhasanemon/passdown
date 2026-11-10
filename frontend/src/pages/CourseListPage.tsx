import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Building2,
  Calendar,
  FolderPlus,
  Layers,
  LogIn,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { coursesApi } from "../api/courses";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Modal } from "../components/Modal";
import { useToast } from "../components/ToastContext";
import type { Course, CoursePayload } from "../types";

export function CourseListPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CoursePayload>({
    code: "",
    title: "",
    department: "CSE",
    semester_offered: "Autumn 2026",
  });

  // Press "/" anywhere (outside inputs) to focus the search bar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (
        event.key === "/" &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
        tag !== "SELECT"
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchCourses = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.list({ q: query, limit: 100 });
      setCourses(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCourses(searchQuery);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [searchQuery, fetchCourses]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => {
      if (c.department) set.add(c.department);
    });
    return ["ALL", ...Array.from(set).sort()];
  }, [courses]);

  const visibleCourses = useMemo(() => {
    if (selectedDept === "ALL") return courses;
    return courses.filter((c) => c.department === selectedDept);
  }, [courses, selectedDept]);

  const handleCreateCourse = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const created = await coursesApi.create(formData);
      showToast(`Course ${created.code} created`, "success");
      setIsCreateOpen(false);
      setFormData({
        code: "",
        title: "",
        department: "CSE",
        semester_offered: "Autumn 2026",
      });
      await fetchCourses(searchQuery);
    } catch (err) {
      showToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="hero-banner">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span className="hero-eyebrow">
              <Sparkles size={13} /> IUB Course Resource Directory
            </span>
            <h1 className="hero-title">
              Prepare Ahead.{" "}
              <span className="hero-gradient-text">
                Never Chase Seniors Again.
              </span>
            </h1>
            <p className="hero-subtitle">
              One structured hub per course with admin-verified core materials,
              peer-reviewed student contributions, and community resource requests.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <FolderPlus size={16} /> New Course
                </button>
                <Link to="/admin/courses" className="btn btn-secondary">
                  Manage Catalog
                </Link>
              </>
            ) : !isAuthenticated ? (
              <Link to="/login" className="btn btn-primary">
                <LogIn size={15} /> Sign In to Contribute
              </Link>
            ) : (
              <Link to="/dashboard" className="btn btn-secondary">
                My Contributions &amp; Requests
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Catalog Courses</div>
            <div className="stat-value">{total}</div>
          </div>
          <span className="badge badge-info">
            <Layers size={14} /> Catalog
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Departments</div>
            <div className="stat-value">{Math.max(departments.length - 1, 0)}</div>
          </div>
          <span className="badge badge-neutral">
            <Building2 size={14} /> Academic
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Filtered Results</div>
            <div className="stat-value">{visibleCourses.length}</div>
          </div>
          <span className="badge badge-success">
            <BookMarked size={14} /> Matching
          </span>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search courses by code (CSE309) or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courses by code or title"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn-icon"
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "0.22rem",
                border: "none",
              }}
            >
              <X size={15} />
            </button>
          ) : (
            <span className="search-kbd" title="Press / to search">
              /
            </span>
          )}
        </div>

        <div className="filter-pills">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              className={`filter-pill ${selectedDept === dept ? "active" : ""}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept === "ALL" ? "All Depts" : dept}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading courses...</div>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: "var(--danger)" }}>
          <p style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => void fetchCourses(searchQuery)}
          >
            Retry
          </button>
        </div>
      ) : visibleCourses.length === 0 ? (
        <div className="empty-state">
          <h3 style={{ margin: "0 0 0.4rem", color: "var(--text-primary)" }}>
            No matching courses
          </h3>
          <p style={{ margin: 0 }}>
            {searchQuery
              ? `No courses matched "${searchQuery}". Try another keyword.`
              : "No courses in the catalog yet."}
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {visibleCourses.map((course) => (
            <article key={course.id} className="glass-card">
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  <span className="course-code-badge">{course.code}</span>
                  {course.semester_offered && (
                    <span className="badge badge-neutral">
                      <Calendar size={12} /> {course.semester_offered}
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    margin: "0 0 0.45rem",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    lineHeight: 1.35,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {course.title}
                </h2>

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.42rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.81rem",
                  }}
                >
                  <Building2 size={13} />
                  <span>{course.department || "General Studies"}</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.6rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                {isAdmin ? (
                  <Link
                    to={`/admin/materials?courseId=${course.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    + Core Material
                  </Link>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Materials · Contributions · Requests
                  </span>
                )}
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Explore <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        title="Create New Course"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreateCourse}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Course Code *</label>
              <input
                type="text"
                className="form-input mono"
                placeholder="e.g. CSE309"
                required
                minLength={2}
                maxLength={20}
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CSE"
                maxLength={100}
                value={formData.department ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Web Applications & Internet"
              required
              minLength={3}
              maxLength={200}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Semester Offered</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Autumn 2026"
              maxLength={50}
              value={formData.semester_offered ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, semester_offered: e.target.value })
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
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
