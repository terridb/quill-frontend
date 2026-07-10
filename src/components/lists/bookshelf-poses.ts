export interface ShelfPose {
  rotate: number;
  scale: number;
  y: number;
}

export const SHELF_POSES: ShelfPose[] = [
  { rotate: -5, scale: 0.92, y: 4 },
  { rotate: 2, scale: 1, y: 0 },
  { rotate: -2, scale: 0.96, y: 2 },
  { rotate: 4, scale: 1.04, y: -2 },
  { rotate: -3, scale: 0.98, y: 1 },
  { rotate: 1, scale: 0.94, y: 3 },
];

export const SHELF_DISPLAY_LIMIT = 5;
