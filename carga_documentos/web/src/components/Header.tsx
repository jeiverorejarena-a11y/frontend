/** Header institucional + barra de navegación con la sesión del usuario. */
import { useAuth } from "@/auth/AuthContext";

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header>
      <div className="flex items-center gap-5 border-b-2 border-unipaz-line bg-white px-6 py-3 md:px-12">
        <div className="border-l-2 border-gray-300 pl-5">
          <p className="text-xl font-bold text-unipaz-primary">CDI UNIPAZ</p>
          <p className="text-xs font-semibold text-gray-600">
            Centro de Información - Repositorio Digital
          </p>
        </div>
      </div>
      <nav
        aria-label="Principal"
        className="flex items-center justify-between bg-unipaz-dark px-6 py-3 text-sm text-white md:px-12"
      >
        <span className="font-medium">Cargar documentos</span>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">{user?.email ?? user?.username}</span>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded px-3 py-1.5 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>
  );
}
