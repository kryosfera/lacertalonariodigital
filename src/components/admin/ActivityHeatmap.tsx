import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface HeatmapData {
  weekday: number; // 1=Mon..7=Sun
  hour: number;    // 0..23
  total: number;
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function ActivityHeatmap({ data }: { data: HeatmapData[] }) {
  const { grid, max } = useMemo(() => {
    const g: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    let m = 0;
    data.forEach(d => {
      const wd = (d.weekday - 1) % 7;
      g[wd][d.hour] = Number(d.total);
      if (Number(d.total) > m) m = Number(d.total);
    });
    return { grid: g, max: m };
  }, [data]);

  const colorFor = (v: number) => {
    if (v === 0) return 'hsl(var(--muted))';
    const intensity = Math.min(v / max, 1);
    // from light to Lacer red
    const opacity = 0.15 + intensity * 0.85;
    return `hsl(0 72% 51% / ${opacity})`;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-px overflow-x-auto pb-1">
        <div className="flex flex-col gap-px shrink-0 pr-1.5">
          <div className="h-3" />
          {DAYS.map(d => (
            <div key={d} className="h-3 text-[9px] text-muted-foreground leading-3 flex items-center">
              {d}
            </div>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {/* hour labels */}
          <div className="flex gap-px mb-px">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-[8px] text-muted-foreground text-center leading-3">
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {/* grid */}
          {grid.map((row, di) => (
            <div key={di} className="flex gap-px mb-px">
              {row.map((v, hi) => (
                <motion.div
                  key={hi}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: (di * 24 + hi) * 0.0015 }}
                  className="flex-1 h-3 rounded-[2px] cursor-pointer hover:ring-1 hover:ring-primary transition-all"
                  style={{ backgroundColor: colorFor(v) }}
                  title={`${DAYS[di]} ${hi}:00 → ${v} recetas`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-px">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(o => (
            <div
              key={o}
              className="w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: o === 0 ? 'hsl(var(--muted))' : `hsl(0 72% 51% / ${0.15 + o * 0.85})` }}
            />
          ))}
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}
