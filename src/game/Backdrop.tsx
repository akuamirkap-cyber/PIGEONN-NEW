import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { engine } from "./engine";
import { useUI } from "./store";
import { BACK, FUJI, FUJI_CY, buildClouds } from "./backdrop";
import { PANO, paintFuji, paintHills, paintCityNight, paintScenicDay } from "./backdropPaint";

/**
 * Distant scenery that travels with the camera (so it sits at "infinity"): a painted Mount Fuji billboard,
 * a 360° panorama of layered hills / sakura groves / pagoda / fields, and a few voxel clouds.
 * Layers are unlit and ignore depth (drawn first, in renderOrder), stay in the opaque pass with alpha-to-coverage
 * for smooth cut-out edges, and are excluded from the world-curve shader (userData.noCurve).
 */
export function Backdrop() {
  const gl = useThree((s) => s.gl);
  const mode = useUI((s) => s.trackMode);
  const tod = useUI((s) => s.shibuyaTime);
  const cloudyW = useUI((s) => s.weather === "cloudy");
  const snowW = useUI((s) => s.weather === "snow");
  const night = mode === "shibuya" && tod === "malam";
  const cloudy = (cloudyW || snowW) && !night;
  const root = useRef<THREE.Group>(null);
  const fuji = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Group>(null);
  const dir = useMemo(() => new THREE.Vector3(), []);

  const built = useMemo(() => {
    const maxTex = gl.capabilities.maxTextureSize;
    const hillsW = maxTex >= 4096 ? 4096 : 2048;
    const mk = (canvas: HTMLCanvasElement, repeat: boolean) => {
      const t = new THREE.CanvasTexture(canvas);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      if (repeat) t.wrapS = THREE.RepeatWrapping;
      t.needsUpdate = true;
      return t;
    };
    const fujiTex = mk(paintFuji(), false);
    // Shibuya: malam = skyline neon Tokyo; SIANG = panorama perbukitan & pemandangan
    // (bukan "tembok" kota) — gaya ilustratifnya selaras dengan Gunung Fuji. Mode lain tetap bukit.
    const dayTod = tod === "malam" ? "siang" : tod;
    const dayMist = snowW && !night ? "#e6eef6" : cloudy ? "#dfe7ee" : dayTod === "pagi" ? "#ffe7cd" : dayTod === "sore" ? "#f7cda4" : "#dbeeff";
    const hillsTex = mk(
      mode === "shibuya"
        ? night
          ? paintCityNight(hillsW, hillsW / 8)
          : paintScenicDay(hillsW, hillsW / 8, dayTod, dayMist)
        : paintHills(hillsW, hillsW / 8),
      true,
    );
    const mat = (map: THREE.Texture, side: THREE.Side) =>
      new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, alphaToCoverage: true, fog: false, depthWrite: false, depthTest: false, side, toneMapped: false });
    const hillsH = PANO.topY + PANO.botY;
    return {
      fujiTex,
      hillsTex,
      fujiMat: mat(fujiTex, THREE.DoubleSide),
      hillsMat: mat(hillsTex, THREE.BackSide),
      fujiGeo: new THREE.PlaneGeometry(FUJI.w, FUJI.h),
      hillsGeo: new THREE.CylinderGeometry(BACK.hills, BACK.hills, hillsH, 192, 1, true),
      hillsY: (PANO.topY - PANO.botY) / 2,
      // night clouds turn into dim indigo silhouettes lit faintly from the city below
      cloudMat: new THREE.MeshBasicMaterial({
        vertexColors: true,
        color: night ? "#575d8a" : cloudy ? "#f4f7fa" : mode === "shibuya" && tod === "sore" ? "#ffd9b3" : mode === "shibuya" && tod === "pagi" ? "#fff0e0" : "#ffffff",
        fog: false,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      }),
      clouds: buildClouds(),
    };
  }, [gl, mode, tod, night, cloudy]);
  useEffect(
    () => () => {
      built.fujiTex.dispose();
      built.hillsTex.dispose();
      built.fujiMat.dispose();
      built.hillsMat.dispose();
      built.fujiGeo.dispose();
      built.hillsGeo.dispose();
      built.cloudMat.dispose();
      built.clouds.forEach((c) => c.geo.dispose());
    },
    [built],
  );

  // must run after the CameraRig has moved the camera this frame (declared after it in the scene)
  useFrame(({ camera }) => {
    const r = root.current;
    if (!r) return;
    r.position.copy(camera.position);
    // Fuji keeps to the left-of-centre of the view and only follows ~half of the camera's turning,
    // so it never slides out of frame on the road's gentle S-curves
    camera.getWorldDirection(dir);
    const heading = Math.atan2(dir.z, dir.x);
    const a = heading * 0.55 - 0.075;
    const f = fuji.current;
    if (f) {
      f.position.set(Math.cos(a) * BACK.fuji, FUJI_CY, Math.sin(a) * BACK.fuji);
      f.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a)); // face the camera
    }
    if (cloudsRef.current) cloudsRef.current.rotation.y = -engine.time * 0.004;
  });

  const noCurve = { noCurve: true };
  return (
    <group ref={root}>
      {!night && <mesh ref={fuji} geometry={built.fujiGeo} material={built.fujiMat} userData={noCurve} frustumCulled={false} renderOrder={-94} />}
      <group ref={cloudsRef}>
        {built.clouds.map((c, i) => (
          <mesh
            key={i}
            geometry={c.geo}
            material={built.cloudMat}
            userData={noCurve}
            frustumCulled={false}
            renderOrder={-93}
            position={[Math.cos(c.theta) * BACK.cloud, c.y, Math.sin(c.theta) * BACK.cloud]}
            rotation-y={-c.theta - Math.PI / 2}
            scale={c.scale}
          />
        ))}
      </group>
      <mesh geometry={built.hillsGeo} material={built.hillsMat} position={[0, built.hillsY, 0]} userData={noCurve} frustumCulled={false} renderOrder={-92} />
    </group>
  );
}
