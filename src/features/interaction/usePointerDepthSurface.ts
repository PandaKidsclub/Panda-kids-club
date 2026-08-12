"use client";

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

interface PointerDepthSurfaceOptions {
  maxTiltX?: number;
  maxTiltY?: number;
  onPosition?: (element: HTMLElement, horizontal: number, vertical: number) => void;
}

interface PendingPointerPosition<T extends HTMLElement> {
  element: T;
  horizontal: number;
  vertical: number;
}

const finePointerQuery = "(hover: hover) and (pointer: fine)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function canUsePointerDepth(pointerType: string): boolean {
  return (
    pointerType !== "touch"
    && window.matchMedia(finePointerQuery).matches
    && !window.matchMedia(reducedMotionQuery).matches
  );
}

export function usePointerDepthSurface<T extends HTMLElement>({
  maxTiltX = 2,
  maxTiltY = 2.5,
  onPosition,
}: PointerDepthSurfaceOptions = {}) {
  const surfaceRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingPositionRef = useRef<PendingPointerPosition<T> | null>(null);

  const applyPosition = useCallback((element: T, horizontal: number, vertical: number) => {
    const tiltX = -vertical * maxTiltX;
    const tiltY = horizontal * maxTiltY;

    element.style.setProperty("--pointer-x", `${(horizontal + 1) * 50}%`);
    element.style.setProperty("--pointer-y", `${(vertical + 1) * 50}%`);
    element.style.setProperty("--depth-tilt-x", `${tiltX.toFixed(3)}deg`);
    element.style.setProperty("--depth-tilt-y", `${tiltY.toFixed(3)}deg`);
    onPosition?.(element, horizontal, vertical);
  }, [maxTiltX, maxTiltY, onPosition]);

  const attachSurface = useCallback((element: T | null) => {
    surfaceRef.current = element;
  }, []);

  const flushPosition = useCallback(() => {
    frameRef.current = null;
    const pending = pendingPositionRef.current;

    if (!pending) {
      return;
    }

    pendingPositionRef.current = null;
    applyPosition(pending.element, pending.horizontal, pending.vertical);
  }, [applyPosition]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<T>) => {
    if (!canUsePointerDepth(event.pointerType)) {
      return;
    }

    const element = surfaceRef.current ?? event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const horizontal = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
    const vertical = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));

    pendingPositionRef.current = { element, horizontal, vertical };

    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(flushPosition);
    }
  }, [flushPosition]);

  const handlePointerLeave = useCallback((event: ReactPointerEvent<T>) => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    pendingPositionRef.current = null;
    applyPosition(surfaceRef.current ?? event.currentTarget, 0, 0);
  }, [applyPosition]);

  useEffect(() => () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
  }, []);

  return {
    attachSurface,
    handlePointerMove,
    handlePointerLeave,
  };
}
