import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEnvironmentStore, getDayFactor } from '../../store/environmentStore';

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uFlow;
  uniform float uWaveScale;
  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vElevation;
  varying float vLocalRadius;

  float wave(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.55 + t * 1.1) * 0.10;
    h += sin(p.y * 0.8 + t * 1.6) * 0.07;
    h += sin((p.x + p.y) * 0.35 + t * 0.8) * 0.09;
    h += sin((p.x - p.y) * 0.9 + t * 2.0) * 0.03;
    // Directional current ripples for flowing rivers.
    h += uFlow * (sin(p.x * 1.2 - t * 2.6) * 0.06 + sin(p.x * 0.6 - t * 1.8) * 0.04);
    return h;
  }

  void main() {
    vec3 pos = position;
    float e = 0.05;
    float h = wave(pos.xy, uTime);
    float hx = wave(pos.xy + vec2(e, 0.0), uTime);
    float hy = wave(pos.xy + vec2(0.0, e), uTime);

    pos.z = h * 0.35 * uWaveScale;
    vElevation = h * uWaveScale;
    vLocalRadius = length(position.xy);

    vec3 tangentX = normalize(vec3(e, 0.0, (hx - h) * 0.35 * uWaveScale));
    vec3 tangentY = normalize(vec3(0.0, e, (hy - h) * 0.35 * uWaveScale));
    vec3 n = normalize(cross(tangentX, tangentY));

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    vNormalW = normalize(mat3(modelMatrix) * n);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uSunDir;
  uniform vec3 uCameraPos;
  uniform float uTime;
  uniform float uNight;
  uniform float uRain;
  uniform float uRadius;

  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vElevation;
  varying float vLocalRadius;

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    vec3 normal = normalize(vNormalW);

    float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 3.0);

    float depthMix = clamp(vLocalRadius / uRadius, 0.0, 1.0);
    vec3 base = mix(uShallow, uDeep, depthMix);

    vec3 sunDir = normalize(uSunDir);
    vec3 halfV = normalize(viewDir + sunDir);
    float spec = pow(max(dot(normal, halfV), 0.0), 60.0) * (1.0 - uNight * 0.85) * (1.0 - uRain * 0.6);

    float foamMask = smoothstep(0.09, 0.16, vElevation);

    // Dappled caustic light patterns in shallow water, fading with depth/night/rain.
    float caustic = sin(vWorldPos.x * 3.0 + uTime * 1.3) * sin(vWorldPos.z * 3.0 - uTime * 1.7);
    caustic += sin(vWorldPos.x * 5.0 - uTime * 0.9) * sin(vWorldPos.z * 4.0 + uTime * 1.1) * 0.5;
    caustic = max(0.0, caustic) * (1.0 - depthMix) * (1.0 - uNight * 0.85) * (1.0 - uRain * 0.7);

    vec3 color = mix(base, uFoam, fresnel * 0.45);
    color = mix(color, uFoam, foamMask * 0.6);
    color += vec3(1.0, 1.0, 0.85) * caustic * 0.12;
    color += vec3(1.0, 0.97, 0.85) * spec * 0.9;

    // Cool, dim the water at night and dull it under rain.
    vec3 nightTint = vec3(0.05, 0.08, 0.16);
    color = mix(color, color * 0.35 + nightTint, uNight * 0.75);
    color = mix(color, color * 0.8, uRain * 0.35);

    gl_FragColor = vec4(color, 0.92);
  }
`;

interface WaterProps {
  radius?: number;
  /** When set, renders an annulus instead of a full disc - for a backdrop body of water surrounding the island. */
  innerRadius?: number;
  /** Height of the water plane. */
  y?: number;
  shallow: string;
  deep: string;
  foam: string;
  /** Adds a directional current ripple, for rivers. */
  flowing?: boolean;
  /** Multiplier on wave amplitude (e.g. larger for choppy ocean water). */
  waveScale?: number;
}

export default function Water({ radius = 6, innerRadius = 0, y = 0.05, shallow, deep, foam, flowing = false, waveScale = 1 }: WaterProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Created once; color values are updated in place via useFrame below.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlow: { value: flowing ? 1 : 0 },
      uWaveScale: { value: waveScale },
      uShallow: { value: new THREE.Color(shallow) },
      uDeep: { value: new THREE.Color(deep) },
      uFoam: { value: new THREE.Color(foam) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.6, 0.8) },
      uCameraPos: { value: new THREE.Vector3() },
      uNight: { value: 0 },
      uRain: { value: 0 },
      uRadius: { value: radius },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock, camera }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
    materialRef.current.uniforms.uShallow.value.set(shallow);
    materialRef.current.uniforms.uDeep.value.set(deep);
    materialRef.current.uniforms.uFoam.value.set(foam);
    materialRef.current.uniforms.uFlow.value = flowing ? 1 : 0;
    materialRef.current.uniforms.uWaveScale.value = waveScale;
    materialRef.current.uniforms.uRadius.value = radius;

    const { timeOfDay, weather } = useEnvironmentStore.getState();
    const dayFactor = getDayFactor(timeOfDay);
    const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
    materialRef.current.uniforms.uSunDir.value.set(Math.cos(sunAngle), Math.max(0.2, Math.sin(sunAngle)), 0.6).normalize();
    materialRef.current.uniforms.uNight.value = Math.max(0, -dayFactor);
    materialRef.current.uniforms.uRain.value = weather === 'rain' ? 1 : 0;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
      {innerRadius > 0 ? (
        <ringGeometry args={[innerRadius, radius, 96, 16]} />
      ) : (
        <circleGeometry args={[radius, 96]} />
      )}
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
      />
    </mesh>
  );
}
