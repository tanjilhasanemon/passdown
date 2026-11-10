import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import axios from "axios";
import {
  BookMarked,
  Compass,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  UserPlus,
} from "lucide-react";
import { contributionsApi } from "../api/contributions";
import { useAuth } from "../auth/AuthContext";

export function Layout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = window.localStorage.getItem("passdown-theme");
    return saved === "light" ? "light" : "dark";
  });
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("passdown-theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        await axios.get("/api/health");
        if (active) setApiOnline(true);
        if (isAdmin) {
          const pending = await contributionsApi.listAll({
            status: "pending",
            limit: 1,
          });
          if (active) setPendingCount(pending.total);
        } else if (active) {
          setPendingCount(0);
        }
      } catch {
        if (active) setApiOnline(false);
      }
    };
    void checkStatus();
    const timer = window.setInterval(checkStatus, 10000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isAdmin]);

  return (
    <div>
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-icon">
              <GraduationCap size={22} />
            </span>
            <div>
              <span>PassDown</span>
              <span className="brand-subtitle">IUB Course Resource Hub</span>
            </div>
          </NavLink>

          <nav className="nav-links" aria-label="Main Navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Compass size={16} />
              Explore Courses
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <LayoutDashboard size={16} />
                My Dashboard
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <ShieldCheck size={16} />
                  Admin Hub
                  {pendingCount > 0 && (
                    <span
                      className="badge badge-warning"
                      style={{ padding: "0.1rem 0.5rem" }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/admin/courses"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <FolderKanban size={16} />
                  Courses
                </NavLink>
                <NavLink
                  to="/admin/materials"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <BookMarked size={16} />
                  Materials
                </NavLink>
              </>
            )}
          </nav>

          <div className="nav-actions">
            <span className="api-pill" title="FastAPI /api/health status">
              <span className={`status-dot ${apiOnline ? "online" : "offline"}`} />
              {apiOnline ? "API Online" : "API Offline"}
            </span>

            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open FastAPI Swagger Documentation"
            >
              API Docs <ExternalLink size={13} />
            </a>

            {isAuthenticated && user ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                <Link
                  to="/dashboard"
                  className="badge badge-info"
                  style={{ padding: "0.38rem 0.75rem", fontSize: "0.78rem" }}
                  title={`Signed in as ${user.email}`}
                >
                  {user.name} ({user.role})
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={14} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={14} /> Register
                </Link>
              </div>
            )}

            <button
              type="button"
              className="btn-icon"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle color theme"
              title="Switch Dark / Light Mode"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      <main className="main-container">{children}</main>
    </div>
  );
}
