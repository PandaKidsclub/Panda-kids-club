"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import type { HeroDepthSceneConfig } from "@/components/hero/hero-depth-scene-config";

interface HeroDepthSceneProps {
  config: HeroDepthSceneConfig;
  onUnavailable: () => void;
}

interface DepthFormsProps {
  config: HeroDepthSceneConfig;
}

const depthSettleRate = 4;

function CanvasContextMonitor({ onUnavailable }: Pick<HeroDepthSceneProps, "onUnavailable">) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = () => onUnavailable();

    canvas.addEventListener("webglcontextlost", handleContextLost, { once: true });
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [gl, onUnavailable]);

  return null;
}

function DepthForms({ config }: DepthFormsProps) {
  const groupRef = useRef<Group>(null);
  const nearGroupRef = useRef<Group>(null);
  const farGroupRef = useRef<Group>(null);
  const targetRef = useRef({ horizontal: 0, vertical: 0 });
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const hero = gl.domElement.closest<HTMLElement>(".hero-stage");

    if (!hero) {
      return undefined;
    }

    const updateTarget = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      const bounds = hero.getBoundingClientRect();
      targetRef.current = {
        horizontal: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1)),
        vertical: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1)),
      };
      invalidate();
    };

    const clearTarget = () => {
      targetRef.current = { horizontal: 0, vertical: 0 };
      invalidate();
    };

    hero.addEventListener("pointermove", updateTarget, { passive: true });
    hero.addEventListener("pointerleave", clearTarget, { passive: true });
    return () => {
      hero.removeEventListener("pointermove", updateTarget);
      hero.removeEventListener("pointerleave", clearTarget);
    };
  }, [gl, invalidate]);

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const nearGroup = nearGroupRef.current;
    const farGroup = farGroupRef.current;

    if (!group || !nearGroup || !farGroup) {
      return;
    }

    const target = targetRef.current;
    const nextGroupX = MathUtils.damp(group.position.x, target.horizontal * 0.08, depthSettleRate, delta);
    const nextGroupY = MathUtils.damp(group.position.y, target.vertical * -0.06, depthSettleRate, delta);
    const nextNearY = MathUtils.damp(nearGroup.rotation.y, target.horizontal * -0.035, depthSettleRate, delta);
    const nextFarY = MathUtils.damp(farGroup.rotation.y, target.horizontal * 0.02, depthSettleRate, delta);
    const nextNearX = MathUtils.damp(nearGroup.rotation.x, target.vertical * 0.025, depthSettleRate, delta);
    const nextFarX = MathUtils.damp(farGroup.rotation.x, target.vertical * -0.012, depthSettleRate, delta);
    const isSettling =
      Math.abs(nextGroupX - group.position.x) > 0.0001
      || Math.abs(nextGroupY - group.position.y) > 0.0001
      || Math.abs(nextNearY - nearGroup.rotation.y) > 0.0001
      || Math.abs(nextFarY - farGroup.rotation.y) > 0.0001;

    group.position.set(nextGroupX, nextGroupY, 0);
    nearGroup.rotation.set(nextNearX, nextNearY, 0);
    farGroup.rotation.set(nextFarX, nextFarY, 0);

    if (isSettling) {
      invalidate();
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={farGroupRef}>
        <mesh position={[-4.65, 1.65, -2.7]} rotation={[0.1, -0.25, -0.38]} scale={[1.18, 0.44, 0.44]}>
          <sphereGeometry args={[1, 18, 12]} />
          <meshStandardMaterial color={config.primary} metalness={0.04} roughness={0.78} />
        </mesh>
        <mesh position={[4.85, -1.95, -2.35]} rotation={[0.18, 0.35, 0.2]} scale={[0.78, 0.78, 0.44]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={config.secondary} metalness={0.03} roughness={0.8} />
        </mesh>
      </group>
      <group ref={nearGroupRef}>
        <mesh position={[-4.35, -2.35, 0.2]} rotation={[0.2, -0.4, 0.18]} scale={[0.82, 0.3, 0.35]}>
          <sphereGeometry args={[1, 18, 12]} />
          <meshStandardMaterial color={config.accent} metalness={0.06} roughness={0.7} />
        </mesh>
        <mesh position={[4.85, 2.4, -0.45]} rotation={[-0.12, 0.22, 0.3]} scale={[0.46, 0.74, 0.3]}>
          <sphereGeometry args={[1, 18, 12]} />
          <meshStandardMaterial color={config.secondary} metalness={0.04} roughness={0.74} />
        </mesh>
      </group>
    </group>
  );
}

export function HeroDepthScene({ config, onUnavailable }: HeroDepthSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ fov: 38, position: [0, 0, 7] }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      shadows={false}
    >
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight color={config.accent} intensity={config.directionalIntensity} position={[2.6, 3.2, 5]} />
      <CanvasContextMonitor onUnavailable={onUnavailable} />
      <DepthForms config={config} />
    </Canvas>
  );
}
