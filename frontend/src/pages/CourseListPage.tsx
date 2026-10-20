import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  Building2,
  Calendar,
  FolderPlus,
  Layers,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { coursesApi } from "../api/courses";
import { extractErrorMessage } from "../api/client";
import { Modal } from "../components/Modal";
import { useToast } from "../components/ToastContext";
import type { Course, CoursePayload } from "../types";

export function CourseListPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Create Course Modal
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<CoursePayload>({
    code: "",
    title: "",
    department: "CSE",
    semester_offered: "Autumn 2026",
  });

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
    }, 220);
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
      {/* Hero Banner */}
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
              <Sparkles size={14} /> IUB Course Preparation Platform
            </span>
            <h1 className="hero-title">
              Prepare Ahead.{" "}
              <span className="hero-gradient-text">
                Never Chase Seniors Again.
              </span>
            </h1>
            <p className="hero-subtitle">
              Browse curated core materials, student-contributed study links, and
              open resource requests for every course before the semester begins.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCreateOpen(true)}
            >
              <FolderPlus size={17} /> New Course
            </button>
            <Link to="/admin/courses" className="btn btn-secondary">
              Manage Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Catalog Courses</div>
            <div className="stat-value">{total}</div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <Layers size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Departments Active</div>
            <div className="stat-value">{Math.max(departments.length - 1, 0)}</div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <Building2 size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Showing Matches</div>
            <div className="stat-value">{visibleCourses.length}</div>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <BookMarked size={20} />
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses by code (e.g. CSE309) or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search courses by code or title"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="btn-icon"
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "0.55rem",
                top: "50%",
                transform: "translateY(-50%)",
                padding: "0.25rem",
                border: "none",
              }}
            >
              <X size={16} />
            </button>
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
              {dept === "ALL" ? "All Departments" : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="empty-state">Loading courses from API...</div>
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
            No courses found
          </h3>
          <p style={{ margin: "0 0 1.1rem" }}>
            {searchQuery
              ? `No courses matched "${searchQuery}". Try a different search term or create a new course.`
              : "Your course catalog is currently empty. Add your first course to get started."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateOpen(true)}
          >
            <FolderPlus size={16} /> Create First Course
          </button>
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
                    margin: "0 0 0.5rem",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    lineHeight: 1.35,
                  }}
                >
                  {course.title}
                </h2>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.84rem",
                  }}
                >
                  <Building2 size={14} />
                  <span>{course.department || "General Department"}</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.6rem",
                  paddingTop: "0.9rem",
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <Link
                  to={`/admin/materials?courseId=${course.id}`}
                  className="btn btn-secondary btn-sm"
                >
                  + Core Material
                </Link>
                <Link
                  to={`/courses/${course.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Open Hub <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Quick Create Course Modal */}
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