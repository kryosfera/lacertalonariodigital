import { useMemo, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import geoData from '@/data/spain-provinces.json';

interface ProvinceStat {
  province: string;
  professionals: number;
  total_recipes: number;
}

const normalize = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(a |la |las |el |los |illes |islas )/, '')
    .trim();

const ALIASES: Record<string, string[]> = {
  'a coruna': ['coruna', 'la coruna'],
  'illes balears': ['baleares', 'islas baleares', 'balears'],
  'las palmas': ['palmas'],
  'santa cruz de tenerife': ['tenerife'],
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
  for (const [canon, aliases] of Object.entries(ALIASES)) {
    if (normalize(canon) === target || aliases.some(a => normalize(a) === target)) {
      const found = stats.find(s => {
        const sn = normalize(s.province);
        return sn === normalize(canon) || aliases.some(a => normalize(a) === sn);
      });
      if (found) return found;
    }
  }
  return stats.find(s => normalize(s.province).includes(target) || target.includes(normalize(s.province)));
}

const WIDTH = 500;
const HEIGHT = 380;

export function SpainProvinceMap({ stats }: { stats: ProvinceStat[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const max = useMemo(
    () => Math.max(1, ...stats.map(s => Number(s.total_recipes))),
    [stats]
  );

  const { features, pathFn } = useMemo(() => {
    const fc = geoData as any;
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], fc);
    const path = geoPath(projection);
    return { features: fc.features as any[], pathFn: path };
  }, []);

  const colorFor = (recipes: number) => {
    if (recipes === 0) return 'hsl(var(--muted))';
    const intensity = Math.min(recipes / max, 1);
    const opacity = 0.2 + intensity * 0.8;
    return `hsl(0 72% 51% / ${opacity})`;
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {features.map((f, i) => {
          const d = pathFn(f);
          if (!d) return null;
          const name = f.properties.name as string;
          const stat = matchProvince(name, stats);
          const recipes = stat ? Number(stat.total_recipes) : 0;
          const pros = stat ? Number(stat.professionals) : 0;
          return (
            <path
              key={i}
              d={d}
              fill={colorFor(recipes)}
              stroke="hsl(var(--border))"
              strokeWidth={0.4}
              className="transition-colors hover:fill-[hsl(0_72%_45%)] cursor-pointer"
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
            />
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs shadow-md border whitespace-nowrap"
          style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
        >
          {tooltip.content}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-2 text-[10px] text-muted-foreground">
        <span>0</span>
        <div
          className="h-2 w-32 rounded-full"
          style={{ background: 'linear-gradient(to right, hsl(0 72% 51% / 0.2), hsl(0 72% 51% / 1))' }}
        />
        <span>{max} recetas</span>
      </div>
    </div>
  );
}
