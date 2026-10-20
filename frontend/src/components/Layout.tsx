import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  BookMarked,
  Compass,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { contributionsApi } from "../api/contributions";

export function Layout({ children }: { children: ReactNode }) {
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
        const pending = await contributionsApi.listAll({ status: "pending", limit: 1 });
        if (active) setPendingCount(pending.total);
      } catch {
        if (active) setApiOnline(false);
      }
    };
    checkStatus();
    const timer = window.setInterval(checkStatus, 8000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

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
            <NavLink
              to="/admin/courses"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <FolderKanban size={16} />
              Manage Courses
            </NavLink>
            <NavLink
              to="/admin/materials"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <BookMarked size={16} />
              Core Materials
            </NavLink>
            <NavLink
              to="/admin/moderation"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <ShieldCheck size={16} />
              Moderation
              {pendingCount > 0 && (
                <span className="badge badge-warning" style={{ padding: "0.1rem 0.5rem" }}>
                  {pendingCount}
                </span>
              )}
            </NavLink>
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