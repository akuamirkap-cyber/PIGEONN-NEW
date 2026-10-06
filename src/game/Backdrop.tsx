import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { engine } from "./engine";
import { useUI } from "./store";
import { BACK, FUJI, FUJI_CY, buildClouds } from "./backdrop";
import { PANO, paintFuji, paintHills, paintCityNight, paintScenicDay } from "./backdropPaint";
import { buildVoxelGeometry, type Part } from "./voxel";

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
  const planeRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Group>(null);
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
    const built = {
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
      // ===== SIANG CERIA: pesawat terbang mungil + kontrail, matahari & berkas cahaya (raylight) =====
      planeMat: new THREE.MeshBasicMaterial({
        vertexColors: true,
        color: "#ffffff",
        fog: false, depthWrite: false, depthTest: false, toneMapped: false,
      }),
      planeGeo: buildVoxelGeometry([
        { x: 0, y: 0, z: 0, w: 3.1, h: 0.55, d: 0.5, color: "#f6f8fa" },          // bodi ramping
        { x: 1.62, y: 0.02, z: 0, w: 0.55, h: 0.42, d: 0.42, color: "#eef1f4" },  // hidung
        { x: 1.88, y: 0.08, z: 0, w: 0.07, h: 0.2, d: 0.26, color: "#39434f" },   // kokpit
        { x: 0.15, y: 0.1, z: 0, w: 1.1, h: 0.09, d: 3.6, color: "#e4e9ee" },     // sayap utama lebar
        { x: 0.15, y: -0.18, z: 1.15, w: 0.42, h: 0.22, d: 0.5, color: "#d7dde4" },// mesin kiri
        { x: 0.15, y: -0.18, z: -1.15, w: 0.42, h: 0.22, d: 0.5, color: "#d7dde4" },// mesin kanan
        { x: -1.35, y: 0.42, z: 0, w: 0.5, h: 0.66, d: 0.1, color: "#4cc9f0" },   // sirip ekor biru
        { x: -1.42, y: 0.44, z: 0, w: 0.4, h: 0.34, d: 0.12, color: "#ffd23f" },  // aksen livery emas
        { x: -1.28, y: 0.16, z: 0, w: 0.55, h: 0.08, d: 1.25, color: "#e4e9ee" }, // stabilizer horizontal
        { x: 0.35, y: 0.18, z: 0, w: 1.7, h: 0.12, d: 0.52, color: "#4cc9f0" },   // strip jendela biru
      ] satisfies Part[]),
      contrailMat: new THREE.MeshBasicMaterial({
        color: "#ffffff", transparent: true, opacity: 0.42,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, toneMapped: false,
      }),
      contrailGeo: new THREE.BoxGeometry(11, 0.13, 0.13),
      // Tekstur berkas cahaya: gradien putih terang di atas → transparan di bawah (dibuat sekali)
      rayTex: (() => {
        const cv = document.createElement("canvas");
        cv.width = 64;
        cv.height = 256;
        const cx = cv.getContext("2d")!;
        const g = cx.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, "rgba(255,247,214,0.9)");
        g.addColorStop(0.45, "rgba(255,242,196,0.35)");
        g.addColorStop(1, "rgba(255,240,190,0)");
        cx.fillStyle = g;
        cx.fillRect(0, 0, 64, 256);
        const t = new THREE.CanvasTexture(cv);
        t.colorSpace = THREE.SRGBColorSpace;
        return t;
      })(),
      rayMat: new THREE.MeshBasicMaterial({
        transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
        side: THREE.DoubleSide, fog: false, toneMapped: false,
      }),
      sunMat: new THREE.MeshBasicMaterial({
        color: "#fff7d6", transparent: true, opacity: 0.95,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, toneMapped: false,
      }),
      haloMat: new THREE.MeshBasicMaterial({
        color: "#ffefc0", transparent: true, opacity: 0.25,
        blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, fog: false, toneMapped: false,
      }),
      rayGeo: new THREE.PlaneGeometry(7.5, 46),
      sunGeo: new THREE.CircleGeometry(3.1, 24),
      haloGeo: new THREE.CircleGeometry(6.4, 24),
    };
    built.rayMat.map = built.rayTex;
    built.rayMat.needsUpdate = true;
    return built;
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
      built.planeMat.dispose();
      built.planeGeo.dispose();
      built.contrailMat.dispose();
      built.contrailGeo.dispose();
      built.rayTex.dispose();
      built.rayMat.dispose();
      built.sunMat.dispose();
      built.haloMat.dispose();
      built.rayGeo.dispose();
      built.sunGeo.dispose();
      built.haloGeo.dispose();
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
    if (cloudsRef.current) cloudsRef.current.rotation.y = -engine.time * 0.005;

    // ===== Pesawat terbang siang: mengelilingi langit melingkar perlahan + sedikit goyang naik-turun =====
    const pl = planeRef.current;
    if (pl) {
      const th = engine.time * 0.0072 + 1.1; // keliling langit pelan & santai
      const rad = BACK.cloud * 0.88;
      pl.position.set(Math.cos(th) * rad, 30.5 + Math.sin(engine.time * 0.35) * 0.7, Math.sin(th) * rad);
      pl.rotation.y = -(th + Math.PI / 2);
      pl.rotation.z = 0.06 + Math.sin(engine.time * 0.5) * 0.03; // bank mungil nan lucu
    }

    // ===== Berkas cahaya matahari (raylight): kipas lembut menghadap kamera, denyut halus.
    // Mengikuti heading kamera seperti Fuji supaya selalu nampak di pojok kanan-atas langit.
    const rg = raysRef.current;
    if (rg) {
      const a2 = heading + 0.52;
      rg.position.set(Math.cos(a2) * 64, 46, Math.sin(a2) * 64);
      rg.lookAt(camera.position);
      rg.scale.setScalar(cloudy ? 0.75 : 1);
      built.rayMat.opacity = (cloudy ? 0.13 : 0.3) + Math.sin(engine.time * 0.55) * 0.05;
      built.sunMat.opacity = (cloudy ? 0.5 : 0.92) + Math.sin(engine.time * 0.4) * 0.05;
    }
  });

  const noCurve = { noCurve: true };
  // Kipas berkas cahaya: sudut roll tiap bilah dari titik surya (kiri→kanan melebar)
  const RAY_FAN = [0.55, 0.3, 0.08, -0.16, -0.42];
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
      {/* PESAWAT TERBANG SIANG + kontrail kembar (sembunyi saat malam & salju) */}
      {!night && !snowW && (
        <group ref={planeRef} scale={[2.3, 2.3, 2.3]}>
          <mesh geometry={built.planeGeo} material={built.planeMat} userData={noCurve} frustumCulled={false} renderOrder={-93} />
          <mesh geometry={built.contrailGeo} material={built.contrailMat} userData={noCurve} frustumCulled={false} renderOrder={-93} position={[-7.2, 0.06, 1.15]} />
          <mesh geometry={built.contrailGeo} material={built.contrailMat} userData={noCurve} frustumCulled={false} renderOrder={-93} position={[-7.2, 0.06, -1.15]} />
        </group>
      )}
      {/* MATAHARI + KIPAS RAYLIGHT lembut (siang: cerah; berawan: temaram; malam/salju: hilang) */}
      {!night && !snowW && (
        <group ref={raysRef}>
          <mesh geometry={built.haloGeo} material={built.haloMat} userData={noCurve} frustumCulled={false} renderOrder={-93} />
          <mesh geometry={built.sunGeo} material={built.sunMat} userData={noCurve} frustumCulled={false} renderOrder={-92} />
          {RAY_FAN.map((rz, i) => (
            <mesh
              key={i}
              geometry={built.rayGeo}
              material={built.rayMat}
              userData={noCurve}
              frustumCulled={false}
              renderOrder={-93}
              position={[Math.sin(rz) * 23, -Math.cos(rz) * 23, -0.01 * (i + 1)]}
              rotation={[0, 0, rz]}
            />
          ))}
        </group>
      )}
    </group>
  );
}
