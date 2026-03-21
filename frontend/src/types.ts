export interface PredictionResult {
  predicted_class: 'glioma' | 'meningioma' | 'pituitary' | 'notumor';
  confidence: number;
  probabilities: Record<string, number>;
}

export type AppState = 'upload' | 'analyzing' | 'results';
