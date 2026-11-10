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
    return saved === "dark" ? "dark" : "light";
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-icon">
              <GraduationCap size={18} />
            </span>
            <div>
              <span>PassDown</span>
              <span className="brand-subtitle">IUB Course Archive</span>
            </div>
          </NavLink>

          <nav className="nav-links" aria-label="Main Navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <Compass size={15} />
              Course Directory
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <LayoutDashboard size={15} />
                My Workspace
              </NavLink>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  end
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <ShieldCheck size={15} />
                  Admin Hub
                  {pendingCount > 0 && (
                    <span
                      className="badge badge-warning"
                      style={{ padding: "0.06rem 0.44rem", fontSize: "0.68rem" }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to="/admin/courses"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <FolderKanban size={15} />
                  Catalog CRUD
                </NavLink>
                <NavLink
                  to="/admin/materials"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <BookMarked size={15} />
                  Materials CRUD
                </NavLink>
              </>
            )}
          </nav>

          <div className="nav-actions">
            <span className="api-pill" title="FastAPI /api/health status">
              <span className={`status-dot ${apiOnline ? "online" : "offline"}`} />
              {apiOnline ? "API Ready" : "API Offline"}
            </span>

            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              title="Open FastAPI OpenAPI Documentation"
            >
              OpenAPI <ExternalLink size={12} />
            </a>

            {isAuthenticated && user ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
                <Link
                  to="/dashboard"
                  className="badge badge-success"
                  style={{ padding: "0.34rem 0.68rem", fontSize: "0.75rem" }}
                  title={`Signed in as ${user.email}`}
                >
                  {user.name} · {user.role.toUpperCase()}
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            ) : (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Link to="/login" className="btn btn-secondary btn-sm">
                  <LogIn size={13} /> Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={13} /> Register
                </Link>
              </div>
            )}

            <button
              type="button"
              className="btn-icon"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              aria-label="Toggle color theme"
              title="Switch Archival Light / Graphite Dark Mode"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <main className="main-container" style={{ flex: 1 }}>
        {children}
      </main>

      <footer className="app-footer">
        <div>
          <strong>PassDown v0.2.0</strong> · CSE 309 Web Applications &amp; Internet ·
          Independent University, Bangladesh (IUB)
        </div>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/api/docs" target="_blank" rel="noopener noreferrer">
            REST API Docs (/api/docs)
          </a>
          <span>·</span>
          <span>Tanjil Hasan Emon (ID: 2331024)</span>
        </div>
      </footer>
    </div>
  );
}
