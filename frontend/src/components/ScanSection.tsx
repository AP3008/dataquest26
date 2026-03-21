import { AnimatePresence } from 'framer-motion';
import { CLASS_META } from '../classMetadata';
import UploadZone from './UploadZone';
import AnalyzingState from './AnalyzingState';
import ResultsPanel from './ResultsPanel';
import BrainModel from './BrainModel';
import type { PredictionResult, AppState } from '../types';

interface ScanSectionProps {
  appState: AppState;
  selectedFile: File | null;
  previewUrl: string | null;
  result: PredictionResult | null;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onAnalyze: () => void;
  onNewScan: () => void;
}

export default function ScanSection({
  appState,
  selectedFile,
  previewUrl,
  result,
  error,
  onFileSelect,
  onClearFile,
  onAnalyze,
  onNewScan,
}: ScanSectionProps) {
  const meta = result ? CLASS_META[result.predicted_class] : null;

  return (
    <section id="scan" className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-[--text-primary] tracking-tight">
          Upload MRI Scan
        </h2>
        <p className="mt-3 text-[--text-secondary]">
          Drop a brain MRI image for instant classification and 3D region mapping.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left column: upload / analyzing / results */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {appState === 'upload' && (
              <UploadZone
                key="upload"
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                error={error}
                onFileSelect={onFileSelect}
                onClearFile={onClearFile}
                onAnalyze={onAnalyze}
              />
            )}
            {appState === 'analyzing' && (
              <AnalyzingState key="analyzing" />
            )}
            {appState === 'results' && result && (
              <ResultsPanel
                key="results"
                result={result}
                onNewScan={onNewScan}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right column: 3D brain (always visible) */}
        <div className="glass p-4 flex flex-col order-first lg:order-last">
          <div className="h-[500px] rounded-lg overflow-hidden">
            <BrainModel
              predictedClass={result?.predicted_class ?? ''}
              highlightColor={meta?.color ?? '#6b6b6b'}
              brainRegion={meta?.brainRegion ?? null}
            />
          </div>
          <div className="mt-3 flex items-center gap-2 px-2">
            {meta?.brainRegion ? (
              <>
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="text-xs text-[--text-secondary]">
                  Highlighting: {meta.brainRegion} — typical{' '}
                  {meta.label.toLowerCase().replace(' tumor', '')} location
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[--text-muted]" />
                <span className="text-xs text-[--text-muted]">
                  {result
                    ? 'No regions highlighted — scan appears healthy'
                    : 'Upload a scan to begin analysis'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
