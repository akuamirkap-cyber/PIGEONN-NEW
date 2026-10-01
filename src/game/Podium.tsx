import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { engine, track, PODIUM_H, PODIUM_R, START_S } from "./engine";

/** Character-select turntable the pigeon stands on at the start line. */
export function Podium() {
  const top = useRef<THREE.Group>(null);
  const pos = useMemo(() => track.frame(START_S, 0, 0), []);
  const mats = useMemo(
    () => ({
      base: new THREE.MeshLambertMaterial({ color: "#3d4350", flatShading: true }),
      top: new THREE.MeshLambertMaterial({ color: "#2ec4b6", flatShading: true }),
      rim: new THREE.MeshLambertMaterial({ color: "#ffd60a", flatShading: true }),
      mark: new THREE.MeshLambertMaterial({ color: "#1f9a8f", flatShading: true }),
    }),
    [],
  );
  const geos = useMemo(
    () => ({
      base: new THREE.CylinderGeometry(PODIUM_R + 0.18, PODIUM_R + 0.3, 0.14, 16),
      top: new THREE.CylinderGeometry(PODIUM_R, PODIUM_R + 0.05, PODIUM_H - 0.14, 16),
      rim: new THREE.TorusGeometry(PODIUM_R + 0.02, 0.05, 6, 16),
      mark: new THREE.BoxGeometry(0.5, 0.03, 0.12),
    }),
    [],
  );

  useFrame(() => {
    if (top.current) top.current.rotation.y = engine.player.showYaw;
  });

  return (
    <group position={pos}>
      <mesh geometry={geos.base} material={mats.base} position={[0, 0.07, 0]} receiveShadow castShadow />
      <group ref={top}>
        <mesh geometry={geos.top} material={mats.top} position={[0, 0.14 + (PODIUM_H - 0.14) / 2, 0]} receiveShadow castShadow />
        <mesh geometry={geos.rim} material={mats.rim} position={[0, PODIUM_H, 0]} rotation-x={Math.PI / 2} />
        <mesh geometry={geos.mark} material={mats.mark} position={[PODIUM_R - 0.35, PODIUM_H + 0.01, 0]} />
        <mesh geometry={geos.mark} material={mats.mark} position={[-(PODIUM_R - 0.35), PODIUM_H + 0.01, 0]} />
      </group>
    </group>
  );
}
