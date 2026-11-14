/** Cliente HTTP mínimo para la API pública (sin token). */
import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = env.apiUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/${path.replace(/^\//, "")}`);

  if (!res.ok) {
    let message = res.status === 429 ? "Demasiadas solicitudes, intenta en un momento" : `API ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? body?.message ?? message;
    } catch {
      // cuerpo no-JSON: se mantiene el mensaje genérico
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}
