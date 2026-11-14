/** Pantalla de login + flujo de cambio de contraseña en primer ingreso. */
import { useState, type FormEvent } from "react";

import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { signIn, completeNewPassword, newPasswordRequired } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (newPasswordRequired) {
        await completeNewPassword(newPassword);
      } else {
        await signIn(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-unipaz-light p-4">
      <div className="w-full max-w-sm rounded-xl border border-unipaz-line bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-unipaz-primary">CDI UNIPAZ</h1>
        <p className="mb-6 text-sm font-semibold text-gray-600">Cargar documentos</p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {!newPasswordRequired ? (
            <>
              <Field
                id="username"
                label="Correo electrónico"
                type="email"
                autoComplete="username"
                value={username}
                onChange={setUsername}
                autoFocus
              />
              <Field
                id="password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-gray-700">
                Es tu primer ingreso. Define una nueva contraseña.
              </p>
              <Field
                id="new-password"
                label="Nueva contraseña"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
                autoFocus
              />
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-status-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded bg-unipaz-accent py-2.5 font-bold text-white hover:bg-unipaz-accentDark focus:outline-none focus-visible:ring-2 focus-visible:ring-unipaz-primary focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {busy ? "Procesando..." : newPasswordRequired ? "Guardar contraseña" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  autoFocus,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-800">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-unipaz-primary focus:ring-1 focus:ring-unipaz-primary"
        required
      />
    </div>
  );
}
