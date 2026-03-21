import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle, Info, CheckCircle, Shield } from 'lucide-react';
import { CLASS_META } from '../classMetadata';
import ConfidenceBars from './ConfidenceBars';
import BrainModel from './BrainModel';
import type { PredictionResult } from '../types';

interface ResultsPanelProps {
  result: PredictionResult;
  previewUrl: string | null;
  onNewScan: () => void;
}

const severityConfig = {
  high: { icon: AlertTriangle, className: 'bg-red-50 text-red-700 border-red-200' },
  medium: { icon: Info, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  none: { icon: CheckCircle, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export default function ResultsPanel({
  result,
  previewUrl,
  onNewScan,
}: ResultsPanelProps) {
  const meta = CLASS_META[result.predicted_class];
  const confidence = (result.confidence * 100).toFixed(1);
  const severity = severityConfig[meta.severity];
  const SeverityIcon = severity.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: meta.color }}
          >
            {meta.label}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${severity.className}`}
          >
            <SeverityIcon className="w-3.5 h-3.5" />
            {meta.severityLabel}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewScan}
          className="glass flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[--text-secondary] hover:text-[--text-primary]"
        >
          <RotateCcw className="w-4 h-4" />
          New Scan
        </motion.button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-6">
        {/* Left column — scan data */}
        <div className="flex flex-col gap-4">
          {/* Uploaded MRI image card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-4"
          >
            <p className="label-muted mb-3">UPLOADED SCAN</p>
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Uploaded MRI"
                className="w-full rounded-lg object-contain bg-[--bg-secondary]"
                style={{ maxHeight: 220 }}
              />
            )}
          </motion.div>

          {/* Diagnosis card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-5"
          >
            <p className="label-muted mb-2">DIAGNOSIS</p>
            <h2 className="text-2xl font-bold text-[--text-primary]">
              {meta.label}
            </h2>
            <p
              className="font-mono text-3xl font-bold mt-1"
              style={{ color: meta.color }}
            >
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
          </motion.div>

          {/* Probabilities card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ConfidenceBars
              probabilities={result.probabilities}
              predictedClass={result.predicted_class}
            />
          </motion.div>
        </div>

        {/* Right column — 3D brain */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-4 flex flex-col"
        >
          <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden">
            <BrainModel
              predictedClass={result.predicted_class}
              highlightColor={meta.color}
              brainRegion={meta.brainRegion}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 px-2">
            {meta.brainRegion ? (
              <>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-xs text-[--text-secondary]">
                  Highlighting: {meta.brainRegion} — typical {meta.label.toLowerCase().replace(' tumor', '')} location
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-[--text-secondary]">
                  No regions highlighted — scan appears healthy
                </span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Medical disclaimer */}
      <div className="mt-8 glass px-5 py-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-[--text-muted] mt-0.5 shrink-0" />
        <p className="text-xs text-[--text-muted] leading-relaxed">
          This is an educational tool built for DataQuest'26. Not intended for
          clinical diagnosis. Always consult a medical professional.
        </p>
      </div>
    </motion.div>
  );
}
