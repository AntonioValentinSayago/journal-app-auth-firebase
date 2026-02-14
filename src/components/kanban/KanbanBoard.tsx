import React, { useMemo, useState } from "react";

type ColumnId = "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high";

type KanbanColumn = {
  id: ColumnId;
  title: string;
  hint?: string;
};

type KanbanCard = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  priority: Priority;
  columnId: ColumnId;
  createdAtIso: string;
};

type CreateCardInput = {
  title: string;
  description: string;
  tagsCsv: string;
  priority: Priority;
  columnId: ColumnId;
};

const STORAGE_KEY = "incident_radar:kanban_v1";

const COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "To do", hint: "Pendientes" },
  { id: "in_progress", title: "In progress", hint: "En curso" },
  { id: "done", title: "Done", hint: "Cerrados" },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function priorityBadge(priority: Priority) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium";
  if (priority === "high")
    return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  if (priority === "medium")
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
}

function normalizeTags(tagsCsv: string) {
  return tagsCsv
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function nextColumn(columnId: ColumnId): ColumnId | null {
  if (columnId === "todo") return "in_progress";
  if (columnId === "in_progress") return "done";
  return null;
}

function prevColumn(columnId: ColumnId): ColumnId | null {
  if (columnId === "done") return "in_progress";
  if (columnId === "in_progress") return "todo";
  return null;
}

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "c1",
    title: "Validar folio con datos incompletos",
    description: "Revisar reglas de captura y mensajes de error en UI.",
    tags: ["incidencia", "validación"],
    priority: "high",
    columnId: "todo",
    createdAtIso: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Definir estructura de componentes",
    description: "Separar layout, ui y features para mantener escalabilidad.",
    tags: ["arquitectura"],
    priority: "medium",
    columnId: "in_progress",
    createdAtIso: new Date().toISOString(),
  },
  {
    id: "c3",
    title: "Sidebar estático (sin router)",
    description: "Componente responsive con estado activo y submenú.",
    tags: ["ui"],
    priority: "low",
    columnId: "done",
    createdAtIso: new Date().toISOString(),
  },
];

type DragPayload = {
  cardId: string;
  fromColumnId: ColumnId;
};

const DND_MIME = "application/x-kanban-card";

export default function KanbanBoard() {
  const [cards, setCards] = useState<KanbanCard[]>(() => {
    const saved = safeParse<KanbanCard[]>(localStorage.getItem(STORAGE_KEY));
    return saved?.length ? saved : INITIAL_CARDS;
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInput, setCreateInput] = useState<CreateCardInput>({
    title: "",
    description: "",
    tagsCsv: "",
    priority: "medium",
    columnId: "todo",
  });

  // DnD UI state (solo para resaltar columna destino; no cambia diseño base)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<ColumnId | null>(null);

  const columnsWithCards = useMemo(() => {
    const byCol: Record<ColumnId, KanbanCard[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    for (const card of cards) byCol[card.columnId].push(card);

    // orden simple por fecha (igual que antes)
    for (const col of Object.keys(byCol) as ColumnId[]) {
      byCol[col].sort((a, b) => (a.createdAtIso < b.createdAtIso ? 1 : -1));
    }

    return byCol;
  }, [cards]);

  const persist = (next: KanbanCard[]) => {
    setCards(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const moveCard = (cardId: string, dir: "left" | "right") => {
    setCards((prev) => {
      const next = prev.map((c) => {
        if (c.id !== cardId) return c;

        const target =
          dir === "right" ? nextColumn(c.columnId) : prevColumn(c.columnId);

        if (!target) return c;
        return { ...c, columnId: target };
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateCardColumn = (cardId: string, toColumnId: ColumnId) => {
    setCards((prev) => {
      const next = prev.map((c) =>
        c.id === cardId ? { ...c, columnId: toColumnId } : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const deleteCard = (cardId: string) => {
    persist(cards.filter((c) => c.id !== cardId));
  };

  const openCreate = (columnId?: ColumnId) => {
    setCreateInput((p) => ({
      ...p,
      columnId: columnId ?? "todo",
    }));
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
    setCreateInput({
      title: "",
      description: "",
      tagsCsv: "",
      priority: "medium",
      columnId: "todo",
    });
  };

  const createCard = () => {
    const title = createInput.title.trim();
    if (!title) return;

    const newCard: KanbanCard = {
      id: uid(),
      title,
      description: createInput.description.trim() || undefined,
      tags: normalizeTags(createInput.tagsCsv),
      priority: createInput.priority,
      columnId: createInput.columnId,
      createdAtIso: new Date().toISOString(),
    };

    persist([newCard, ...cards]);
    closeCreate();
  };

  const clearBoard = () => persist([]);
  const resetDemo = () => persist(INITIAL_CARDS);

  // ----------------------------
  // Drag & Drop (HTML5)
  // ----------------------------
  const onCardDragStart = (card: KanbanCard) => (e: React.DragEvent) => {
    const payload: DragPayload = { cardId: card.id, fromColumnId: card.columnId };
    e.dataTransfer.setData(DND_MIME, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    setDraggingCardId(card.id);
  };

  const onCardDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColumnId(null);
  };

  const onColumnDragOver = (columnId: ColumnId) => (e: React.DragEvent) => {
    // necesario para permitir drop
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId(columnId);
  };

  const onColumnDragLeave = (columnId: ColumnId) => () => {
    setDragOverColumnId((prev) => (prev === columnId ? null : prev));
  };

  const onColumnDrop = (columnId: ColumnId) => (e: React.DragEvent) => {
    e.preventDefault();

    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return;

    try {
      const payload = JSON.parse(raw) as DragPayload;
      if (!payload?.cardId) return;

      updateCardColumn(payload.cardId, columnId);
    } catch {
      // ignore invalid payload
    } finally {
      setDraggingCardId(null);
      setDragOverColumnId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Kanban Board
              </h1>
              <p className="text-sm text-slate-500">
                Tablero estático para gestión de folios (Drag & Drop local).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openCreate("todo")}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
              >
                <span className="text-base leading-none">＋</span>
                Nuevo folio
              </button>

              <button
                type="button"
                onClick={resetDemo}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset demo
              </button>

              <button
                type="button"
                onClick={clearBoard}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colCards = columnsWithCards[col.id];

            return (
              <section
                key={col.id}
                // 👇 NO cambiamos diseño base; solo agregamos un highlight sutil al arrastrar encima
                className={cx(
                  "rounded-2xl border border-slate-200 bg-white shadow-sm",
                  dragOverColumnId === col.id && "ring-2 ring-indigo-200"
                )}
                onDragOver={onColumnDragOver(col.id)}
                onDragLeave={onColumnDragLeave(col.id)}
                onDrop={onColumnDrop(col.id)}
              >
                {/* Column header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      {col.title}
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {colCards.length}
                      </span>
                    </h2>
                    {col.hint ? (
                      <p className="text-xs text-slate-500">{col.hint}</p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => openCreate(col.id)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    + Add
                  </button>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-3 p-4">
                  {colCards.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      Sin tarjetas todavía.
                    </div>
                  ) : null}

                  {colCards.map((card) => (
                    <article
                      key={card.id}
                      // 👇 NO cambiamos diseño; solo ponemos cursor y un hint cuando se arrastra
                      className={cx(
                        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md",
                        "cursor-grab active:cursor-grabbing",
                        draggingCardId === card.id && "opacity-60"
                      )}
                      draggable
                      onDragStart={onCardDragStart(card)}
                      onDragEnd={onCardDragEnd}
                      title="Arrastra para cambiar de estatus"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {card.title}
                          </h3>

                          {card.description ? (
                            <p className="mt-1 text-sm text-slate-600">
                              {card.description}
                            </p>
                          ) : null}
                        </div>

                        <span className={priorityBadge(card.priority)}>
                          {card.priority.toUpperCase()}
                        </span>
                      </div>

                      {card.tags.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {card.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveCard(card.id, "left")}
                            disabled={!prevColumn(card.columnId)}
                            className={cx(
                              "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                              prevColumn(card.columnId)
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            )}
                            aria-label="Move left"
                          >
                            ←
                          </button>

                          <button
                            type="button"
                            onClick={() => moveCard(card.id, "right")}
                            disabled={!nextColumn(card.columnId)}
                            className={cx(
                              "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                              nextColumn(card.columnId)
                                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                            )}
                            aria-label="Move right"
                          >
                            →
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteCard(card.id)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeCreate} />
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Nuevo folio
                </h3>
                <p className="text-xs text-slate-500">
                  Crea una tarjeta para tu tablero.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Título
                </label>
                <input
                  value={createInput.title}
                  onChange={(e) =>
                    setCreateInput((p) => ({ ...p, title: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Ej: Folio no guarda datos del asegurado"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Descripción (opcional)
                </label>
                <textarea
                  value={createInput.description}
                  onChange={(e) =>
                    setCreateInput((p) => ({ ...p, description: e.target.value }))
                  }
                  className="mt-2 min-h-[90px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Contexto breve, pasos, notas..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Columna
                  </label>
                  <select
                    value={createInput.columnId}
                    onChange={(e) =>
                      setCreateInput((p) => ({
                        ...p,
                        columnId: e.target.value as ColumnId,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Prioridad
                  </label>
                  <select
                    value={createInput.priority}
                    onChange={(e) =>
                      setCreateInput((p) => ({
                        ...p,
                        priority: e.target.value as Priority,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Tags (separadas por coma)
                </label>
                <input
                  value={createInput.tagsCsv}
                  onChange={(e) =>
                    setCreateInput((p) => ({ ...p, tagsCsv: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  placeholder="incidencia, backend, ui"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={createCard}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
