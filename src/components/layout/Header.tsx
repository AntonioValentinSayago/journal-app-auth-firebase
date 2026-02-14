type HeaderProps = {
  title?: string;
  subtitle?: string;
  onCreate?: () => void;
};

export default function Header({
  title = "Gestión de Folios",
  subtitle = "Administra y da seguimiento a incidencias",
  onCreate,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div>
          <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* Right side */}
        <button
          onClick={onCreate}
          className="
            inline-flex items-center gap-2
            rounded-xl bg-slate-900 px-4 py-2.5
            text-sm font-medium text-white
            shadow-sm transition
            hover:bg-indigo-700
            active:scale-95
          "
        >
          {/* Icon */}
          <span className="text-lg leading-none">＋</span>

          Nuevo folio
        </button>
      </div>
    </header>
  );
}
