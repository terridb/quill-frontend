const SHELF_GAP_SM_PX = 8;
const SHELF_GAP_MD_PX = 10;
const SHELF_GAP_LG_PX = 14;

const SHELF_SPINE_SM_PX = 56;
const SHELF_SPINE_MD_PX = 68;
const SHELF_SPINE_LG_PX = 80;

export interface ShelfLayout {
  visibleCount: number;
  spineWidth: number;
  gap: number;
  overflowCount: number;
  minHeight: number;
}

export function shelfGapForWidth(containerWidth: number): number {
  if (containerWidth >= 768) {
    return SHELF_GAP_LG_PX;
  }

  if (containerWidth >= 640) {
    return SHELF_GAP_MD_PX;
  }

  return SHELF_GAP_SM_PX;
}

export function spineWidthForContainer(containerWidth: number): number {
  if (containerWidth >= 768) {
    return SHELF_SPINE_LG_PX;
  }

  if (containerWidth >= 640) {
    return SHELF_SPINE_MD_PX;
  }

  return SHELF_SPINE_SM_PX;
}

function shelfSlotCount(containerWidth: number, spineWidth: number, gap: number): number {
  return Math.max(1, Math.floor((containerWidth + gap) / (spineWidth + gap)));
}

export function calculateShelfLayout(
  containerWidth: number,
  bookCount: number,
): ShelfLayout {
  if (bookCount <= 0 || containerWidth <= 0) {
    return {
      visibleCount: 0,
      spineWidth: SHELF_SPINE_SM_PX,
      gap: SHELF_GAP_SM_PX,
      overflowCount: 0,
      minHeight: 0,
    };
  }

  const gap = shelfGapForWidth(containerWidth);
  const spineWidth = spineWidthForContainer(containerWidth);
  const maxSlots = shelfSlotCount(containerWidth, spineWidth, gap);

  if (bookCount <= maxSlots) {
    return {
      visibleCount: bookCount,
      spineWidth,
      gap,
      overflowCount: 0,
      minHeight: spineWidth * 1.5,
    };
  }

  const visibleCount = maxSlots - 1;

  return {
    visibleCount,
    spineWidth,
    gap,
    overflowCount: bookCount - visibleCount,
    minHeight: spineWidth * 1.5,
  };
}
