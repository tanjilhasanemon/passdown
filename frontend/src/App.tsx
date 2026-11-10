import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleRoute } from "./auth/RoleRoute";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/ToastContext";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminMaterialsPage } from "./pages/AdminMaterialsPage";
import { AdminModerationPage } from "./pages/AdminModerationPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { CourseListPage } from "./pages/CourseListPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function PlaceholderSection({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="hero-banner">
      <span className="hero-eyebrow">PassDown Beta v0.2.0</span>
      <h1 className="hero-title">{title}</h1>
      <p className="hero-subtitle">{subtitle}</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <PlaceholderSection
                      title="Admin Dashboard"
                      subtitle="Platform statistics, pending moderation queue, and user account management."
                    />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/courses"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminCoursesPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/materials"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminMaterialsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/moderation"
                element={
                  <RoleRoute allowedRoles={["admin"]}>
                    <AdminModerationPage />
                  </RoleRoute>
                }
              />
            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
