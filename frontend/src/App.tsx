import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/ToastContext";

function PlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="hero-banner">
      <span className="hero-eyebrow">PassDown MVP v0.1.0</span>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-subtitle">{subtitle}</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={
                <PlaceholderPage
                  title="Course Catalog"
                  subtitle="Search and browse university courses, curated core materials, student contributions, and requests."
                />
              }
            />
            <Route
              path="/courses/:id"
              element={
                <PlaceholderPage
                  title="Course Workspace"
                  subtitle="Core materials, approved student contributions, and open material requests."
                />
              }
            />
            <Route
              path="/admin/courses"
              element={
                <PlaceholderPage
                  title="Manage Courses"
                  subtitle="Create, update, and delete courses in the catalog."
                />
              }
            />
            <Route
              path="/admin/materials"
              element={
                <PlaceholderPage
                  title="Manage Core Materials"
                  subtitle="Curate official slides, notes, past papers, and reference books per course."
                />
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <PlaceholderPage
                  title="Contribution Moderation Queue"
                  subtitle="Review, approve, or reject student-submitted resource links."
                />
              }
            />
          </Routes>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}