/** App consulta_documentos: pública, sin login. */
import { Header } from "@/components/Header";
import { HelloPage } from "@/features/hello/HelloPage";

export function App() {
  return (
    <>
      <Header />
      <main>
        <HelloPage />
      </main>
    </>
  );
}
