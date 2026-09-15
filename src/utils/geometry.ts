export interface PointPct {
  xPct: number;
  yPct: number;
}

/** Converts a pointer event position, relative to a page element, into a 0–1 fraction of that element's size. */
export function pointerToPagePct(
  clientX: number,
  clientY: number,
  pageEl: HTMLElement,
): PointPct {
  const rect = pageEl.getBoundingClientRect();
  const xPct = clamp((clientX - rect.left) / rect.width, 0, 1);
  const yPct = clamp((clientY - rect.top) / rect.height, 0, 1);
  return { xPct, yPct };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snapPct(value: number, gridPct: number): number {
  return Math.round(value / gridPct) * gridPct;
}
