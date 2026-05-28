import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import indicadores from "./glosario.json";

const CATEGORY_STYLES = {
  "Valuación": {
    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    dot: "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]",
    text: "text-blue-400"
  },
  "Rentabilidad": {
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    text: "text-emerald-400"
  },
  "Deuda": {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    text: "text-amber-400"
  },
  "Liquidez": {
    badge: "bg-pink-500/10 text-pink-400 border border-pink-500/20",
    dot: "bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.6)]",
    text: "text-pink-400"
  },
  "Mercado": {
    badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    dot: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]",
    text: "text-purple-400"
  },
  "Crecimiento": {
    badge: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    dot: "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]",
    text: "text-teal-400"
  },
};

const ALL_CATEGORIES = ["Todos", ...Object.keys(CATEGORY_STYLES)];

export default function GlosarioPage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("Todos");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return indicadores.filter((item) => {
      const matchCat = active === "Todos" || item.category === active;
      const matchText = !q ||
        item.name.toLowerCase().includes(q) ||
        item.full.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q);
      return matchCat && matchText;
    });
  }, [query, active]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8 bg-[#0E1015] min-h-screen text-[#E6EBF0]">

      {/* Header */}
      <div className="relative mb-4 overflow-hidden rounded-[24px] border border-[#23282F] bg-[#15181E] p-6 sm:p-8 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        {/* Subtle decorative radial gradient inside header */}
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#25B161]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25B161]/15 text-[#25B161]">
              <Icon icon="lucide:book-open" className="text-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E6EBF0]">
              Glosario de Indicadores Financieros
            </h1>
          </div>
          <p className="max-w-3xl text-sm sm:text-base text-[#75808F] leading-relaxed">
            Explora las definiciones, fórmulas de cálculo e interpretaciones clave de las métricas financieras más utilizadas en el análisis de acciones.
          </p>
        </div>
      </div>

      {/* Barra de búsqueda y Filtros */}
      <div className="flex flex-col gap-6 rounded-[24px] border border-[#23282F] bg-[#15181E] p-5 sm:p-6 shadow-[0_18px_40px_rgba(0,0,0,0.15)]">

        {/* Input de búsqueda */}
        <div className="relative max-w-md w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#75808F]">
            <Icon icon="lucide:search" className="text-lg" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, sigla o definición..."
            className="w-full rounded-xl border border-[#23282F] bg-[#0E1015] pl-11 pr-10 py-3 text-sm text-[#E6EBF0] placeholder-[#75808F] transition-all duration-200 hover:border-[#3A4350] focus:border-[#25B161] focus:ring-2 focus:ring-[#25B161]/10 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#75808F] hover:text-[#E6EBF0] transition-colors cursor-pointer"
            >
              <Icon icon="lucide:x" className="text-base" />
            </button>
          )}
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#75808F]">
            Filtrar por categoría
          </span>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = active === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${isSelected
                      ? "bg-[#25B161] text-white shadow-[0_4px_12px_rgba(37,177,97,0.25)] scale-[1.02]"
                      : "bg-[#0E1015] border border-[#23282F] text-[#8EA2BF] hover:bg-[#22272F] hover:text-[#E6EBF0] hover:border-[#3A4350]"
                    }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenido */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#23282F] bg-[#15181E] py-20 px-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.15)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 mb-4">
            <Icon icon="lucide:search-code" className="text-3xl" />
          </div>
          <h3 className="text-lg font-semibold text-[#E6EBF0] mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-[#75808F] max-w-sm mb-6">
            No encontramos ningún indicador financiero que coincida con &quot;{query}&quot;. Intenta buscar con términos diferentes o cambia de categoría.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setActive("Todos");
            }}
            className="rounded-xl bg-[#22272F] hover:bg-[#272C35] border border-[#23282F] px-4 py-2 text-xs font-medium text-[#E6EBF0] transition-colors cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="space-y-4">
              {/* Título de categoría */}
              <div className="flex items-center gap-2 border-b border-[#23282F] pb-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${CATEGORY_STYLES[category]?.dot ?? "bg-gray-400"}`}
                />
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#8EA2BF]">
                  {category}
                </h2>
                <span className="text-xs text-[#75808F] ml-auto">
                  {items.length} {items.length === 1 ? 'indicador' : 'indicadores'}
                </span>
              </div>

              {/* Grid de tarjetas */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <IndicatorCard key={item.name} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function IndicatorCard({ item }) {
  const styles = CATEGORY_STYLES[item.category] ?? {
    badge: "bg-gray-800 text-gray-400 border border-gray-700",
    dot: "bg-gray-500",
    text: "text-gray-400"
  };

  return (
    <article className="group relative rounded-[20px] border border-[#23282F] bg-[#15181E] p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.01] hover:border-[#25B161]/35 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">

      {/* Glow on hover */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px] pointer-events-none" />

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-[#E6EBF0] tracking-tight group-hover:text-[#25B161] transition-colors duration-200">
            {item.name}
          </h3>
          <p className="text-xs font-medium text-[#75808F]">
            {item.full}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {item.category}
        </span>
      </div>

      {/* Definición */}
      <p className="text-sm text-[#8EA2BF] leading-relaxed flex-grow">
        {item.definition}
      </p>

      {/* Fórmula */}
      <div className="rounded-xl bg-[#0E1015] border border-[#23282F] px-4 py-3 flex flex-col gap-1 transition-colors duration-300 group-hover:border-[#25B161]/15">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#75808F] flex items-center gap-1">
          <Icon icon="mdi:function-variant" className="text-xs text-[#25B161]" />
          Fórmula de cálculo
        </span>
        <p className="font-mono text-xs text-[#E6EBF0] overflow-x-auto whitespace-pre-wrap break-all leading-normal">
          {item.formula}
        </p>
      </div>

      {/* Interpretación */}
      <div className="border-t border-[#23282F] pt-4 flex gap-2.5 items-start">
        <div className="mt-0.5 shrink-0 text-[#25B161]">
          <Icon icon="lucide:info" className="text-base" />
        </div>
        <p className="text-xs text-[#75808F] leading-relaxed">
          <span className="font-semibold text-[#8EA2BF]">Interpretación: </span>
          {item.interpretation}
        </p>
      </div>

    </article>
  );
}
