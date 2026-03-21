import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Background3D from './components/Background3D';
import UploadZone from './components/UploadZone';
import AnalyzingState from './components/AnalyzingState';
import ResultsPanel from './components/ResultsPanel';
import { predict } from './api';
import type { PredictionResult, AppState } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appState: AppState = isAnalyzing
    ? 'analyzing'
    : result
      ? 'results'
      : 'upload';

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const data = await predict(selectedFile);
      setResult(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Analysis failed. Is the backend running?');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedFile]);

  const handleNewScan = useCallback(() => {
    setResult(null);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  return (
    <div className="relative min-h-screen">
      <Background3D appState={appState} />
      <div className="relative z-10">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          <AnimatePresence mode="wait">
            {appState === 'upload' && (
              <UploadZone
                key="upload"
                selectedFile={selectedFile}
                previewUrl={previewUrl}
                error={error}
                onFileSelect={handleFileSelect}
                onClearFile={handleClearFile}
                onAnalyze={handleAnalyze}
              />
            )}
            {appState === 'analyzing' && (
              <AnalyzingState key="analyzing" />
            )}
            {appState === 'results' && result && (
              <ResultsPanel
                key="results"
                result={result}
                previewUrl={previewUrl}
                onNewScan={handleNewScan}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
