/**
 * Contexto de autenticación sobre Amplify Auth (Cognito).
 *
 * Expone el estado de sesión y los métodos de login, cambio de contraseña en
 * primer ingreso (NEW_PASSWORD_REQUIRED) y logout.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
  signIn,
  signOut,
} from "aws-amplify/auth";

interface AuthUser {
  username: string;
  email?: string;
}

interface AuthState {
  loading: boolean;
  user: AuthUser | null;
  /** true cuando Cognito exige cambiar la contraseña temporal. */
  newPasswordRequired: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [newPasswordRequired, setNewPasswordRequired] = useState(false);

  const loadCurrentUser = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      const session = await fetchAuthSession();
      const email = session.tokens?.idToken?.payload?.email as string | undefined;
      setUser({ username: current.username, email });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  const handleSignIn = useCallback(
    async (username: string, password: string) => {
      const out = await signIn({ username, password });
      if (out.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setNewPasswordRequired(true);
        return;
      }
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const completeNewPassword = useCallback(
    async (newPassword: string) => {
      await confirmSignIn({ challengeResponse: newPassword });
      setNewPasswordRequired(false);
      await loadCurrentUser();
    },
    [loadCurrentUser],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
    setNewPasswordRequired(false);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      user,
      newPasswordRequired,
      signIn: handleSignIn,
      completeNewPassword,
      signOut: handleSignOut,
    }),
    [loading, user, newPasswordRequired, handleSignIn, completeNewPassword, handleSignOut],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
