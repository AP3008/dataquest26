export interface RegionHighlightParams {
  /** Offset from brain center as fraction of bounding box half-size (null = use brain center) */
  centerOffset: [number, number, number] | null;
  /** Highlight radius as fraction of bounding box half-diagonal */
  radius: number;
  /** 'sphere' = distance from point, 'surface' = outer-surface glow (distance from center) */
  mode: 'sphere' | 'surface';
  /** Camera direction vector for snap animation (will be normalized) */
  cameraDirection: [number, number, number];
}

export const REGION_HIGHLIGHT: Record<string, RegionHighlightParams> = {
  cerebral: {
    centerOffset: [0, 0.3, 0],
    radius: 0.55,
    mode: 'sphere',
    cameraDirection: [0, 1, 2],
  },
  meninges: {
    centerOffset: null,
    radius: 0.82,
    mode: 'surface',
    cameraDirection: [2, 0.5, 1],
  },
  pituitary: {
    centerOffset: [0, -0.4, 0.1],
    radius: 0.18,
    mode: 'sphere',
    cameraDirection: [0, -1, 2],
  },
};
