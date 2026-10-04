import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, setGlowBoost } from "./voxel";
import { engine, track } from "./engine";
import { useUI } from "./store";
import { World } from "./World";
import { Player } from "./Player";
import { Backdrop } from "./Backdrop";
import { applyCurveToScene, curveUniforms, disableCurve, curveDisabled } from "./curve";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Subway-Surfers style third-person chase camera:
 * behind and above the pigeon, looking slightly down the road, following the track heading.
 */
interface Framing {
  back: number; // distance behind the pigeon (along the road)
  up: number; // height above the road
  lookAhead: number; // how far ahead of the pigeon the camera aims
  lookUp: number; // aim height above the road
  fov: number;
  latFollow: number; // 0..1 how much the camera slides sideways with the lane
  orbit: number; // extra yaw around the pigeon (menu turntable view)
  roll: number; // Dutch action angle / camera tilt (rad)
  curveDown: number;
  curveSide: number;
  hazeNear: number;
  hazeFar: number;
}
const PLAY: Framing = { back: 8.4, up: 5.0, lookAhead: 13, lookUp: 0.38, fov: 60, latFollow: 0.55, orbit: 0, roll: 0, curveDown: 0.0018, curveSide: 0, hazeNear: 78, hazeFar: 160 };
const NOS_F: Framing = { back: 7.6, up: 4.6, lookAhead: 15, lookUp: 0.32, fov: 70, latFollow: 0.55, orbit: 0, roll: 0, curveDown: 0.0022, curveSide: 0, hazeNear: 78, hazeFar: 160 };
// Crossy Road-inspired elevated chase: more of the lanes and upcoming crossings stay visible.
const CROSSY: Framing = { back: 8.2, up: 9.2, lookAhead: 6.0, lookUp: 0.45, fov: 48, latFollow: 0.38, orbit: 0, roll: 0, curveDown: 0.0008, curveSide: 0, hazeNear: 86, hazeFar: 172 };
const CROSSY_NOS: Framing = { ...CROSSY, back: 9.0, up: 9.6, fov: 51 };
// Subway Surfers signature pre-game action angle: Low-Angle Dutch Hero Shot (sudut rendah miring dinamis)
const MENU: Framing = { back: 3.3, up: 0.86, lookAhead: 0.12, lookUp: 0.95, fov: 54, latFollow: 1, orbit: -0.78, roll: -0.095, curveDown: 0.0008, curveSide: 0.0003, hazeNear: 90, hazeFar: 175 };
const SKINS: Framing = { back: 7.6, up: 1.8, lookAhead: 0.15, lookUp: -0.5, fov: 42, latFollow: 1, orbit: -0.55, roll: 0, curveDown: 0.0, curveSide: 0, hazeNear: 90, hazeFar: 180 };
const TRICKS_F: Framing = { back: 9.8, up: 1.8, lookAhead: 0.15, lookUp: -1.4, fov: 42, latFollow: 1, orbit: -0.55, roll: 0, curveDown: 0.0, curveSide: 0, hazeNear: 90, hazeFar: 180 };
const CRASH: Framing = { back: 5.6, up: 3.6, lookAhead: 0, lookUp: 0.35, fov: 56, latFollow: 0.25, orbit: 0, roll: 0, curveDown: 0.0006, curveSide: 0, hazeNear: 85, hazeFar: 165 };

function CameraRig() {
  const { camera, size, scene } = useThree();
  const cur = useRef<Framing>({ ...MENU });
  const yaw = useRef(0);
  const camLat = useRef(0);
  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      target: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      side: new THREE.Vector3(),
      base: new THREE.Vector3(),
    }),
    [],
  );
  const patchT = useRef(0);

  useFrame((_, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const step = Math.min(dt, 0.05);
    const phase = engine.phase;
    const ui = useUI.getState();
    const view = ui.menuView;
    const crossy = ui.cameraMode === "crossy";
    const des =
      phase === "menu"
        ? view === "skins"
          ? SKINS
          : view === "tricks"
            ? TRICKS_F
            : MENU
        : phase === "playing"
          ? crossy
            ? engine.nosT > 0
              ? CROSSY_NOS
              : CROSSY
            : engine.nosT > 0
              ? NOS_F
              : PLAY
          : CRASH;
    // Faster action sweep during crash or intro
    const k = 1 - Math.exp(-step * (phase === "menu" ? 4.5 : engine.runTime < 1.0 ? 5.2 : phase === "crashed" || phase === "gameover" ? 6.5 : 3.2));
    const c = cur.current;
    for (const key of Object.keys(c) as (keyof Framing)[]) c[key] += (des[key] - c[key]) * k;

    // follow the road heading with a little look-ahead so curves read early
    const ahead = 4 + engine.speed * 0.3;
    const th = track.sample(engine.distance + ahead).th;
    yaw.current += (th - yaw.current) * (1 - Math.exp(-step * 3.5));
    const heading = yaw.current + c.orbit;
    v.fwd.set(Math.cos(heading), 0, Math.sin(heading));
    v.side.set(-Math.sin(heading), 0, Math.cos(heading));

    const p = engine.player;

    if (phase === "crashed" || phase === "gameover") {
      const b = p.body;
      const bodyS = b ? b.s : engine.distance;
      const camS = Math.max(0, bodyS - c.back);

      // Keep camera strictly in the central road corridor (lat between -1.1 and 1.1)
      // so it is always over the open asphalt and never behind buildings or sidewalk walls
      const bodyLat = b ? b.lat : 0;
      camLat.current += (bodyLat * c.latFollow - camLat.current) * (1 - Math.exp(-step * 6));
      const safeRoadLat = clamp(camLat.current, -1.1, 1.1);

      // Position camera above the road looking down at the pigeon
      track.frame(camS, safeRoadLat, c.up, v.pos);

      // Spotlight the pigeon: target locks dead-center onto the pigeon's 3D body position!
      v.target.set(p.wx, p.wy + 0.32, p.wz);
      v.base.set(p.wx, v.pos.y, p.wz);
    } else {
      // lateral follow: slide part of the way toward the pigeon's lane
      const lat = phase === "menu" ? 0 : p.lat;
      camLat.current += (lat * c.latFollow - camLat.current) * (1 - Math.exp(-step * 6));

      // base point: on the road under the pigeon
      const ctr = engine.center;
      v.base.set(ctr.x, ctr.y, ctr.z);

      const hFollow = phase === "playing" ? Math.max(0, p.h) * 0.25 : 0;
      // slope follow: the aim point sits on the road ahead, so on a descent the camera tilts down with the hill
      const gAhead = phase === "menu" ? 0 : track.sample(engine.distance + c.lookAhead).y - ctr.y;
      const gBack = phase === "menu" ? 0 : track.sample(Math.max(0, engine.distance - c.back)).y - ctr.y;

      v.pos.copy(v.base).addScaledVector(v.fwd, -c.back).addScaledVector(v.side, camLat.current);
      v.pos.y += c.up + hFollow + gBack * 0.6;

      // Subtle handheld action float while idling in menu
      if (phase === "menu" && view === "main") {
        v.pos.x += Math.sin(engine.time * 1.5) * 0.05;
        v.pos.y += Math.cos(engine.time * 2.0) * 0.035;
      }

      v.target.copy(v.base).addScaledVector(v.fwd, c.lookAhead).addScaledVector(v.side, camLat.current * 0.6);
      v.target.y += c.lookUp + hFollow * 0.8 + gAhead * 0.85;
    }

    const s = phase === "crashed" || phase === "gameover" ? Math.min(engine.shake, 0.35) : engine.shake;
    if (s > 0) {
      v.pos.x += (Math.random() - 0.5) * s * 0.5;
      v.pos.y += (Math.random() - 0.5) * s * 0.5;
      v.pos.z += (Math.random() - 0.5) * s * 0.5;
    }
    // Tanpa guncangan/geser kamera saat nabrak hewan: posisi kamera tetap mulus,
    // efek "denyut" hanya nudge FOV tipis di bawah (lihat perhitungan fov).
    cam.position.copy(v.pos);
    cam.up.set(0, 1, 0);
    cam.lookAt(v.target);
    if (c.roll) cam.rotateZ(c.roll); // Dutch angle action tilt
    const aspect = size.width / size.height;
    // keep the horizontal field of view sane on very tall phones
    // sprint = dynamic zoom-out for fast kick sensation; punch = nudge zoom tipis saat hewan mental
    const fov =
      (aspect < 0.56 ? c.fov + (0.56 - aspect) * 40 : c.fov) + engine.sprint * 6.5 - engine.punch * engine.punch * 4.5;
    if (Math.abs(cam.fov - fov) > 0.01 || cam.aspect !== aspect) {
      cam.fov = fov;
      cam.aspect = aspect;
      cam.updateProjectionMatrix();
    }

    // Dynamic world curvature (gentle, smooth horizon without extreme warping)
    const isSubway = useUI.getState().worldCurve === "subway";
    const trackModeNow = useUI.getState().trackMode;
    const isHaruna = trackModeNow === "haruna";
    const dist = engine.distance;
    // Gentle horizon drift in Tokyo mode; on Haruna mountain touge, actual 3D hairpin curves lead naturally
    const wave = isHaruna ? 0 : Math.sin(dist * 0.006) * 0.0004;
    const targetCurveSide = isSubway
      ? phase === "playing"
        ? wave
        : phase === "menu"
          ? 0.0003
          : 0
      : 0;
    // Subtle downward curvature that gives horizon depth without dropping the track off a cliff
    const targetCurveDown = isSubway ? (isHaruna ? c.curveDown * 0.75 : c.curveDown) : 0;
    c.curveSide += (targetCurveSide - c.curveSide) * (1 - Math.exp(-step * 2.8));

    // world curve: bends everything ahead of the player; haze only touches the far end of the world
    if (!curveDisabled) {
      curveUniforms.uCurveOrigin.value.copy(v.base);
      curveUniforms.uCurveDir.value.set(Math.cos(yaw.current), 0, Math.sin(yaw.current));
      curveUniforms.uCurveDown.value = targetCurveDown;
      curveUniforms.uCurveSide.value = isSubway ? c.curveSide : 0;
      curveUniforms.uCurveStart.value = 8.0; // keeps the first 8m ahead completely flat and clear
      curveUniforms.uHazeRange.value.set(c.hazeNear, c.hazeFar);
      // distance haze matches the world: pale daylight mist vs deep midnight Tokyo night
      {
        const st = useUI.getState();
        const isNightNow = trackModeNow === "shibuya" && st.shibuyaTime === "malam";
        const snowNow = st.weather === "snow" && !isNightNow;
        // jumlah salju di permukaan fade in/out halus saat cuaca berubah
        const target = st.weather === "snow" ? 1 : 0;
        const curS = curveUniforms.uSnowAmount.value as number;
        curveUniforms.uSnowAmount.value = target + (curS - target) * Math.exp(-step * 1.8);
        if (snowNow) curveUniforms.uHazeRange.value.set(c.hazeNear * 0.82, c.hazeFar * 0.86); // udara bersalju lebih "dekat"
        curveUniforms.uHazeColor.value.set(
          isNightNow
            ? "#162032"
            : snowNow
              ? "#e4edf5"
              : st.weather === "cloudy"
                ? "#dfe7ee"
                : trackModeNow === "shibuya" && st.shibuyaTime === "sore"
                  ? "#f7cda4"
                  : trackModeNow === "shibuya" && st.shibuyaTime === "pagi"
                    ? "#ffe7cd"
                    : "#dbeeff",
        );
      }
    }

    // newly created materials (buildings, thumbnails, etc.) get patched lazily
    patchT.current += step;
    if (patchT.current > 0.5) {
      patchT.current = 0;
      applyCurveToScene(scene);
    }
  });

  useEffect(() => {
    applyCurveToScene(scene);
  }, [scene]);
  return null;
}

function Lights() {
  const light = useRef<THREE.DirectionalLight>(null);
  const mode = useUI((s) => s.trackMode);
  const tod = useUI((s) => s.shibuyaTime);
  // PENTING: hook harus selalu terpanggil dengan urutan sama — jangan pakai && antar useUI
  const cloudyWeather = useUI((s) => s.weather === "cloudy");
  const snowWeather = useUI((s) => s.weather === "snow");
  const nightBright = useUI((s) => s.nightBright);
  const night = mode === "shibuya" && tod === "malam";
  const cloudy = cloudyWeather && !night;
  const snowy = snowWeather && !night;
  const nightMul = [0.82, 1, 1.18][nightBright];
  // Preset cahaya: malam (terang, hangat, bersih) / bersalju (dingin lembut, langit putih) / berawan / Shibuya pagi (emas lembut) / Shibuya sore (senja oranye) / siang cerah
  const preset = night
    ? { hemi: ["#e4ecf8", "#242e40", 1.65 * nightMul] as const, amb: [0.95 * nightMul, "#f0f4fc"] as const, dir: [1.65 * nightMul, "#fff6e8"] as const }
    : snowy
      ? { hemi: ["#eef3fb", "#aabdd0", 1.8] as const, amb: [0.62, "#f2f7fd"] as const, dir: [0.85, "#e6edf8"] as const }
      : cloudy
        ? { hemi: ["#e8edf4", "#93a0ad", 1.4] as const, amb: [0.5, "#eef2f7"] as const, dir: [1.15, "#eef2f6"] as const }
      : mode === "shibuya" && tod === "pagi"
        ? { hemi: ["#fff0dd", "#8a90b8", 1.7] as const, amb: [0.4, "#ffe9d0"] as const, dir: [2.1, "#fff0d8"] as const }
        : mode === "shibuya" && tod === "sore"
          ? { hemi: ["#ffd9b0", "#6a7095", 1.5] as const, amb: [0.42, "#ffd3ae"] as const, dir: [1.95, "#ffc088"] as const }
          : { hemi: ["#ffffff", "#9ac2ea", 2.15] as const, amb: [0.44, "#ffffff"] as const, dir: [2.4, "#fff9eb"] as const };
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target = target;
    const cam = l.shadow.camera;
    cam.left = -26;
    cam.right = 26;
    cam.top = 26;
    cam.bottom = -26;
    cam.near = 1;
    cam.far = 90;
    cam.updateProjectionMatrix();
    const mobile = typeof navigator !== "undefined" && navigator.maxTouchPoints > 0 && window.innerWidth < 900;
    l.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.03;
    l.shadow.needsUpdate = true;
  }, [target]);
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    const c = engine.center;
    // shadow frustum centered a bit ahead of the player
    const th = c.th;
    const fx = Math.cos(th);
    const fz = Math.sin(th);
    l.position.set(c.x - 2 + fx * 12, c.y + 25, c.z + 4.5 + fz * 12);
    target.position.set(c.x + fx * 17, c.y, c.z + fz * 17);
    target.updateMatrixWorld();
  });
  return (
    <>
      {/* Shibuya Night: bright "city that never sleeps" ambience — the sky stays dark but streets
          and facades are washed by warm shop light + violet sky bounce, and every sign self-glows */}
      <hemisphereLight args={[...preset.hemi]} />
      <ambientLight intensity={preset.amb[0]} color={preset.amb[1]} />
      <directionalLight ref={light} position={[-2, 25, 4.5]} intensity={preset.dir[0]} color={preset.dir[1]} castShadow />
      <primitive object={target} />
    </>
  );
}

function Loop() {
  useFrame((_, dt) => engine.update(dt), -10);
  return null;
}

/** Bloom malam SELEKTIF via HDR: material glow di-boost > 1.0 (render target half-float),
 *  threshold bloom = 1.0, jadi HANYA lampu/sign glow yang mekar — cat marka jalan, zebra,
 *  dan permukaan putih biasa (maks 1.0) dijamin TIDAK ikut bloom. Radius besar + strength
 *  kalem = halo lembut yang tidak menyilaukan. Kecerahan mengikuti setelan LAMPU. */
function NightBloom() {
  const { gl, scene, camera, size } = useThree();
  const nightBright = useUI((s) => s.nightBright);
  const built = useMemo(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(size.width, size.height), 0.42, 0.7, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    return { composer, bloom };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);
  useEffect(() => {
    built.composer.setPixelRatio(gl.getPixelRatio());
    built.composer.setSize(size.width, size.height);
  }, [built, gl, size]);
  useEffect(() => {
    // REDUP / PAS / TERANG — semua tetap smooth, hangat dan elegan (bukan neon tajam)
    built.bloom.strength = [0.15, 0.22, 0.32][nightBright];
    built.bloom.radius = 0.55;
    built.bloom.threshold = 1.0;
    setGlowBoost([1.10, 1.18, 1.28][nightBright]);
  }, [built, nightBright]);
  useEffect(() => () => built.composer.dispose(), [built]);
  useFrame(() => built.composer.render(), 1);
  return null;
}

function NightBloomGate() {
  const night = useUI((s) => s.trackMode === "shibuya" && s.shibuyaTime === "malam");
  useEffect(() => {
    // siang hari: glow kembali 1:1 (tanpa boost HDR)
    if (!night) setGlowBoost(1);
  }, [night]);
  return night ? <NightBloom /> : null;
}

/** Sky dome + distant haze so the curved horizon fades nicely. */
const SKY_DAY = { top: "#249bed", mid: "#55b8f5", bot: "#ccecff" };
// Shibuya Night: deep midnight blue zenith melting into a clean, calm city ambient glow (NO purple/magenta cyberpunk!)
const SKY_NIGHT = { top: "#0b1220", mid: "#18243b", bot: "#24324d" };
// Siang berawan yang lembut: zenith abu kebiruan turun ke horizon putih keperakan
const SKY_CLOUDY = { top: "#7d93ab", mid: "#c9d6e0", bot: "#eaf0f5" };
// Cuaca bersalju: gradien KHAS cantik & ceria (bukan kelabu muram) —
// zenith biru powder lembut -> tengah periwinkle cerah -> horizon blush kemerahan hangat
const SKY_SNOW = { top: "#6aa9ec", mid: "#b8d4f6", bot: "#ffe6dc" };
// Shibuya pagi: biru muda dengan horizon emas lembut
const SKY_PAGI = { top: "#4f9be0", mid: "#ffdab6", bot: "#ffedd6" };
// Shibuya sore: senja — zenith biru tua, horizon oranye hangat
const SKY_SORE = { top: "#3d4f8f", mid: "#ff9e6e", bot: "#ffd9a0" };
function Sky() {
  const mode = useUI((s) => s.trackMode);
  const tod = useUI((s) => s.shibuyaTime);
  const cloudy = useUI((s) => s.weather === "cloudy");
  const snowW = useUI((s) => s.weather === "snow");
  const night = mode === "shibuya" && tod === "malam";
  const snow = snowW && !night;
  const mat = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      uniforms: { top: { value: new THREE.Color("#249bed") }, mid: { value: new THREE.Color("#55b8f5") }, bot: { value: new THREE.Color("#ccecff") } },
      vertexShader: /* glsl */ `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP;
        void main(){ float h = normalize(vP).y; vec3 c = h > 0.0 ? mix(mid, top, pow(h, 0.5)) : mix(mid, bot, clamp(-h*3.0,0.0,1.0)); gl_FragColor = vec4(c,1.0);
          #include <colorspace_fragment>
        }`,
    });
    return m;
  }, []);
  useEffect(() => {
    const pal = night
      ? SKY_NIGHT
      : snow
        ? SKY_SNOW
        : cloudy
          ? SKY_CLOUDY
          : mode === "shibuya" && tod === "pagi"
          ? SKY_PAGI
          : mode === "shibuya" && tod === "sore"
            ? SKY_SORE
            : SKY_DAY;
    (mat.uniforms.top.value as THREE.Color).set(pal.top);
    (mat.uniforms.mid.value as THREE.Color).set(pal.mid);
    (mat.uniforms.bot.value as THREE.Color).set(pal.bot);
  }, [night, snow, cloudy, mode, tod, mat]);
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.copy(camera.position);
  });
  return (
    <mesh ref={ref} material={mat} frustumCulled={false} renderOrder={-100}>
      <sphereGeometry args={[150, 24, 16]} />
    </mesh>
  );
}

/** Hujan salju lembut: ~1500 butir dalam box 96×26×96 yang mengikuti kamera (wrap-around), angin ombak + kelepak per butir. */
function Snowfall() {
  const snowOn = useUI((s) => s.weather === "snow");
  const ref = useRef<THREE.Points>(null);
  const fade = useRef(0);
  const { geo, mat } = useMemo(() => {
    const COUNT = 4000;
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = Math.random() * 96;
      pos[i * 3 + 1] = Math.random() * 26;
      pos[i * 3 + 2] = Math.random() * 96;
      seed[i * 3] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6); // jangan culled saat wrap
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      uniforms: {
        uTime: { value: 0 },
        uFade: { value: 0 },
        uPx: { value: 700 },
        uAnchor: { value: new THREE.Vector3() },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform float uPx;
        uniform vec3 uAnchor;
        attribute vec3 aSeed;
        varying float vA;
        varying float vS;
        void main() {
          vec3 p = position;
          float t = uTime * ( 0.85 + aSeed.y * 0.6 );
          p.x = mod( p.x + t * ( 1.35 + aSeed.x * 0.95 ) + sin( uTime * 0.75 + aSeed.z * 6.2831 ) * 0.9, 96.0 );
          p.z = mod( p.z + t * ( 0.8 + aSeed.y * 0.6 ) + cos( uTime * 0.6 + aSeed.x * 6.2831 ) * 0.9, 96.0 );
          p.y = mod( p.y - t * ( 3.4 + aSeed.x * 2.1 ), 26.0 );
          vec3 wp = uAnchor + p - vec3( 48.0, 7.0, 48.0 );
          vec4 mv = modelViewMatrix * vec4( wp, 1.0 );
          gl_Position = projectionMatrix * mv;
          float dist = max( -mv.z, 0.5 );
          gl_PointSize = clamp( ( 0.21 + aSeed.z * 0.17 ) * uPx / dist, 1.3, 13.0 );
          vA = smoothstep( 70.0, 26.0, dist );            // pudar pelan di kejauhan (ikut kabut)
          vA *= smoothstep( 0.5, 2.5, dist );             // jangan menutupi lensa
          vS = aSeed.y;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uFade;
        varying float vA;
        varying float vS;
        void main() {
          vec2 q = gl_PointCoord - 0.5;
          float d = length( q );
          float a = smoothstep( 0.5, 0.10, d ) * vA * uFade * ( 0.72 + 0.28 * vS );
          if ( a < 0.004 ) discard;
          gl_FragColor = vec4( vec3( 0.965, 0.98, 1.0 ), a );
        }`,
    });
    return { geo, mat };
  }, []);
  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);
  useFrame(({ camera, gl }, dt) => {
    const target = snowOn ? 1 : 0;
    fade.current += (target - fade.current) * Math.min(1, dt * 1.4);
    if (fade.current < 0.01 && !snowOn) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    if (ref.current) ref.current.visible = true;
    mat.uniforms.uTime.value += dt;
    mat.uniforms.uFade.value = fade.current;
    mat.uniforms.uPx.value = (gl.domElement.height / 2) * (camera as THREE.PerspectiveCamera).projectionMatrix.elements[5] * 0.5;
    // ikut kamera tetapi di-kuantisasi supaya salju tidak "nyetir" bersama kamera
    const a = mat.uniforms.uAnchor.value as THREE.Vector3;
    a.set(Math.floor(camera.position.x / 2) * 2, camera.position.y, Math.floor(camera.position.z / 2) * 2);
  });
  return <points ref={ref} geometry={geo} material={mat} frustumCulled={false} visible={false} renderOrder={50} />;
}

export function Scene({ onContextLost }: { onContextLost?: () => void }) {
  return (
    <Canvas
      shadows
      flat
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "default", alpha: false }}
      camera={{ fov: 60, near: 0.3, far: 220, position: [-8, 5, 0] }}
      onCreated={({ scene, gl }) => {
        gl.setClearColor("#bfe3ff");
        // If this GPU/driver rejects the curved-world shader, fall back to stock shaders + plain fog
        gl.debug.onShaderError = (ctx, program, vs, fs) => {
          console.error("[pigeon-sk8] shader failed, disabling world curve:", ctx.getProgramInfoLog(program), ctx.getShaderInfoLog(vs), ctx.getShaderInfoLog(fs));
          disableCurve(scene);
          scene.fog = new THREE.Fog("#dbeeff", 90, 170);
        };
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost?.();
        });
        (window as unknown as { __pigeon?: Record<string, unknown> }).__pigeon = {
          ...((window as unknown as { __pigeon?: Record<string, unknown> }).__pigeon ?? {}),
          gl,
          scene,
          disableCurve: () => {
            disableCurve(scene);
            scene.fog = new THREE.Fog("#dbeeff", 90, 170);
          },
        };
      }}
      style={{ position: "absolute", inset: 0, touchAction: "none", filter: "saturate(1.28) contrast(1.06) brightness(1.055)" }}
    >
      <CameraRig />
      <NightBloomGate />
      <Lights />
      <Loop />
      <Sky />
      <Backdrop />
      <World />
      <Snowfall />
      <Player />
    </Canvas>
  );
}
