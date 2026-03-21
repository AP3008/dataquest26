import { useRef, useState, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, X, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  selectedFile: File | null;
  previewUrl: string | null;
  error: string | null;
  onFileSelect: (file: File) => void;
  onClearFile: () => void;
  onAnalyze: () => void;
}

export default function UploadZone({
  selectedFile,
  previewUrl,
  error,
  onFileSelect,
  onClearFile,
  onAnalyze,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col gap-5"
    >
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div
        onClick={() => !selectedFile && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          glass w-full aspect-[4/3] flex flex-col items-center justify-center
          cursor-pointer transition-all relative overflow-hidden
          ${isDragging ? 'border-[--text-primary] scale-[1.02] shadow-lg' : ''}
          ${selectedFile ? 'cursor-default' : ''}
          ${!selectedFile ? 'border-dashed border-2' : ''}
        `}
        style={
          !selectedFile
            ? { animation: 'border-pulse 3s ease-in-out infinite' }
            : undefined
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {selectedFile && previewUrl ? (
          <div className="w-full h-full relative">
            <img
              src={previewUrl}
              alt="MRI preview"
              className="w-full h-full object-contain p-4"
            />
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white/80 backdrop-blur-sm flex items-center justify-between border-t border-[--border-subtle]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-[--text-secondary] truncate max-w-[200px]">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFile();
                }}
                className="text-[--text-muted] hover:text-[--text-primary] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[--bg-secondary] flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-[--text-muted]" />
            </div>
            <div className="text-center">
              <p className="text-[--text-primary] font-medium">
                Drag & drop your MRI image
              </p>
              <p className="text-sm text-[--text-muted] mt-1">
                or click to browse &middot; JPG, PNG
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAnalyze}
          className="flex items-center justify-center gap-2 w-full px-8 py-3.5 rounded-xl bg-[--text-primary] text-white font-medium shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-shadow"
        >
          <Upload className="w-4 h-4" />
          Analyze Scan
        </motion.button>
      )}
    </motion.div>
  );
}
