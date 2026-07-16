export interface ShelfPose {
  rotate: number;
  scale: number;
  y: number;
}

/** Upright, uniform spines — variation comes from covers and the ledge, not tilt. */
export const SHELF_POSE_DEFAULT: ShelfPose = {
  rotate: 0,
  scale: 1,
  y: 0,
};

export const SHELF_POSES: ShelfPose[] = Array.from(
  { length: 20 },
  () => SHELF_POSE_DEFAULT,
);

export function shelfSpineStyle(pose: ShelfPose = SHELF_POSE_DEFAULT) {
  const hasTransform =
    pose.rotate !== 0 || pose.scale !== 1 || pose.y !== 0;

  if (!hasTransform) {
    return { transformOrigin: "bottom center" } as const;
  }

  return {
    transform: `rotate(${pose.rotate}deg) scale(${pose.scale}) translateY(${pose.y}px)`,
    transformOrigin: "bottom center",
  } as const;
}
