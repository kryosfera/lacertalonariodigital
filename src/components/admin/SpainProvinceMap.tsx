import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geoData from '@/data/spain-provinces.json';

interface ProvinceStat {
  province: string;
  professionals: number;
  total_recipes: number;
}

// Normalize: lowercase + strip accents, handle common aliases
const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(a |la |las |el |los |illes |islas )/, '')
    .trim();

const ALIASES: Record<string, string[]> = {
  'a coruna': ['coruna', 'la coruna', 'coruna a'],
  'illes balears': ['baleares', 'islas baleares', 'balears'],
  'las palmas': ['palmas', 'palmas las'],
  'santa cruz de tenerife': ['tenerife', 'santa cruz tenerife'],
  'bizkaia': ['vizcaya'],
  'gipuzkoa': ['guipuzcoa'],
  'araba/alava': ['alava', 'araba'],
  'ourense': ['orense'],
  'lleida': ['lerida'],
  'girona': ['gerona'],
  'castello/castellon': ['castellon', 'castello'],
  'valencia/valencia': ['valencia'],
  'alicante/alacant': ['alicante', 'alacant'],
};

function matchProvince(geoName: string, stats: ProvinceStat[]): ProvinceStat | undefined {
  const target = normalize(geoName);
  const direct = stats.find(s => normalize(s.province) === target);
  if (direct) return direct;
  // Try aliases
  for (const [canon, aliases] of Object.entries(ALIASES)) {
    if (normalize(canon) === target || aliases.some(a => normalize(a) === target)) {
      const found = stats.find(s => {
        const sn = normalize(s.province);
        return sn === normalize(canon) || aliases.some(a => normalize(a) === sn);
      });
      if (found) return found;
    }
  }
  // Partial includes
  return stats.find(s => normalize(s.province).includes(target) || target.includes(normalize(s.province)));
}

export function SpainProvinceMap({ stats }: { stats: ProvinceStat[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const max = useMemo(
    () => Math.max(1, ...stats.map(s => Number(s.total_recipes))),
    [stats]
  );

  const colorFor = (recipes: number) => {
    if (recipes === 0) return 'hsl(var(--muted))';
    const intensity = Math.min(recipes / max, 1);
    const opacity = 0.2 + intensity * 0.8;
    return `hsl(0 72% 51% / ${opacity})`;
  };

  return (
    <div className="relative w-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ center: [-3.7, 40.2], scale: 1700 }}
        width={500}
        height={380}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={geoData as any}>
          {({ geographies }: any) =>
            geographies.map((geo: any) => {
              const name = geo.properties.name;
              const stat = matchProvince(name, stats);
              const recipes = stat ? Number(stat.total_recipes) : 0;
              const pros = stat ? Number(stat.professionals) : 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={colorFor(recipes)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.4}
                  onMouseEnter={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement?.parentElement as HTMLElement)?.getBoundingClientRect();
                    setTooltip({
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                      content: `${name} — ${recipes} recetas · ${pros} prof.`,
                    });
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.currentTarget.ownerSVGElement?.parentElement as HTMLElement)?.getBoundingClientRect();
                    setTooltip(t => t ? { ...t, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) } : null);
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    default: { outline: 'none', transition: 'fill 0.2s' },
                    hover: { fill: 'hsl(0 72% 45%)', outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs shadow-md border whitespace-nowrap"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <span>0</span>
        <div className="h-2 w-32 rounded-full" style={{ background: 'linear-gradient(to right, hsl(0 72% 51% / 0.2), hsl(0 72% 51% / 1))' }} />
        <span>{max} recetas</span>
      </div>
    </div>
  );
}
