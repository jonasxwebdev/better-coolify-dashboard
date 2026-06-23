import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Tooltip } from "react-tooltip";
import { Toaster } from "react-hot-toast";
import { isAuthenticated } from "./api/auth";
import { SoundProvider } from "./hooks/useSoundEffects";
import { QueryProvider } from "./providers/QueryProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import SoundToggle from "./components/SoundToggle";
import BackToTop from "./components/BackToTop";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-primary"></div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <SoundProvider>
          <BrowserRouter>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
            <Tooltip id="backup-tooltip" />
            <Tooltip id="internal-url-tooltip" />
            <Tooltip id="external-url-tooltip" />
            <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "var(--radius)",
                padding: "0.875rem 1rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                background: "hsl(var(--popover))",
                color: "hsl(var(--popover-foreground))",
                border: "1px solid hsl(var(--border))",
                boxShadow:
                  "0 4px 12px -2px rgba(0, 0, 0, 0.25)",
                minWidth: "300px",
                maxWidth: "420px",
              },
              success: {
                iconTheme: {
                  primary: "hsl(var(--success))",
                  secondary: "hsl(var(--popover))",
                },
              },
              error: {
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--popover))",
                },
              },
              loading: {
                iconTheme: {
                  primary: "hsl(var(--primary))",
                  secondary: "hsl(var(--popover))",
                },
              },
            }}
          />
          <SoundToggle />
          <BackToTop />
        </BrowserRouter>
      </SoundProvider>
    </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
