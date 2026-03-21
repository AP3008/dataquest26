import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { CLASS_META } from '../classMetadata';
import ConfidenceBars from './ConfidenceBars';
import type { PredictionResult } from '../types';

interface ResultsPanelProps {
  result: PredictionResult;
  onNewScan: () => void;
}

const severityConfig = {
  high: { icon: AlertTriangle, className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { icon: Info, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  none: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function ResultsPanel({ result, onNewScan }: ResultsPanelProps) {
  const meta = CLASS_META[result.predicted_class];
  const confidence = (result.confidence * 100).toFixed(1);
  const severity = severityConfig[meta.severity];
  const SeverityIcon = severity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-4"
    >
      {/* Diagnosis card */}
      <div className="glass p-5">
        <p className="label-muted mb-2">DIAGNOSIS</p>
        <h2 className="text-2xl font-bold" style={{ color: meta.color }}>
          {meta.label}
        </h2>
        <p className="font-mono text-4xl font-bold mt-1" style={{ color: meta.color }}>
          {confidence}%
        </p>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mt-3 ${severity.className}`}
        >
          <SeverityIcon className="w-3 h-3" />
          {meta.severityLabel}
        </span>
        <p className="text-sm text-[--text-secondary] mt-3 leading-relaxed">
          {meta.description}
        </p>
      </div>

      {/* Probabilities */}
      <ConfidenceBars
        probabilities={result.probabilities}
        predictedClass={result.predicted_class}
      />

      {/* New scan button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNewScan}
        className="glass flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-[--text-secondary] hover:text-[--text-primary]"
      >
        <RotateCcw className="w-4 h-4" />
        New Scan
      </motion.button>
    </motion.div>
  );
}
