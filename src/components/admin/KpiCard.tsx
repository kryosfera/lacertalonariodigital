import { motion } from 'framer-motion';
import { LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { AnimatedCounter } from './AnimatedCounter';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  numericValue?: number;
  suffix?: string;
  delay?: number;
  variation?: number | null; // % change vs previous period
  sparkline?: { value: number }[];
}

export function KpiCard({ icon: Icon, label, value, numericValue, suffix = '', delay = 0, variation = null, sparkline }: KpiCardProps) {
  const isAnimatable = typeof numericValue === 'number';
  const variationColor =
    variation == null ? 'text-muted-foreground' :
    variation > 0 ? 'text-emerald-600 dark:text-emerald-400' :
    variation < 0 ? 'text-red-600 dark:text-red-400' :
    'text-muted-foreground';

  const VarIcon = variation == null ? Minus : variation > 0 ? ArrowUp : variation < 0 ? ArrowDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
    >
      <Card className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default">
        <CardContent className="p-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md btn-gradient-red shrink-0">
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium truncate">{label}</p>
              <p className="text-xl font-bold text-foreground leading-tight tabular-nums">
                {isAnimatable ? <AnimatedCounter value={numericValue!} suffix={suffix} /> : value}
              </p>
              {variation != null && (
                <div className={`flex items-center gap-0.5 text-[10px] font-medium ${variationColor}`}>
                  <VarIcon className="h-2.5 w-2.5" />
                  <span>{Math.abs(variation)}% vs mes ant.</span>
                </div>
              )}
            </div>
          </div>
          {sparkline && sparkline.length > 1 && (
            <div className="h-8 -mx-1 -mb-1 mt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkline}>
                  <defs>
                    <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(0, 72%, 51%)"
                    strokeWidth={1.5}
                    fill={`url(#spark-${label})`}
                    isAnimationActive
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
