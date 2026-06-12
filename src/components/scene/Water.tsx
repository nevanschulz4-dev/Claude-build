import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
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
    return h;
  }

  void main() {
    vec3 pos = position;
    float e = 0.05;
    float h = wave(pos.xy, uTime);
    float hx = wave(pos.xy + vec2(e, 0.0), uTime);
    float hy = wave(pos.xy + vec2(0.0, e), uTime);

    pos.z = h * 0.35;
    vElevation = h;
    vLocalRadius = length(position.xy);

    vec3 tangentX = normalize(vec3(e, 0.0, (hx - h) * 0.35));
    vec3 tangentY = normalize(vec3(0.0, e, (hy - h) * 0.35));
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

  varying vec3 vWorldPos;
  varying vec3 vNormalW;
  varying float vElevation;
  varying float vLocalRadius;

  void main() {
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    vec3 normal = normalize(vNormalW);

    float fresnel = pow(1.0 - clamp(dot(viewDir, normal), 0.0, 1.0), 3.0);

    float depthMix = clamp(vLocalRadius / 6.0, 0.0, 1.0);
    vec3 base = mix(uShallow, uDeep, depthMix);

    vec3 sunDir = normalize(uSunDir);
    vec3 halfV = normalize(viewDir + sunDir);
    float spec = pow(max(dot(normal, halfV), 0.0), 60.0);

    float foamMask = smoothstep(0.09, 0.16, vElevation);

    vec3 color = mix(base, uFoam, fresnel * 0.45);
    color = mix(color, uFoam, foamMask * 0.6);
    color += vec3(1.0, 0.97, 0.85) * spec * 0.9;

    gl_FragColor = vec4(color, 0.92);
  }
`;

interface WaterProps {
  radius?: number;
  shallow: string;
  deep: string;
  foam: string;
}

export default function Water({ radius = 6, shallow, deep, foam }: WaterProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uShallow: { value: new THREE.Color(shallow) },
      uDeep: { value: new THREE.Color(deep) },
      uFoam: { value: new THREE.Color(foam) },
      uSunDir: { value: new THREE.Vector3(0.4, 0.6, 0.8) },
      uCameraPos: { value: new THREE.Vector3() },
    }),
    [],
  );

  useFrame(({ clock, camera }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uCameraPos.value.copy(camera.position);
    materialRef.current.uniforms.uShallow.value.set(shallow);
    materialRef.current.uniforms.uDeep.value.set(deep);
    materialRef.current.uniforms.uFoam.value.set(foam);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
      <circleGeometry args={[radius, 96]} />
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
