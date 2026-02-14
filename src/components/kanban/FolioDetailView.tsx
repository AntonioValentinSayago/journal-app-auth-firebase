import { useMemo, useState } from "react";

type FolioStatus = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

type FolioActivity = {
  id: string;
  atIso: string;
  author: string;
  action: string;
  note?: string;
};

type Folio = {
  id: string;
  title: string;
  description?: string;

  status: FolioStatus;
  priority: Priority;
  tags: string[];

  createdAtIso: string;
  updatedAtIso: string;

  owner?: string; // asignado
  reporter?: string; // quien reporta
  system?: string; // origen
  affectedModule?: string; // módulo afectado
  environment?: "dev" | "qa" | "uat" | "prod";
};

type FolioDetailViewProps = {
  folio?: Folio;
  activities?: FolioActivity[];
  onBack?: () => void;

  // Para conectar después:
  onChangeStatus?: (status: FolioStatus) => void;
  onChangePriority?: (priority: Priority) => void;
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
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold";
  if (status === "todo") return `${base} border-slate-200 bg-slate-50 text-slate-700`;
  if (status === "in_progress") return `${base} border-indigo-200 bg-indigo-50 text-indigo-700`;
  return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
}

function priorityBadge(priority: Priority) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-[12px] font-semibold";
  if (priority === "high") return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  if (priority === "medium") return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
}

const DEMO_FOLIO: Folio = {
  id: "FOL-1042",
  title: "No guarda información del asegurado",
  description:
    "Al registrar un folio nuevo, el servicio responde que falta un dato aunque en la traza se envía completo. Replicar en ambiente de QA y documentar pasos.",
  status: "in_progress",
  priority: "high",
  tags: ["incidencia", "validación", "backend"],
  createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  updatedAtIso: new Date().toISOString(),
  owner: "Mesa de Control",
  reporter: "Cesar Valentin",
  system: "VisualNacar",
  affectedModule: "Alta de persona",
  environment: "qa",
};

const DEMO_ACTIVITY: FolioActivity[] = [
  {
    id: "a1",
    atIso: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    author: "Cesar Valentin",
    action: "Se documenta el incidente inicial",
    note: "Se observa inconsistencia entre traza y respuesta del servicio.",
  },
  {
    id: "a2",
    atIso: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    author: "Mesa de Control",
    action: "Se asigna prioridad alta",
    note: "Impacto en operación: bloquea registro de personas.",
  },
  {
    id: "a3",
    atIso: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    author: "Cesar Valentin",
    action: "Estatus actualizado a In progress",
    note: "Pendiente replicar en QA y adjuntar evidencia.",
  },
];

export default function FolioDetailView({
  folio = DEMO_FOLIO,
  activities = DEMO_ACTIVITY,
  onBack,
  onChangeStatus,
  onChangePriority,
}: FolioDetailViewProps) {
  const [localStatus, setLocalStatus] = useState<FolioStatus>(folio.status);
  const [localPriority, setLocalPriority] = useState<Priority>(folio.priority);

  const headerMeta = useMemo(() => {
    return {
      status: localStatus,
      priority: localPriority,
    };
  }, [localStatus, localPriority]);

  const handleStatus = (next: FolioStatus) => {
    setLocalStatus(next);
    onChangeStatus?.(next);
  };

  const handlePriority = (next: Priority) => {
    setLocalPriority(next);
    onChangePriority?.(next);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onBack}
                className="mt-0.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Volver
              </button>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[12px] font-semibold text-slate-700">
                    {folio.id}
                  </span>
                  <span className={statusBadge(headerMeta.status)}>
                    {statusLabel(headerMeta.status)}
                  </span>
                  <span className={priorityBadge(headerMeta.priority)}>
                    {headerMeta.priority.toUpperCase()}
                  </span>
                </div>

                <h1 className="mt-2 text-lg font-semibold text-slate-900">
                  {folio.title}
                </h1>
                {folio.description ? (
                  <p className="mt-1 text-sm text-slate-600">{folio.description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Editar
              </button>
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
              >
                Agregar nota
              </button>
            </div>
          </div>

          {folio.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {folio.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2 py-1 text-[12px] font-medium text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-4 lg:col-span-2">
            {/* Key details */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Resumen</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow label="Reportado por" value={folio.reporter ?? "—"} />
                <DetailRow label="Asignado a" value={folio.owner ?? "—"} />
                <DetailRow label="Sistema" value={folio.system ?? "—"} />
                <DetailRow label="Módulo afectado" value={folio.affectedModule ?? "—"} />
                <DetailRow label="Ambiente" value={(folio.environment ?? "—").toUpperCase()} />
                <DetailRow label="Última actualización" value={formatDate(folio.updatedAtIso)} />
              </div>
            </section>

            {/* Activity */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Actividad</h2>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Exportar
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {activities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Sin actividad todavía.
                  </div>
                ) : null}

                {activities.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        {a.action}
                      </div>
                      <div className="text-xs text-slate-500">{formatDate(a.atIso)}</div>
                    </div>

                    <div className="mt-1 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">{a.author}</span>
                      {a.note ? <span className="ml-2">— {a.note}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Acciones</h2>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Cambiar estatus
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <ActionChip
                      active={localStatus === "todo"}
                      label="To do"
                      onClick={() => handleStatus("todo")}
                    />
                    <ActionChip
                      active={localStatus === "in_progress"}
                      label="In progress"
                      onClick={() => handleStatus("in_progress")}
                    />
                    <ActionChip
                      active={localStatus === "done"}
                      label="Done"
                      onClick={() => handleStatus("done")}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Prioridad
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <ActionChip
                      active={localPriority === "low"}
                      label="Low"
                      onClick={() => handlePriority("low")}
                    />
                    <ActionChip
                      active={localPriority === "medium"}
                      label="Medium"
                      onClick={() => handlePriority("medium")}
                    />
                    <ActionChip
                      active={localPriority === "high"}
                      label="High"
                      onClick={() => handlePriority("high")}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Adjuntar evidencia
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Cerrar folio
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Fechas</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Creado</span>
                  <span className="font-medium">{formatDate(folio.createdAtIso)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Actualizado</span>
                  <span className="font-medium">{formatDate(folio.updatedAtIso)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[12px] font-semibold text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ActionChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
        active
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}