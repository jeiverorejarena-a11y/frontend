/** Header institucional + barra de navegación (UI pública, sin sesión). */
export function Header() {
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
      <nav aria-label="Principal" className="bg-unipaz-dark px-6 py-3 text-sm text-white md:px-12">
        <span className="font-medium">Consultar documentos</span>
      </nav>
    </header>
  );
}
