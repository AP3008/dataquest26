import { useState, useCallback } from 'react';
import Header from './components/Header';
import Background3D from './components/Background3D';
import HeroSection from './components/HeroSection';
import ScanSection from './components/ScanSection';
import { useMousePosition } from './hooks/useMousePosition';
import { predict } from './api';
import type { PredictionResult, AppState } from './types';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mousePosition = useMousePosition();

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
    <div className="relative">
      <Background3D mousePosition={mousePosition} appState={appState} />
      <div className="relative z-10">
        <Header />
        <HeroSection />
        <ScanSection
          appState={appState}
          selectedFile={selectedFile}
          previewUrl={previewUrl}
          result={result}
          error={error}
          onFileSelect={handleFileSelect}
          onClearFile={handleClearFile}
          onAnalyze={handleAnalyze}
          onNewScan={handleNewScan}
        />
      </div>
    </div>
  );
}

export default App;
