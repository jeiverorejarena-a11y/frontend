/** App carga_documentos: requiere sesión de Cognito. */
import { RequireAuth } from "@/auth/RequireAuth";
import { Header } from "@/components/Header";
import { HelloPage } from "@/features/hello/HelloPage";

export function App() {
  return (
    <RequireAuth>
      <Header />
      <main>
        <HelloPage />
      </main>
    </RequireAuth>
  );
}
