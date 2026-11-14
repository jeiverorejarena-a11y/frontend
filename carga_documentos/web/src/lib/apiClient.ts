/**
 * Cliente HTTP mínimo que adjunta el ID token de Cognito a cada request.
 * El Cognito User Pool Authorizer de API Gateway valida el ID token.
 */
import { fetchAuthSession } from "aws-amplify/auth";

import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  return token ? { Authorization: token } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await authHeader();
  const base = env.apiUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/${path.replace(/^\//, "")}`, { headers });

  if (!res.ok) {
    let message = `API ${res.status}`;
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
