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
const HEIGHT = 300;
// Recuadro de Canarias (esquina inferior izquierda)
const CANARY_BOX = { x: 8, y: HEIGHT - 78, w: 150, h: 70 };
const CANARY_PROVINCES = new Set(['las palmas', 'santa cruz de tenerife']);

export function SpainProvinceMap({ stats }: { stats: ProvinceStat[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const max = useMemo(
    () => Math.max(1, ...stats.map(s => Number(s.total_recipes))),
    [stats]
  );

  const { peninsulaFeatures, canaryFeatures, peninsulaPath, canaryPath } = useMemo(() => {
    const fc = geoData as any;
    const allFeatures = fc.features as any[];
    const peninsula: any[] = [];
    const canary: any[] = [];
    for (const f of allFeatures) {
      const n = normalize(f.properties.name as string);
      (CANARY_PROVINCES.has(n) ? canary : peninsula).push(f);
    }

    const peninsulaFC = { type: 'FeatureCollection', features: peninsula };
    const canaryFC = { type: 'FeatureCollection', features: canary };

    const pProj = geoMercator().fitSize([WIDTH, HEIGHT], peninsulaFC as any);
    const cProj = geoMercator().fitExtent(
      [[CANARY_BOX.x + 3, CANARY_BOX.y + 12], [CANARY_BOX.x + CANARY_BOX.w - 3, CANARY_BOX.y + CANARY_BOX.h - 3]],
      canaryFC as any
    );

    return {
      peninsulaFeatures: peninsula,
      canaryFeatures: canary,
      peninsulaPath: geoPath(pProj),
      canaryPath: geoPath(cProj),
    };
  }, []);

  const colorFor = (recipes: number) => {
    if (recipes === 0) return 'hsl(var(--muted))';
    const intensity = Math.min(recipes / max, 1);
    const opacity = 0.2 + intensity * 0.8;
    return `hsl(0 72% 51% / ${opacity})`;
  };

  const renderPath = (f: any, pathFn: any, key: string) => {
    const d = pathFn(f);
    if (!d) return null;
    const name = f.properties.name as string;
    const stat = matchProvince(name, stats);
    const recipes = stat ? Number(stat.total_recipes) : 0;
    const pros = stat ? Number(stat.professionals) : 0;
    return (
      <path
        key={key}
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
  };

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {peninsulaFeatures.map((f, i) => renderPath(f, peninsulaPath, `p-${i}`))}

        {/* Recuadro Canarias */}
        <rect
          x={CANARY_BOX.x}
          y={CANARY_BOX.y}
          width={CANARY_BOX.w}
          height={CANARY_BOX.h}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={0.6}
          strokeDasharray="2 2"
          rx={4}
        />
        <text
          x={CANARY_BOX.x + 5}
          y={CANARY_BOX.y + 9}
          fontSize={7}
          className="fill-muted-foreground"
        >
          Canarias
        </text>
        {canaryFeatures.map((f, i) => renderPath(f, canaryPath, `c-${i}`))}
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
