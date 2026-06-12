import { useFrame, useThree } from '@react-three/fiber';
import { useCameraControls } from '../../store/cameraStore';

/** Drives the camera from the touch-control camera store (orbit + pan + zoom). */
export default function CameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    const { target, azimuth, polar, distance } = useCameraControls.getState();
    const sinPolar = Math.sin(polar);
    camera.position.set(
      target[0] + distance * sinPolar * Math.sin(azimuth),
      target[1] + distance * Math.cos(polar),
      target[2] + distance * sinPolar * Math.cos(azimuth),
    );
    camera.lookAt(target[0], target[1], target[2]);
  });

  return null;
}
