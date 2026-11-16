import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  BookOpen,
  Compass,
  Database,
  ExternalLink,
  HelpCircle,
  Layers,
  Lock,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

interface HealthPayload {
  status?: string;
  version?: string;
}

export function AboutPage() {
  const [health, setHealth] = useState<HealthPayload>({
    status: "checking",
    version: "0.2.0",
  });

  useEffect(() => {
    let active = true;
    axios
      .get<HealthPayload>("/api/health")
      .then((res) => {
        if (active) setHealth(res.data);
      })
      .catch(() => {
        if (active) setHealth({ status: "offline", version: "0.2.0" });
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="hero-banner">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: "780px" }}>
            <span className="hero-eyebrow">
              <BookOpen size={14} /> Archival Mission • IUB Course Archive
            </span>
            <h1 className="hero-title">About PassDown</h1>
            <p className="hero-subtitle">
              PassDown is a structured, peer-powered course material archive built for
              students at Independent University, Bangladesh (IUB). Instead of losing
              lecture slides, past papers, and notes across ephemeral chat threads,
              every course gets a curated, searchable home.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <Link to="/" className="btn btn-primary">
              <Compass size={16} /> Browse Directory
            </Link>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              OpenAPI Docs <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>

      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Section 1 • Curated</div>
            <div className="stat-value" style={{ fontSize: "1.15rem" }}>
              Core Materials
            </div>
            <p style={{ margin: "0.45rem 0 0", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              Verified syllabi, official slide decks, and reference textbooks maintained by
              course moderators.
            </p>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <Layers size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Section 2 • Moderated</div>
            <div className="stat-value" style={{ fontSize: "1.15rem" }}>
              Community Contributions
            </div>
            <p style={{ margin: "0.45rem 0 0", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              Student-submitted notes and past-paper solutions that pass admin review
              before appearing publicly.
            </p>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <UploadCloud size={20} />
          </span>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Section 3 • Demand-Driven</div>
            <div className="stat-value" style={{ fontSize: "1.15rem" }}>
              Course &amp; Material Requests
            </div>
            <p style={{ margin: "0.45rem 0 0", fontSize: "0.84rem", color: "var(--text-secondary)" }}>
              Request missing resources for existing courses or propose new courses to be
              added to the catalog.
            </p>
          </div>
          <span className="brand-icon" style={{ width: 42, height: 42 }}>
            <HelpCircle size={20} />
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div className="card" style={{ padding: "1.35rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
            <Database size={18} />
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Layered Architecture</h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Built with a <strong>FastAPI</strong> REST backend,{" "}
            <strong>SQLAlchemy 2.0</strong> repository-service layering, and{" "}
            <strong>Supabase PostgreSQL</strong> with Alembic schema migrations. The
            frontend is a <strong>React 19 + TypeScript + Vite</strong> single-page
            application deployed on Vercel.
          </p>
        </div>

        <div className="card" style={{ padding: "1.35rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.65rem" }}>
            <Lock size={18} />
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>Security &amp; RBAC</h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Passwords are hashed with <strong>Argon2id</strong>, sessions use{" "}
            <strong>HS256 JWT</strong> tokens with scoped RBAC permissions, and brute-force
            attempts trigger automatic 15-minute lockouts backed by an admin audit trail
            and security telemetry console.
          </p>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "1.1rem 1.35rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.85rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
          <ShieldCheck size={18} style={{ color: "var(--accent-brand)" }} />
          <span style={{ fontWeight: 700 }}>PassDown v{health.version || "0.2.0"}</span>
          <span className={`badge ${health.status === "ok" ? "badge-success" : "badge-neutral"}`}>
            API: {health.status === "ok" ? "Operational" : health.status}
          </span>
        </div>
        <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
          Maintained by <strong>Tanjil Hasan Emon</strong> (ID: 2331024) • IUB CSE
        </div>
      </div>
    </div>
  );
}
