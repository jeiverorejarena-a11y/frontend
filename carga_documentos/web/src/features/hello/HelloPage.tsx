/**
 * Hola mundo integrado: llama GET /hello (API carga, con token de Cognito) y
 * muestra la respuesta de Aurora. Valida el flujo UI -> API -> Cognito -> DB.
 */
import { useCallback, useEffect, useState } from "react";

import { ApiError, apiGet } from "@/lib/apiClient";

interface HelloResponse {
  message: string;
  service: string;
  user: { email: string | null; sub: string | null };
  database: { name: string; server_time: string; version: string };
}

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: HelloResponse }
  | { kind: "error"; message: string; resuming: boolean };

export function HelloPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      setState({ kind: "ok", data: await apiGet<HelloResponse>("hello") });
    } catch (err) {
      const resuming = err instanceof ApiError && err.status === 503;
      setState({
        kind: "error",
        resuming,
        message: err instanceof Error ? err.message : "Error de red",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 border-b-2 border-gray-200 pb-3 text-2xl font-bold text-unipaz-primary">
        Hola mundo · carga_documentos
      </h1>

      <div aria-live="polite" className="rounded-lg border-2 border-unipaz-primary p-6">
        {state.kind === "loading" && <p className="text-gray-600">Consultando la API...</p>}

        {state.kind === "error" && (
          <div role="alert">
            <p className={state.resuming ? "text-status-warning" : "text-status-error"}>
              {state.message}
            </p>
            {state.resuming && (
              <p className="mt-1 text-sm text-gray-600">
                Aurora estaba en pausa por inactividad; tarda unos segundos en iniciar.
              </p>
            )}
          </div>
        )}

        {state.kind === "ok" && (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            <dt className="font-semibold text-gray-700">Mensaje</dt>
            <dd className="font-bold text-unipaz-accent">{state.data.message}</dd>
            <dt className="font-semibold text-gray-700">Usuario</dt>
            <dd>{state.data.user.email ?? state.data.user.sub ?? "-"}</dd>
            <dt className="font-semibold text-gray-700">Base de datos</dt>
            <dd>{state.data.database.name}</dd>
            <dt className="font-semibold text-gray-700">Hora del servidor</dt>
            <dd>{state.data.database.server_time}</dd>
            <dt className="font-semibold text-gray-700">Versión</dt>
            <dd className="break-words">{state.data.database.version}</dd>
          </dl>
        )}
      </div>

      <button
        type="button"
        onClick={() => void load()}
        disabled={state.kind === "loading"}
        className="mt-6 rounded bg-unipaz-accent px-6 py-2.5 font-bold text-white hover:bg-unipaz-accentDark focus:outline-none focus-visible:ring-2 focus-visible:ring-unipaz-primary focus-visible:ring-offset-2 disabled:opacity-60"
      >
        Probar de nuevo
      </button>
    </section>
  );
}
