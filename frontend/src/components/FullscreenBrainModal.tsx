import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import BrainModel from './BrainModel';

interface FullscreenBrainModalProps {
  predictedClass: string;
  highlightColor: string;
  brainRegion: string | null;
  statusText: string;
  statusColor: string | null;
  onClose: () => void;
}

export default function FullscreenBrainModal({
  predictedClass,
  highlightColor,
  brainRegion,
  statusText,
  statusColor,
  onClose,
}: FullscreenBrainModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 10, 0.95)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        title="Close"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 51,
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 14,
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Brain model fills the space */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <BrainModel
          predictedClass={predictedClass}
          highlightColor={highlightColor}
          brainRegion={brainRegion}
        />
      </div>

      {/* Status bar at bottom */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColor ?? '#8a8a8a',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {statusText}
        </span>
      </div>
    </div>,
    document.body,
  );
}
