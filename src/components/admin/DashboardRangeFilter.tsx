import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PRESET_LABELS, type RangePreset } from '@/lib/dateRanges';
import type { DateRange } from 'react-day-picker';

interface Props {
  preset: RangePreset;
  customRange?: { start: Date; end: Date };
  onChange: (preset: RangePreset, custom?: { start: Date; end: Date }) => void;
}

const PRESETS: RangePreset[] = ['today', '7d', '30d', 'mtd', '90d', 'ytd', 'all'];

export function DashboardRangeFilter({ preset, customRange, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative inline-flex items-center bg-muted/60 rounded-lg p-0.5 overflow-x-auto max-w-full">
        {PRESETS.map((p) => {
          const active = preset === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                'relative px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors',
                active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active && (
                <motion.div
                  layoutId="range-pill"
                  className="absolute inset-0 bg-primary rounded-md shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{PRESET_LABELS[p]}</span>
            </button>
          );
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={preset === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="h-8 gap-1.5 text-xs"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {preset === 'custom' && customRange
              ? `${customRange.start.toLocaleDateString('es-ES')} – ${new Date(customRange.end.getTime() - 1).toLocaleDateString('es-ES')}`
              : 'Personalizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={tempRange}
            onSelect={setTempRange}
            numberOfMonths={2}
            className={cn('p-3 pointer-events-auto')}
          />
          <div className="flex justify-end gap-2 p-2 border-t">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              size="sm"
              disabled={!tempRange?.from || !tempRange?.to}
              onClick={() => {
                if (tempRange?.from && tempRange?.to) {
                  const end = new Date(tempRange.to);
                  end.setHours(23, 59, 59, 999);
                  const endExcl = new Date(end.getTime() + 1);
                  const start = new Date(tempRange.from);
                  start.setHours(0, 0, 0, 0);
                  onChange('custom', { start, end: endExcl });
                  setOpen(false);
                }
              }}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
