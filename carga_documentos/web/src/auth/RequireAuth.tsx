/** Guard: si no hay sesión, muestra el login. */
import type { ReactNode } from "react";

import { LoginPage } from "./LoginPage";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center text-gray-600">
        Cargando...
      </div>
    );
  }
  if (!user) {
    return <LoginPage />;
  }
  return <>{children}</>;
}
