import React, { useMemo, useState } from "react";

type NavLeaf = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type NavGroup = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children: NavLeaf[];
};

type NavItem = NavLeaf | NavGroup;

type SidebarProps = {
  brand?: { title: string; subtitle?: string };
  items?: NavItem[];
  initialActiveId?: string;
  onItemClick?: (id: string) => void; // opcional (por si luego conectas navegación)
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isGroup(item: NavItem): item is NavGroup {
  return (item as NavGroup).children !== undefined;
}

const DEFAULT_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "folios", label: "Folios" },
  {
    id: "catalogs",
    label: "Catálogos",
    children: [
      { id: "tags", label: "Tags" },
      { id: "users", label: "Usuarios" },
    ],
  },
  { id: "settings", label: "Settings" },
];

export default function Sidebar({
  brand = { title: "Gestion de folios", subtitle: "Static UI" },
  items = DEFAULT_ITEMS,
  initialActiveId = "dashboard",
  onItemClick,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(initialActiveId);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    catalogs: true,
  });

  const safeItems = useMemo(() => items, [items]);

  const setActive = (id: string) => {
    setActiveId(id);
    onItemClick?.(id);
    setMobileOpen(false);
  };

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const SidebarContent = (
    <aside className="h-full w-72 bg-slate-950 text-slate-100 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
          <span className="text-sm font-semibold">IR</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{brand.title}</p>
          {brand.subtitle ? (
            <p className="truncate text-xs text-slate-300">{brand.subtitle}</p>
          ) : null}
        </div>

        {/* Close (mobile) */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="ml-auto md:hidden rounded-xl bg-white/10 px-3 py-2 text-xs hover:bg-white/15 transition"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menú
        </p>

        <ul className="space-y-1">
          {safeItems.map((item) => {
            if (isGroup(item)) {
              const isOpen = Boolean(openGroups[item.id]);

              // Resalta grupo si el activeId está dentro
              const groupHasActive = item.children.some((c) => c.id === activeId);

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={cx(
                      "w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2",
                      "text-left text-sm hover:bg-white/10 transition",
                      groupHasActive ? "text-white bg-white/5" : "text-slate-200"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
                        {item.icon ?? <span className="text-xs">▦</span>}
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </span>

                    <span
                      className={cx("text-slate-400 transition", isOpen && "rotate-180")}
                      aria-hidden="true"
                    >
                      ▾
                    </span>
                  </button>

                  <div
                    className={cx(
                      "overflow-hidden transition-all",
                      isOpen ? "max-h-96" : "max-h-0"
                    )}
                  >
                    <ul className="mt-1 ml-4 border-l border-white/10 pl-2 space-y-1">
                      {item.children.map((child) => {
                        const isActive = child.id === activeId;

                        return (
                          <li key={child.id}>
                            <button
                              type="button"
                              onClick={() => setActive(child.id)}
                              className={cx(
                                "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                                "hover:bg-white/10 transition",
                                isActive ? "bg-white/10 text-white" : "text-slate-200"
                              )}
                            >
                              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">
                                {child.icon ?? <span className="text-xs">•</span>}
                              </span>
                              <span className="font-medium">{child.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            }

            const isActive = item.id === activeId;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cx(
                    "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                    "hover:bg-white/10 transition",
                    isActive ? "bg-white/10 text-white" : "text-slate-200"
                  )}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5">
                    {item.icon ?? <span className="text-xs">◼</span>}
                  </span>
                  <span className="font-medium">{item.label}</span>

                  {isActive ? (
                    <span className="ml-auto text-[10px] rounded-full bg-emerald-400/20 px-2 py-1 text-emerald-200">
                      active
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <button
          type="button"
          className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Top bar (mobile) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <div className="text-sm font-semibold text-slate-800">{brand.title}</div>

        <div className="w-10" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block md:fixed md:inset-y-0 md:left-0 md:w-72 bg-slate-900">
        {SidebarContent}
      </div>

      {/* Mobile overlay */}
      <div
        className={cx(
          "md:hidden fixed inset-0 z-40",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cx(
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={cx(
            "absolute left-0 top-0 h-full w-72 transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {SidebarContent}
        </div>
      </div>

      {/* Spacer (desktop) */}
      <div className="hidden md:block md:pl-72" />
    </>
  );
}
