import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function AnalyzingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-8"
    >
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderTopColor: 'var(--text-primary)',
            animation: 'spin-cw 1s linear infinite',
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute inset-3 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderBottomColor: 'var(--text-muted)',
            animation: 'spin-ccw 1.5s linear infinite',
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute inset-6 rounded-full border-2 border-[--border-subtle]"
          style={{
            borderTopColor: 'var(--text-primary)',
            animation: 'spin-cw 2s linear infinite',
          }}
        />
        {/* Center icon */}
        <Brain className="w-8 h-8 text-[--text-primary]" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-[--text-primary]">
          Analyzing MRI Scan
        </h2>
        <p className="mt-2 text-[--text-secondary]">
          Running neural network inference...
        </p>
      </div>
    </motion.div>
  );
}
