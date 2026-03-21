import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function AnalyzingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass p-8 flex flex-col items-center justify-center gap-6"
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderTopColor: 'var(--text-primary)',
            animation: 'spin-cw 1s linear infinite',
          }}
        />
        <div
          className="absolute inset-2.5 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderBottomColor: 'var(--text-muted)',
            animation: 'spin-ccw 1.5s linear infinite',
          }}
        />
        <div
          className="absolute inset-5 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderTopColor: 'var(--text-primary)',
            animation: 'spin-cw 2s linear infinite',
          }}
        />
        <Brain className="w-6 h-6 text-[--text-primary]" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-[--text-primary]">
          Analyzing MRI Scan
        </h3>
        <p className="mt-1 text-sm text-[--text-secondary]">
          Running neural network inference...
        </p>
      </div>
    </motion.div>
  );
}
