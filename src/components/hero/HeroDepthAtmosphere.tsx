"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { getHeroDepthSceneConfig } from "@/components/hero/hero-depth-scene-config";
import type { PageTheme } from "@/lib/theme/page-themes";

const LazyHeroDepthScene = dynamic(
  () => import("@/components/hero/HeroDepthScene").then((module) => module.HeroDepthScene),
  { ssr: false, loading: () => null },
);

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const finePointerQuery = "(hover: hover) and (pointer: fine)";
const wideViewportQuery = "(min-width: 900px)";

interface NavigatorConnection extends Navigator {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
  };
}

interface HeroDepthAtmosphereProps {
  theme: PageTheme;
  saveData: boolean;
}

interface HeroDepthErrorBoundaryProps {
  children: ReactNode;
  onFailure: () => void;
}

interface HeroDepthErrorBoundaryState {
  hasFailed: boolean;
}

class HeroDepthErrorBoundary extends Component<HeroDepthErrorBoundaryProps, HeroDepthErrorBoundaryState> {
  state: HeroDepthErrorBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): HeroDepthErrorBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}

function supportsWebGl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function canRenderHeroDepth(saveData: boolean): boolean {
  const connection = (navigator as NavigatorConnection).connection;

  if (saveData || connection?.saveData === true || !supportsWebGl()) {
    return false;
  }

  return (
    !window.matchMedia(reducedMotionQuery).matches
    && window.matchMedia(finePointerQuery).matches
    && window.matchMedia(wideViewportQuery).matches
  );
}

export function HeroDepthAtmosphere({ theme, saveData }: HeroDepthAtmosphereProps) {
  const [isEligible, setIsEligible] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia(reducedMotionQuery);
    const pointerQuery = window.matchMedia(finePointerQuery);
    const viewportQuery = window.matchMedia(wideViewportQuery);
    const connection = (navigator as NavigatorConnection).connection;

    const updateEligibility = () => {
      setIsEligible(canRenderHeroDepth(saveData));
    };

    updateEligibility();
    motionQuery.addEventListener("change", updateEligibility);
    pointerQuery.addEventListener("change", updateEligibility);
    viewportQuery.addEventListener("change", updateEligibility);
    connection?.addEventListener?.("change", updateEligibility);

    return () => {
      motionQuery.removeEventListener("change", updateEligibility);
      pointerQuery.removeEventListener("change", updateEligibility);
      viewportQuery.removeEventListener("change", updateEligibility);
      connection?.removeEventListener?.("change", updateEligibility);
    };
  }, [saveData]);

  if (!isEligible || hasFailed) {
    return null;
  }

  return (
    <div className="hero-stage__webgl" aria-hidden="true">
      <HeroDepthErrorBoundary onFailure={() => setHasFailed(true)}>
        <LazyHeroDepthScene config={getHeroDepthSceneConfig(theme)} onUnavailable={() => setHasFailed(true)} />
      </HeroDepthErrorBoundary>
    </div>
  );
}
