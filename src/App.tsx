import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./page/home";
import Login from "./page/login";
import GrnPage from "./page/grnPage";
import CouponsPage from "./page/coupons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { AdminRoute } from "./components/AdminRoute";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "always",
      },
      mutations: {
        networkMode: "always",
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grnPage"
          element={
            <ProtectedRoute>
              <GrnPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <CouponsPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
