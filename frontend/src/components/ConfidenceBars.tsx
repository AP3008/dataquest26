import { motion } from 'framer-motion';
import { CLASS_META } from '../classMetadata';

interface ConfidenceBarsProps {
  probabilities: Record<string, number>;
  predictedClass: string;
}

export default function ConfidenceBars({
  probabilities,
  predictedClass,
}: ConfidenceBarsProps) {
  const sorted = Object.entries(probabilities).sort(([, a], [, b]) => b - a);

  return (
    <div className="glass p-5">
      <p className="label-muted mb-4">CLASS PROBABILITIES</p>
      <div className="flex flex-col gap-3">
        {sorted.map(([cls, prob], i) => {
          const meta = CLASS_META[cls];
          if (!meta) return null;
          const pct = prob * 100;
          const isPredicted = cls === predictedClass;

          return (
            <div key={cls} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span
                    className={`text-sm ${isPredicted ? 'font-semibold text-[--text-primary]' : 'text-[--text-secondary]'}`}
                  >
                    {meta.label}
                  </span>
                </div>
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: meta.color }}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[--bg-secondary] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i * 0.1,
                  }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: meta.color,
                    boxShadow:
                      pct > 50
                        ? `0 0 12px ${meta.color}40`
                        : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
