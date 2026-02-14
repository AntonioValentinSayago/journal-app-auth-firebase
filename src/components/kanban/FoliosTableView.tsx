import React, { useMemo, useState } from "react";

type FolioStatus = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

type Folio = {
  id: string;
  title: string;
  description?: string;

  status: FolioStatus;
  priority: Priority;
  tags: string[];

  createdAtIso: string;
  updatedAtIso: string;

  owner?: string;
  reporter?: string;
  system?: string;
  affectedModule?: string;
  environment?: "dev" | "qa" | "uat" | "prod";
};

type SortKey =
  | "id"
  | "title"
  | "status"
  | "priority"
  | "updatedAtIso"
  | "owner"
  | "environment";

type SortDir = "asc" | "desc";

type FoliosTableViewProps = {
  initialFolios?: Folio[];
  onSelectFolio?: (folioId: string) => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function statusLabel(status: FolioStatus) {
  if (status === "todo") return "To do";
  if (status === "in_progress") return "In progress";
  return "Done";
}

function statusBadge(status: FolioStatus) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold";
  if (status === "todo") return `${base} border-slate-200 bg-slate-50 text-slate-700`;
  if (status === "in_progress")
    return `${base} border-indigo-200 bg-indigo-50 text-indigo-700`;
  return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
}

function priorityBadge(priority: Priority) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold";
  if (priority === "high") return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  if (priority === "medium")
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
}

function toSearchText(f: Folio) {
  return [
    f.id,
    f.title,
    f.description ?? "",
    f.status,
    f.priority,
    f.owner ?? "",
    f.reporter ?? "",
    f.system ?? "",
    f.affectedModule ?? "",
    f.environment ?? "",
    f.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

function compare(a: string, b: string, dir: SortDir) {
  const res = a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  return dir === "asc" ? res : -res;
}

function headerBtn(active: boolean) {
  return cx(
    "inline-flex items-center gap-2 select-none",
    "text-xs font-semibold",
    active ? "text-slate-900" : "text-slate-600"
  );
}

const DEMO_FOLIOS: Folio[] = [
  {
    id: "FOL-1042",
    title: "No guarda información del asegurado",
    description: "Servicio responde dato faltante aunque traza va completa.",
    status: "in_progress",
    priority: "high",
    tags: ["incidencia", "validación", "backend"],
    createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    owner: "Mesa de Control",
    reporter: "Cesar Valentin",
    system: "VisualNacar",
    affectedModule: "Alta de persona",
    environment: "qa",
  },
  {
    id: "FOL-1043",
    title: "UI no muestra mensaje de saldo insuficiente",
    description: "Validación de monto vs saldo no está visible en formulario.",
    status: "todo",
    priority: "medium",
    tags: ["ui", "validación"],
    createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    owner: "Front",
    reporter: "QA",
    system: "WebApp",
    affectedModule: "Créditos",
    environment: "uat",
  },
  {
    id: "FOL-1044",
    title: "Error intermitente al guardar cobertura",
    description: "Revisar payload y respuesta del servicio en QA.",
    status: "done",
    priority: "low",
    tags: ["incidencia", "qa"],
    createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    owner: "Backend",
    reporter: "Soporte",
    system: "API",
    affectedModule: "Coberturas",
    environment: "qa",
  },
];

export default function FoliosTableView({
  initialFolios = DEMO_FOLIOS,
  onSelectFolio,
}: FoliosTableViewProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FolioStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const [sortKey, setSortKey] = useState<SortKey>("updatedAtIso");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialFolios.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (priorityFilter !== "all" && f.priority !== priorityFilter) return false;
      if (!q) return true;
      return toSearchText(f).includes(q);
    });
  }, [initialFolios, priorityFilter, query, statusFilter]);

  const sorted = useMemo(() => {
    const next = [...filtered];

    next.sort((a, b) => {
      const dir = sortDir;

      const get = (f: Folio): string => {
        if (sortKey === "updatedAtIso") return f.updatedAtIso;
        if (sortKey === "id") return f.id;
        if (sortKey === "title") return f.title;
        if (sortKey === "status") return f.status;
        if (sortKey === "priority") return f.priority;
        if (sortKey === "owner") return f.owner ?? "";
        if (sortKey === "environment") return f.environment ?? "";
        return "";
      };

      return compare(get(a), get(b), dir);
    });

    return next;
  }, [filtered, sortDir, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paged = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [page, pageSize, sorted, totalPages]);

  const setSort = (key: SortKey) => {
    setPage(1);
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortKey("updatedAtIso");
    setSortDir("desc");
    setPage(1);
  };

  const empty = sorted.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Folios</h1>
              <p className="text-sm text-slate-500">
                Lista de incidencias con búsqueda y filtros.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
            >
              <span className="text-base leading-none">＋</span>
              Nuevo folio
            </button>
          </div>

          {/* Controls */}
          <div className="mt-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-400">⌕</span>
                <input
                  value={query}
                  onChange={(e) => {
                    setPage(1);
                    setQuery(e.target.value);
                  }}
                  className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Buscar por folio, título, tags, owner, sistema..."
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setPage(1);
                  setStatusFilter(e.target.value as FolioStatus | "all");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">Estatus: Todos</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPage(1);
                  setPriorityFilter(e.target.value as Priority | "all");
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="all">Prioridad: Todas</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-slate-600">
                Mostrando{" "}
                <span className="font-semibold text-slate-900">{sorted.length}</span>{" "}
                folios
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left">
                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("id")}
                      className={headerBtn(sortKey === "id")}
                    >
                      Folio {sortKey === "id" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("title")}
                      className={headerBtn(sortKey === "title")}
                    >
                      Título{" "}
                      {sortKey === "title" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("status")}
                      className={headerBtn(sortKey === "status")}
                    >
                      Estatus{" "}
                      {sortKey === "status" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("priority")}
                      className={headerBtn(sortKey === "priority")}
                    >
                      Prioridad{" "}
                      {sortKey === "priority"
                        ? sortDir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("owner")}
                      className={headerBtn(sortKey === "owner")}
                    >
                      Asignado{" "}
                      {sortKey === "owner" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("environment")}
                      className={headerBtn(sortKey === "environment")}
                    >
                      Ambiente{" "}
                      {sortKey === "environment"
                        ? sortDir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </button>
                  </Th>

                  <Th>
                    <button
                      type="button"
                      onClick={() => setSort("updatedAtIso")}
                      className={headerBtn(sortKey === "updatedAtIso")}
                    >
                      Actualizado{" "}
                      {sortKey === "updatedAtIso"
                        ? sortDir === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </button>
                  </Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {empty ? (
                  <tr>
                    <td colSpan={7} className="p-6">
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No se encontraron folios con los filtros actuales.
                      </div>
                    </td>
                  </tr>
                ) : null}

                {paged.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectFolio?.(f.id)}
                    title="Abrir detalle"
                  >
                    <Td>
                      <div className="font-semibold text-slate-900">{f.id}</div>
                      <div className="text-xs text-slate-500">
                        Creado: {formatDate(f.createdAtIso)}
                      </div>
                    </Td>

                    <Td>
                      <div className="font-semibold text-slate-900">{f.title}</div>
                      {f.tags.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                          {f.tags.length > 3 ? (
                            <span className="text-[11px] font-medium text-slate-500">
                              +{f.tags.length - 3}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </Td>

                    <Td>
                      <span className={statusBadge(f.status)}>
                        {statusLabel(f.status)}
                      </span>
                    </Td>

                    <Td>
                      <span className={priorityBadge(f.priority)}>
                        {f.priority.toUpperCase()}
                      </span>
                    </Td>

                    <Td>
                      <div className="text-sm font-semibold text-slate-900">
                        {f.owner ?? "—"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.system ?? "—"} · {f.affectedModule ?? "—"}
                      </div>
                    </Td>

                    <Td>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                        {(f.environment ?? "—").toUpperCase()}
                      </span>
                    </Td>

                    <Td>
                      <div className="text-sm font-semibold text-slate-900">
                        {formatDate(f.updatedAtIso)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Reporta: {f.reporter ?? "—"}
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              Página <span className="font-semibold text-slate-900">{page}</span> de{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className={cx(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  page === 1
                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                ⏮
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cx(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  page === 1
                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cx(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  page === totalPages
                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                →
              </button>

              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className={cx(
                  "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                  page === totalPages
                    ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------
   Small table helpers
------------------------------ */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold text-slate-600">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 align-top">{children}</td>;
}
