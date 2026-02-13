import React, { useEffect, useMemo, useRef, useState } from "react";

type SearchItem = {
  id: string;
  label: string;
  description?: string;
};

type SearchBoxProps = {
  placeholder?: string;
  items?: SearchItem[]; // si lo quieres local/static
  minChars?: number;
  debounceMs?: number;
  maxResults?: number;
  onSearch?: (query: string) => void; // útil si luego conectas API
  onSelect?: (item: SearchItem) => void;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function SearchBox({
  placeholder = "Buscar…",
  items = [],
  minChars = 1,
  debounceMs = 200,
  maxResults = 8,
  onSearch,
  onSelect,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce para onSearch
  useEffect(() => {
    const t = window.setTimeout(() => onSearch?.(query.trim()), debounceMs);
    return () => window.clearTimeout(t);
  }, [query, debounceMs, onSearch]);

  // Cerrar al click afuera
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (q.length < minChars) return [];

    const filtered = items
      .filter((it) => normalize(it.label).includes(q))
      .slice(0, maxResults);

    return filtered;
  }, [items, maxResults, minChars, query]);

  const canShowDropdown = open && query.trim().length >= minChars && results.length > 0;

  const selectItem = (item: SearchItem) => {
    setQuery(item.label);
    setOpen(false);
    setActiveIndex(-1);
    onSelect?.(item);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" && results.length > 0) setOpen(true);
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= results.length ? 0 : next;
      });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? results.length - 1 : next;
      });
      return;
    }

    if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        selectItem(results[activeIndex]);
      } else {
        // Enter sin selección: “buscar”
        setOpen(false);
        setActiveIndex(-1);
        onSearch?.(query.trim());
      }
    }
  };

  const clear = () => {
    setQuery("");
    setActiveIndex(-1);
    setOpen(false);
    onSearch?.("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <div
        className={cx(
          "flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 shadow-sm",
          open ? "border-slate-300" : "border-slate-200"
        )}
      >
        {/* Icon */}
        <span className="text-slate-500" aria-hidden="true">
          🔎
        </span>

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          aria-label="Search"
          role="combobox"
          aria-expanded={open}
          aria-controls="searchbox-list"
          aria-autocomplete="list"
        />

        {query.trim().length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="rounded-xl px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
          >
            Limpiar
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setActiveIndex(-1);
            onSearch?.(query.trim());
          }}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Buscar
        </button>
      </div>

      {/* Dropdown */}
      <div
        className={cx(
          "absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border bg-white shadow-lg",
          canShowDropdown ? "block" : "hidden"
        )}
      >
        <ul id="searchbox-list" role="listbox" className="max-h-72 overflow-auto p-1">
          {results.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={item.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectItem(item)}
                  className={cx(
                    "w-full rounded-xl px-3 py-2 text-left transition",
                    isActive ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  {item.description ? (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Empty state (cuando no hay resultados) */}
      {open && query.trim().length >= minChars && results.length === 0 ? (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-lg">
          Sin resultados
        </div>
      ) : null}
    </div>
  );
}
