export interface ClassMeta {
  label: string;
  description: string;
  color: string;
  severity: 'high' | 'medium' | 'none';
  severityLabel: string;
  brainRegion: string | null;
}

export const CLASS_META: Record<string, ClassMeta> = {
  glioma: {
    label: 'Glioma Tumor',
    description:
      'A tumor originating in the glial cells of the brain. Gliomas can occur in various parts of the brain and spinal cord, and are graded by aggressiveness.',
    color: '#e11d48',
    severity: 'high',
    severityLabel: 'High Severity',
    brainRegion: 'cerebral',
  },
  meningioma: {
    label: 'Meningioma Tumor',
    description:
      'A tumor that forms on the membranes (meninges) that cover the brain and spinal cord. Most meningiomas are slow-growing and benign.',
    color: '#fbbf24',
    severity: 'medium',
    severityLabel: 'Medium Severity',
    brainRegion: 'meninges',
  },
  pituitary: {
    label: 'Pituitary Tumor',
    description:
      'A tumor that develops in the pituitary gland at the base of the brain. The pituitary gland controls critical hormones throughout the body.',
    color: '#7c3aed',
    severity: 'medium',
    severityLabel: 'Medium Severity',
    brainRegion: 'pituitary',
  },
  notumor: {
    label: 'No Tumor Detected',
    description:
      'The MRI scan appears normal with no detectable tumor formations. The brain structure shows no abnormalities within the model\'s detection capability.',
    color: '#059669',
    severity: 'none',
    severityLabel: 'Healthy',
    brainRegion: null,
  },
};
