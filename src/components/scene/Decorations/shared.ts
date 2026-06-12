import * as THREE from 'three';
import { useMemo } from 'react';
import { useToonGradient } from '../../../utils/textures';

export interface DecorationModelProps {
  position?: [number, number, number];
  rotationY?: number;
  preview?: boolean;
  /** When in preview mode: true = green "valid" tint, false = red "invalid" tint */
  valid?: boolean;
}

/** Shared per-model context: gradient map + a helper to build tinted toon materials. */
export function useDecorMaterials(preview: boolean, valid: boolean) {
  const gradientMap = useToonGradient(4);

  const tint = useMemo(() => {
    if (!preview) return null;
    return valid ? new THREE.Color('#39ff7a') : new THREE.Color('#ff4d4d');
  }, [preview, valid]);

  /** Build a MeshToonMaterial, optionally tinted/transparent for preview ghosts. */
  const mat = useMemo(() => {
    return (color: string, opts: { emissive?: string; emissiveIntensity?: number } = {}) => {
      const base = new THREE.Color(color);
      const finalColor = tint ? base.lerp(tint, 0.55) : base;
      const params: THREE.MeshToonMaterialParameters = {
        color: finalColor,
        gradientMap,
      };
      if (opts.emissive) {
        params.emissive = new THREE.Color(opts.emissive);
        params.emissiveIntensity = opts.emissiveIntensity ?? 1;
      }
      if (preview) {
        params.transparent = true;
        params.opacity = 0.5;
        params.depthWrite = false;
      }
      return new THREE.MeshToonMaterial(params);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    };
  }, [gradientMap, tint, preview]);

  return { gradientMap, mat, preview };
}
