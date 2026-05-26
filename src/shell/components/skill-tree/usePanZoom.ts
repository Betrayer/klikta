import { useCallback, useEffect, useRef, useState } from "react";

export interface PanZoomTransform {
  scale: number;
  tx: number;
  ty: number;
}

export interface PanZoomController {
  transform: PanZoomTransform;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  wasDragging: () => boolean;
  reset: () => void;
  zoomBy: (factor: number) => void;
}

const MIN_SCALE = 0.2;
const MAX_SCALE = 2.6;
const FIT_PADDING = 0.94;
const DRAG_THRESHOLD = 4;

const clampScale = (scale: number): number =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

const distance = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): number => Math.hypot(a.x - b.x, a.y - b.y);

const midpoint = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number } => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const usePanZoom = (contentSize: number): PanZoomController => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<PanZoomTransform>({
    scale: 1,
    tx: 0,
    ty: 0,
  });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(
    null,
  );
  const moved = useRef(false);
  const didFit = useRef(false);

  const fitToContainer = useCallback(() => {
    const el = containerRef.current;
    if (el === null || el.clientWidth === 0 || el.clientHeight === 0) return;
    const scale = clampScale(
      (Math.min(el.clientWidth, el.clientHeight) / contentSize) * FIT_PADDING,
    );
    setTransform({
      scale,
      tx: (el.clientWidth - contentSize * scale) / 2,
      ty: (el.clientHeight - contentSize * scale) / 2,
    });
  }, [contentSize]);

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;
    const observer = new ResizeObserver(() => {
      if (!didFit.current && el.clientWidth > 0) {
        fitToContainer();
        didFit.current = true;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToContainer]);

  const zoomAtPoint = useCallback(
    (px: number, py: number, factor: number) => {
      setTransform((current) => {
        const next = clampScale(current.scale * factor);
        const ratio = next / current.scale;
        return {
          scale: next,
          tx: px - (px - current.tx) * ratio,
          ty: py - (py - current.ty) * ratio,
        };
      });
    },
    [],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (el === null) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAtPoint(
        event.clientX - rect.left,
        event.clientY - rect.top,
        Math.exp(-event.deltaY * 0.0015),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAtPoint]);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    moved.current = false;
    if (pointers.current.size === 2) {
      const points = [...pointers.current.values()];
      if (points[0] !== undefined && points[1] !== undefined) {
        pinch.current = {
          dist: distance(points[0], points[1]),
          mid: midpoint(points[0], points[1]),
        };
      }
    }
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    const previous = pointers.current.get(event.pointerId);
    if (previous === undefined) return;
    const current = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, current);

    if (pointers.current.size >= 2 && pinch.current !== null) {
      const points = [...pointers.current.values()];
      if (points[0] === undefined || points[1] === undefined) return;
      const el = containerRef.current;
      if (el === null) return;
      const rect = el.getBoundingClientRect();
      const newDist = distance(points[0], points[1]);
      const newMid = midpoint(points[0], points[1]);
      const startDist = pinch.current.dist;
      const startMid = pinch.current.mid;
      const mx = newMid.x - rect.left;
      const my = newMid.y - rect.top;
      setTransform((t) => {
        const next = clampScale(t.scale * (newDist / startDist));
        const ratio = next / t.scale;
        return {
          scale: next,
          tx: mx - (mx - t.tx) * ratio + (newMid.x - startMid.x),
          ty: my - (my - t.ty) * ratio + (newMid.y - startMid.y),
        };
      });
      pinch.current = { dist: newDist, mid: newMid };
      moved.current = true;
      return;
    }

    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      moved.current = true;
    }
    setTransform((t) => ({ scale: t.scale, tx: t.tx + dx, ty: t.ty + dy }));
  }, []);

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
  }, []);

  const wasDragging = useCallback(() => moved.current, []);

  const reset = useCallback(() => {
    didFit.current = true;
    fitToContainer();
  }, [fitToContainer]);

  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (el === null) return;
      zoomAtPoint(el.clientWidth / 2, el.clientHeight / 2, factor);
    },
    [zoomAtPoint],
  );

  return {
    transform,
    containerRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    wasDragging,
    reset,
    zoomBy,
  };
};
