import { memo, useEffect, useMemo, useReducer, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { buildVoxelPair, getGeometry, getGeometryPair, glossyGroundMaterial, glowMaterial, pick, transparentVoxelMaterial, voxelMaterial, type GeoPair } from "./voxel";
import { applyCurve } from "./curve";
import {
  CHUNK_LEN,
  barrierParts,
  benchParts,
  boxesParts,
  breadParts,
  buildingParts,
  bushParts,
  carParts,
  carLightParts,
  crossCarLightParts,
  motoLightParts,
  chickenParts,
  motorcycleParts,
  CANE_GRIP_Y,
  caneParts,
  coneParts,
  flowersParts,
  hydrantParts,
  lampParts,
  planterParts,
  rampParts,
  railParts,
  signDiamondParts,
  signExclaimParts,
  trashParts,
  treeParts,
  railsParts,
  gatePoleParts,
  gateArmParts,
  trainSignParts,
  stopPoleParts,
  crossingNameplateParts,
  GATE_LAT,
  ARM_PIVOT_H,
  TRAIN_CAR_LEN,
  TRAIN_GAP,
  roadworkSignParts,
  roadworkFenceParts,
  jackhammerParts,
  dirtPileParts,
  workerParts,
  pedestrianHeadParts,
  pedestrianTorsoParts,
  pedestrianArmParts,
  pedestrianLegParts,
  kamenRiderHeadParts,
  kamenRiderTorsoParts,
  kamenRiderArmParts,
  kamenRiderLegParts,
  specialCarParts,
  briefcaseParts,
  isSuitVariant,
  guardFenceParts,
  sidewalkPlanterParts,
  snowDriftParts,
  overpassParts,
  overpassCarParts,
  puddleParts,
  OVERPASS_H,
  nosCanParts,
  rocketParts,
  diamondParts,
  crownParts,
  letterBadgeParts,
  sakuraParts,
  stoneLanternParts,
  petalParts,
  japaneseHouseParts,
  japaneseVillageHouseParts,
  hakoneTrainCarParts,
  catenaryParts,
  intersectionRoadParts,
  INTERSECTION_W_WIDE,
  trafficLightParts,
  intersectionSignParts,
  crossingCarParts,
  guardrailParts,
  chevronSignParts,
  autumnTreeParts,
  mountainRockParts,
  vendingParts,
  mamachariParts,
  neonSignboardParts,
  billboardParts,
  jamCarParts,
  avenueLampParts,
  stopSignParts,
  pedCrossingSignParts,
  scrambleRoadParts,
  tougeRouteSignParts,
  tougeStreetlampParts,
  momijiLeafParts,
  catSleepingParts,
  catWalkParts,
  catRagdollFlyingParts,
  subwayPortalParts,
  subwayTunnelRibParts,
  subwayWallParts,
  subwayTrackParts,
  subwayTrainCarParts,
  subwayOverheadRailParts,
  cityBusObstacleParts,
  SUBWAY_CAR_LEN,
  SUBWAY_GAP,
} from "./models";
import { useUI, type TrackMode } from "./store";
import { getRayTexture } from "./rays";
import { getAssetData } from "../shibuya/voxel/models";
import { buildAssetObject, disposeAsset } from "../shibuya/voxel/renderModel";
import { citizenActivityModel } from "../shibuya/world/citizenActivities";
import {
  engine,
  track,
  ARM_S,
  CAT_SCALE,
  CHICKEN_SCALE,
  CHICKEN_SIZE_BOOST,
  OBSTACLE_DEFS,
  type Chunk,
  type Crossing,
  crossCarH,
  trafficSignalApproach,
  RARE_FLASH_T,
  type Intersection,
  type CrossTrafficCar,
  type Decor,
  type Mover,
  type Obstacle,
  type Train,
  type SubwayTrain,
  LANE_LAT,
} from "./engine";
import { buildGroundGeometry } from "./ground";
import { getShibuyaBuildingGeoPair, type ShibuyaBuildingId } from "./shibuyaBuildingModels";
import {
  getShibuyaAnimalWorldGeo,
  getShibuyaBathGeo,
  getShibuyaCharacterGeo,
  getShibuyaRamenCustomerGeo,
  getShibuyaShopperGeo,
  getShibuyaMotorcycleGeo,
  getShibuyaMotorcycleLightsGeo,
  getShibuyaSalarymanGeo,
} from "./shibuyaPacks";

type RamenCustomerId = "salaryman" | "student" | "yakuza" | "sumo" | "chef";

const RamenCustomerView = memo(function RamenCustomerView({
  d,
  customer,
  rotationY,
}: {
  d: Decor;
  customer: RamenCustomerId;
  rotationY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const model = useMemo(() => {
    // Use the original Shibuya Blocks node hierarchy and its Eat/EatPause clips.
    // This keeps the bowl, chopsticks, arms, head and source body together.
    const source = getAssetData("characters", customer);
    const data = citizenActivityModel(source, customer, "ramen");
    const object = buildAssetObject(data);
    const diorama = object.getObjectByName("Diorama");
    if (diorama) diorama.visible = false;
    object.updateMatrixWorld(true);

    const rawBounds = new THREE.Box3().setFromObject(object);
    const rawHeight = Math.max(0.001, rawBounds.max.y - rawBounds.min.y);
    const targetHeight = customer === "sumo" ? 1.82 : 1.74;
    const scale = targetHeight / rawHeight;
    object.scale.setScalar(scale);
    object.updateMatrixWorld(true);

    const bounds = new THREE.Box3().setFromObject(object);
    const characterRoot = object.getObjectByName(`character_${customer}_root`);
    object.position.set(
      characterRoot ? -characterRoot.position.x * scale : -(bounds.min.x + bounds.max.x) / 2,
      -bounds.min.y,
      characterRoot ? -characterRoot.position.z * scale : -(bounds.min.z + bounds.max.z) / 2,
    );
    object.updateMatrixWorld(true);
    return object;
  }, [customer]);

  const mixer = useMemo(() => {
    const next = new THREE.AnimationMixer(model);
    const clip = model.animations.find((animation) => animation.name === "Eat") ?? model.animations.find((animation) => animation.name === "EatPause");
    if (clip) {
      const action = next.clipAction(clip);
      action.play();
      next.setTime((Math.abs(d.variant) * 0.63) % clip.duration);
    }
    return next;
  }, [d.variant, model]);

  useEffect(() => () => {
    mixer.stopAllAction();
    mixer.uncacheRoot(model);
    disposeAsset(model);
  }, [mixer, model]);

  useFrame((_, delta) => {
    mixer.update(Math.min(delta, 0.05));
    if (groupRef.current) groupRef.current.position.y = d.pos[1] + Math.sin(engine.time * 2.1 + d.variant) * 0.012;
  });

  return <primitive ref={groupRef} object={model} position={d.pos} rotation-y={rotationY} />;
});

/* ---------- Decorations ---------- */
const DecorView = memo(function DecorView({ d }: { d: Decor }) {
  const groupRef = useRef<THREE.Group>(null);
  const isShibuya = useUI((state) => state.trackMode === "shibuya");
  // true saat panel karakter/trick sedang dibuka dari menu (kamera preview podium)
  const previewFocus = useUI((s) => s.phase === "menu" && (s.menuView === "skins" || s.menuView === "tricks"));
  const geo: GeoPair = useMemo(() => {
    switch (d.kind) {
      case "building":
        if (d.spec?.shibuyaAssetId) {
          return getShibuyaBuildingGeoPair(d.spec.shibuyaAssetId);
        }
        if (d.spec?.night) {
          const mapping: ShibuyaBuildingId[] = [
            "qfront",
            "neon",
            "skyscraper",
            "shibuya109",
            "station",
            "torii",
            "ramen",
            "izakaya",
            "konbini",
            "tokyotower",
            "machiya",
            "townhouse",
            "pagoda",
          ];
          const bldId = mapping[(d.spec.shibuyaType ?? 0) % mapping.length];
          return getShibuyaBuildingGeoPair(bldId);
        }
        return buildVoxelPair(buildingParts(d.spec!));
      case "tree":
        return getGeometryPair(`tree-${d.variant}`, () => treeParts(d.variant));
      case "lamp":
        return getGeometryPair("lamp", lampParts);
      case "hydrant":
        return getGeometryPair("hydrant", hydrantParts);
      case "bush":
        return getGeometryPair(`bush-${d.variant}`, () => bushParts(d.variant));
      case "flowers":
        return getGeometryPair(`flowers-${d.variant}`, () => flowersParts(d.variant));
      case "roadsign":
        return getGeometryPair("roadsign", roadworkSignParts);
      case "overpass":
        return getGeometryPair("overpass", overpassParts);
      case "puddle":
        return getGeometryPair(`puddle-${d.variant}`, () => puddleParts(d.variant));
      case "sakura": {
        const scale = (1.25 + (d.variant % 2) * 0.2) * (isShibuya ? 2 : 1);
        return getGeometryPair(`sakura-${d.variant}-${isShibuya ? "shibuya" : "standard"}`, () => sakuraParts(d.variant, scale));
      }
      case "lantern":
        return getGeometryPair("lantern", stoneLanternParts);
      case "ramen":
        return getShibuyaBuildingGeoPair("ramen");
      case "ramen_customer": {
        const customer = (["salaryman", "student", "yakuza", "sumo", "chef"] as const)[Math.abs(d.variant) % 5];
        return getShibuyaRamenCustomerGeo(customer);
      }
      case "shopper": {
        const customer = (["student", "salaryman", "sumo", "yakuza"] as const)[Math.abs(d.variant) % 4];
        return getShibuyaShopperGeo(customer);
      }
      case "machiya":
        return getShibuyaBuildingGeoPair("machiya");
      case "house":
        return getGeometryPair(`house-${d.variant % 2}`, () => japaneseHouseParts(d.variant));
      case "snow_drift":
        return getGeometryPair(`snowdrift-${Math.abs(d.variant) % 4}`, () => snowDriftParts(d.variant));
      case "village_house":
        return getGeometryPair(`village_house-${Math.abs(d.variant) % 3}`, () => japaneseVillageHouseParts(d.variant));
      case "guardrail":
        return getGeometryPair("guardrail", () => guardrailParts(CHUNK_LEN));
      case "chevron":
        return getGeometryPair(`chevron-${d.variant > 0 ? 1 : -1}`, () => chevronSignParts(d.variant > 0 ? 1 : -1));
      case "autumn_tree":
        return getGeometryPair(`autumn-${d.variant % 3}`, () => autumnTreeParts(d.variant));
      case "rock":
        return getGeometryPair(`rock-${d.variant % 2}`, () => mountainRockParts(d.variant));
      case "vending":
        return getGeometryPair(`vending-${d.variant % 3}`, () => vendingParts(d.variant));
      case "mamachari":
        return getGeometryPair(`mamachari-${d.variant % 4}`, () => mamachariParts(d.variant));
      case "konbini":
        return getShibuyaBuildingGeoPair("konbini");
      case "neon_sign":
        return getGeometryPair(`neon-${d.variant % 2}`, () => neonSignboardParts(d.variant));
      case "touge_sign":
        return getGeometryPair("touge-sign", tougeRouteSignParts);
      case "touge_lamp":
        return getGeometryPair("touge-lamp", tougeStreetlampParts);
      case "billboard":
        return getGeometryPair(`billboard-${d.variant % 3}`, () => billboardParts(d.variant));
      case "jam_car":
        return getGeometryPair(`jam-car-${d.variant % 5}`, () => jamCarParts(d.variant));
      case "special_car":
        // RWB / Skyline R34 / AE86 parkir — livery warna dienkode di variant
        return getGeometryPair(`special-car-${Math.abs(d.variant) % 12}`, () => specialCarParts(d.variant));
      case "tower109":
        return getShibuyaBuildingGeoPair("shibuya109");
      case "avenue_lamp":
        return getGeometryPair("avenue-lamp", avenueLampParts);
      case "guard_fence":
        return getGeometryPair("guard-fence", () => guardFenceParts(3.2));
      case "sidewalk_planter":
        return getGeometryPair(`sw-planter-${d.variant % 3}`, () => sidewalkPlanterParts(d.variant));
      case "subway_portal":
        return getGeometryPair(`subway-portal-${d.variant === 1 ? "exit" : "entry"}`, () => subwayPortalParts(d.variant === 1));
      case "subway_tunnel_rib":
        return getGeometryPair(`subway-rib-${d.variant % 3}`, () => subwayTunnelRibParts(d.variant));
      case "subway_wall":
        return getGeometryPair(`subway-wall-${d.variant % 3}`, () => subwayWallParts(6.0, d.variant));
      case "subway_track":
        return getGeometryPair("subway-track-bed", () => subwayTrackParts(6.0));
      case "subway_overhead_rail":
        return getGeometryPair("subway-overhead-rail", () => subwayOverheadRailParts(11.0));
      case "city_bus":
        return getGeometryPair(`city-bus-${d.variant % 2}`, () => cityBusObstacleParts(d.variant));
      default:
        return getGeometryPair("lamp", lampParts);
    }
  }, [d, isShibuya]);
  useEffect(() => {
    // Only dispose dynamically generated, non-cached building geometries
    if (d.kind === "building" && !d.spec?.shibuyaAssetId && !d.spec?.night)
      return () => {
        geo.lit.dispose();
        geo.glow?.dispose();
      };
  }, [d, geo]);
  useFrame(() => {
    if ((d.kind !== "ramen_customer" && d.kind !== "shopper") || !groupRef.current) return;
    // Reuse the Shibuya Blocks activity pose and add a tiny living motion.
    groupRef.current.position.y = d.pos[1] + Math.sin(engine.time * 2.2 + d.variant) * 0.018;
  });

  const facing =
    d.kind === "house" ||
    d.kind === "ramen" ||
    d.kind === "ramen_customer" ||
    d.kind === "shopper" ||
    d.kind === "machiya" ||
    d.kind === "building" ||
    d.kind === "village_house" ||
    d.kind === "konbini" ||
    d.kind === "vending" ||
    d.kind === "neon_sign" ||
    d.kind === "touge_sign" ||
    d.kind === "touge_lamp" ||
    d.kind === "billboard" ||
    d.kind === "tower109";
  // buildings face +z (toward the road); those placed on the camera side (front) are turned around
  const flip = facing && d.frontSide ? Math.PI : 0;
  if (d.kind === "ramen_customer") {
    const customer = (["salaryman", "student", "yakuza", "sumo", "chef"] as const)[Math.abs(d.variant) % 5];
    return <RamenCustomerView d={d} customer={customer} rotationY={d.rotY + flip} />;
  }
  // Saat panel karakter/trick terbuka di menu: kamera menyorot podium — pepohonan
  // di dekat podium disembunyikan supaya tidak menutupi pandangan ke merpati.
  if (previewFocus && (d.kind === "tree" || d.kind === "sakura" || d.kind === "bush")) {
    const dx = d.pos[0] - engine.player.wx;
    const dz = d.pos[2] - engine.player.wz;
    if (dx * dx + dz * dz < 15 * 15) return null;
  }
  return (
    <group ref={groupRef} position={d.pos} rotation-y={d.rotY + flip} scale={d.spec?.assetScale ?? 1}>
      <mesh geometry={geo.lit} material={voxelMaterial} castShadow={d.kind !== "flowers"} receiveShadow />
      {geo.glow && <mesh geometry={geo.glow} material={glowMaterial} />}
      {geo.transparent && <mesh geometry={geo.transparent} material={transparentVoxelMaterial} renderOrder={2} />}
    </group>
  );
});

const ChunkView = memo(function ChunkView({ chunk }: { chunk: Chunk }) {
  const geo = useMemo(() => {
    return buildGroundGeometry(track, chunk.s0, CHUNK_LEN, chunk.kind, (sc) => {
      const atInter = engine.intersections.some((it) => Math.abs(it.s - sc) < (it.scramble ? 11.5 : it.wide ? 10.5 : 8.5));
      const atCross = engine.crossings.some((cr) => Math.abs(cr.s - sc) < 8.5);
      const inTun = engine.subwayTunnels.some((st) => sc >= st.startS - 2 && sc <= st.endS + 2);
      return atInter || atCross || inTun;
    });
  }, [chunk]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <group>
      {/* Shibuya: aspal halus glossy memantulkan kilau lampu kota */}
      <mesh geometry={geo} material={chunk.kind === "shibuya" ? glossyGroundMaterial : voxelMaterial} receiveShadow />
      {chunk.decor.map((d, i) => (
        <DecorView key={i} d={d} />
      ))}
    </group>
  );
});

/* ---------- Obstacles ---------- */
function obstacleGeometry(o: Obstacle) {
  switch (o.kind) {
    case "cone":
      return getGeometry("cone", coneParts);
    case "trash":
      return getGeometry(`trash-${o.variant % 3}`, () => trashParts(o.variant));
    case "barrier":
      return getGeometry("barrier", barrierParts);
    case "bench":
      return getGeometry("bench", benchParts);
    case "boxes":
      return getGeometry("boxes", boxesParts);
    case "planter":
      return getGeometry("planter", planterParts);
    case "car":
      return getGeometry(`car-${o.variant % 7}`, () => carParts(o.variant));
    case "ramp":
      return getGeometry("ramp", rampParts);
    case "rail": {
      const L = (o.half ?? OBSTACLE_DEFS.rail.halfLen) * 2;
      return getGeometry(`rail-${L}-${o.variant}`, () => railParts(L, o.variant));
    }
    case "fence":
      return getGeometry("fence", roadworkFenceParts);
    case "dirt":
      return getGeometry("dirt", dirtPileParts);
    case "jackhammer":
      return getGeometry("jackhammer", jackhammerParts);
    case "worker":
      return getGeometry(`worker-${o.variant % 2}`, () => workerParts(o.variant));
  }
}

const ObstacleView = memo(function ObstacleView({ o }: { o: Obstacle }) {
  const geo = useMemo(() => obstacleGeometry(o), [o]);
  const rotY = o.kind === "car" && o.flip ? Math.PI : o.kind === "fence" ? Math.PI / 2 : 0;
  const ref = useRef<THREE.Mesh>(null);
  const catRef = useRef<THREE.Mesh>(null);
  const animated = o.kind === "jackhammer" || o.kind === "worker";
  const hasSleepingCat = o.kind === "car" && o.catVariant !== undefined;
  const catGeo = useMemo(() => {
    if (!hasSleepingCat || o.catVariant === undefined) return null;
    return getGeometry(`cat-sleep-${o.catVariant % 4}`, () => catSleepingParts(o.catVariant!));
  }, [hasSleepingCat, o.catVariant]);

  useFrame(() => {
    if (catRef.current) {
      catRef.current.visible = !o.catHit;
      if (!o.catHit) {
        const t = engine.time;
        const breath = Math.sin(t * 3.5 + o.id) * 0.015;
        catRef.current.scale.set(CAT_SCALE * (1 + breath), CAT_SCALE * (1 + breath * 1.5), CAT_SCALE * (1 + breath));
      }
    }
    if (!animated || !ref.current) return;
    const t = engine.time;
    if (o.kind === "jackhammer") ref.current.position.y = Math.abs(Math.sin(t * 28)) * 0.06;
    else ref.current.position.y = Math.abs(Math.sin(t * 28)) * 0.03;
  });
  return (
    <group position={o.pos} quaternion={o.quat}>
      <mesh ref={ref} geometry={geo} material={voxelMaterial} rotation-y={rotY} castShadow receiveShadow />
      {catGeo && (
        <group position={[-0.15, 1.495, 0]} rotation-y={rotY}>
          <mesh ref={catRef} geometry={catGeo} material={voxelMaterial} castShadow receiveShadow />
        </group>
      )}
    </group>
  );
});

/* ---------- Movers: oncoming cars, crossing chickens & pedestrians ---------- */
const PED_SCALE = 1.06; // Skala pejalan kaki proporsional, alami, dan nyaman dilihat (~1.74m visual)
/* Telapak kaki model ada di y = -0.98 pada ruang lokal (grup kaki -0.34 + ujung sepatu -0.64).
   Setelah diskalakan, model harus diangkat 0.98 * skala supaya kaki MENAPAK di permukaan,
   bukan menembus jalan. */
const PED_LIFT = 0.98 * PED_SCALE + 0.005;
/* CAT_SCALE / CHICKEN_SCALE (ukuran hewan, sudah termasuk boost 1.7x & 1.2x)
   diimpor dari engine.ts supaya hitbox di sana selalu sinkron dengan model di sini. */

const PedestrianMover = memo(function PedestrianMover({ m }: { m: Mover }) {
  const rootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const headNormalRef = useRef<THREE.Mesh>(null);
  const headHitRef = useRef<THREE.Mesh>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const accRef = useRef<THREE.Group>(null);

  // kakek/nenek (elderly) punya geometri sendiri: rambut putih, kacamata, cardigan, tongkat
  const isElder = !!m.elderly;
  const snowW = useUI((s) => s.weather === "snow"); // mode salju: jaket tebal + kupluk
  const pedKey = `${m.variant % 8}${isElder ? "-old" : ""}${snowW ? "-w" : ""}`;
  const headNormalGeo = useMemo(() => getGeometry(`ped-head-${pedKey}-normal`, () => pedestrianHeadParts(m.variant, false, isElder, snowW)), [pedKey, m.variant, isElder, snowW]);
  const headHitGeo = useMemo(() => getGeometry(`ped-head-${pedKey}-hit`, () => pedestrianHeadParts(m.variant, true, isElder, snowW)), [pedKey, m.variant, isElder, snowW]);
  const torsoGeo = useMemo(() => getGeometry(`ped-torso-${pedKey}`, () => pedestrianTorsoParts(m.variant, isElder, false, snowW)), [pedKey, m.variant, isElder, snowW]);
  const armLGeo = useMemo(() => getGeometry(`ped-arm-${pedKey}-L`, () => pedestrianArmParts(m.variant, 1, isElder, false, snowW)), [pedKey, m.variant, isElder, snowW]);
  const armRGeo = useMemo(() => getGeometry(`ped-arm-${pedKey}-R`, () => pedestrianArmParts(m.variant, -1, isElder, isElder, snowW)), [pedKey, m.variant, isElder, snowW]);
  const legLGeo = useMemo(() => getGeometry(`ped-leg-${pedKey}-L`, () => pedestrianLegParts(m.variant, 1, isElder, snowW)), [pedKey, m.variant, isElder, snowW]);
  const legRGeo = useMemo(() => getGeometry(`ped-leg-${pedKey}-R`, () => pedestrianLegParts(m.variant, -1, isElder, snowW)), [pedKey, m.variant, isElder, snowW]);
  // tongkat kayu (cuma untuk lansia), dipegang tangan kanan dan ikut mengayun
  const caneGeo = useMemo(() => (isElder ? getGeometry("ped-cane", caneParts) : null), [isElder]);

  const accGeo = useMemo(() => {
    if (isElder) return null; // lansia bawa tongkat, bukan tas/payung
    // salaryman: tas kerja kulit DIKEMPIT di sisi badan (bukan tote/payung)
    if (isSuitVariant(m.variant)) return getGeometry(`ped-briefcase-${m.variant % 2}`, () => briefcaseParts(m.variant));
    if (m.variant % 3 === 1) {
      return getGeometry("ped-bag", () => [
        { x: 0.05, y: -0.28, z: 0.1, w: 0.28, h: 0.34, d: 0.1, color: "#f4e1b5" },
        { x: 0.05, y: -0.06, z: 0.1, w: 0.24, h: 0.12, d: 0.04, color: "#d2b988" },
      ]);
    }
    if (m.variant % 3 === 2) {
      const color = m.variant % 2 ? "#ff5c8a" : "#4cc9f0";
      return getGeometry(`ped-umb-${m.variant % 2}`, () => [
        { x: 0.1, y: 0.52, z: 0, w: 0.05, h: 1.1, d: 0.05, color: "#333333" },
        { x: 0.1, y: 1.12, z: 0, w: 1.0, h: 0.12, d: 1.0, color },
        { x: 0.1, y: 1.22, z: 0, w: 0.6, h: 0.1, d: 0.6, color: m.variant % 2 ? "#ff8fb1" : "#7fdbff" },
      ]);
    }
    return null;
  }, [m.variant, isElder]);

  useFrame(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const torso = torsoRef.current;
    const headN = headNormalRef.current;
    const headH = headHitRef.current;
    const headG = headGroupRef.current;
    const armL = armLRef.current;
    const armR = armRRef.current;
    const legL = legLRef.current;
    const legR = legRRef.current;
    if (!root || !inner || !torso || !headN || !headH || !headG || !armL || !armR || !legL || !legR) return;

    track.frame(m.s, m.lat, m.h, root.position);
    track.quat(m.s, root.quaternion);

    const isHit = m.phase === "hit" && !!m.rag;
    headN.visible = !isHit;
    headH.visible = isHit;

    if (isHit && m.rag) {
      // ---- FLOPPY DYNAMIC RAGDOLL PHYSICS (NOT STIFF!) ----
      inner.position.set(0, m.rag.radius, 0);
      inner.rotation.set(
        m.rag.rx,
        m.rag.ry + (m.dir > 0 ? -Math.PI / 2 : Math.PI / 2),
        m.rag.rz
      );
      inner.scale.setScalar(PED_SCALE);
      torso.position.set(0, 0, 0);

      const t = m.hitT;
      if (!m.rag.rest) {
        // Tumble in the air: flailing limbs, lolling head
        const flail = Math.sin(t * 18);
        const flail2 = Math.cos(t * 15);
        armL.rotation.set(Math.sin(t * 13) * 0.7, 0, 1.8 + flail * 0.6);
        armR.rotation.set(Math.cos(t * 13) * 0.7, 0, -1.8 - flail2 * 0.6);
        legL.rotation.set(Math.sin(t * 14 + 1) * 0.8, 0, 0.45 + Math.sin(t * 10) * 0.35);
        legR.rotation.set(-Math.sin(t * 14) * 0.8, 0, -0.45 - Math.sin(t * 10) * 0.35);
        headG.rotation.set(0.65 + Math.sin(t * 12) * 0.3, 0, Math.cos(t * 9) * 0.4);
        if (accRef.current) {
          accRef.current.rotation.set(t * 8, t * 10, t * 6);
        }
      } else {
        // Settled limp sprawl on the pavement with X X eyes and gaping open mouth
        armL.rotation.set(0.4, 0, 1.5);
        armR.rotation.set(-0.35, 0, -1.5);
        legL.rotation.set(-0.3, 0, 0.5);
        legR.rotation.set(0.5, 0, -0.25);
        headG.rotation.set(0.55, 0, -0.4);
      }
    } else {
      // ---- NATURAL WALKING / WAITING ANIMATION ----
      inner.position.set(0, PED_LIFT, 0);
      inner.rotation.set(0, m.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      inner.scale.setScalar(PED_SCALE);
      torso.position.set(0, 0, 0);

      if (m.phase === "hop") {
        if (isElder) {
          // Jalan santai teratur lansia dengan tongkat (langkah wajar, tidak kaku)
          const strideFreq = (m.speed / 0.75) * Math.PI;
          const step = Math.sin(m.hopT * strideFreq);
          legL.rotation.set(0, 0, step * 0.48);
          legR.rotation.set(0, 0, -step * 0.48);
          armL.rotation.set(0, 0, -step * 0.36);
          armR.rotation.set(0, 0, 0.16 + Math.abs(step) * 0.14);
          headG.rotation.set(0.08, Math.sin(m.hopT * 2.4) * 0.08, Math.sin(m.hopT * 4.8) * 0.02);
          torso.rotation.set(0, 0, 0.12);
          inner.position.y = PED_LIFT + Math.abs(Math.sin(m.hopT * strideFreq)) * 0.016;
        } else {
          // Langkah jalan kaki proporsional, santai, dan nyaman (panjang langkah pas, tidak kaku/shuffle)
          const strideFreq = (m.speed / 0.88) * Math.PI;
          const swing = Math.sin(m.hopT * strideFreq);
          legL.rotation.set(0, 0, swing * 0.62);
          legR.rotation.set(0, 0, -swing * 0.62);
          armL.rotation.set(0, 0, -swing * 0.48);
          armR.rotation.set(0, 0, swing * 0.48);
          headG.rotation.set(0, 0, Math.sin(m.hopT * strideFreq * 2) * 0.02);
          torso.rotation.set(0, 0, 0.04 + Math.sin(m.hopT * strideFreq * 2) * 0.01);
          inner.position.y = PED_LIFT + Math.abs(Math.sin(m.hopT * strideFreq)) * 0.026;
        }
      } else {
        legL.rotation.set(0, 0, 0);
        legR.rotation.set(0, 0, 0);
        armL.rotation.set(0, 0, 0);
        armR.rotation.set(0, 0, isElder ? 0.16 : 0);
        headG.rotation.set(0, isElder ? 0.1 : 0, 0);
        torso.rotation.set(0, 0, isElder ? 0.17 : 0);
      }
      if (accRef.current) {
        accRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={innerRef}>
        <group ref={torsoRef}>
          <mesh geometry={torsoGeo} material={voxelMaterial} castShadow receiveShadow />

          {/* Head & Face (switches to X X eyes and gaping mouth on hit) */}
          <group ref={headGroupRef} position={[0, 0.34, 0]}>
            <mesh ref={headNormalRef} geometry={headNormalGeo} material={voxelMaterial} castShadow />
            <mesh ref={headHitRef} geometry={headHitGeo} material={voxelMaterial} visible={false} castShadow />
          </group>

          {/* Left Arm & Accessory */}
          <group ref={armLRef} position={[0, 0.27, 0.34]}>
            <mesh geometry={armLGeo} material={voxelMaterial} castShadow />
            {accGeo && (
              <group ref={accRef}>
                <mesh geometry={accGeo} material={voxelMaterial} castShadow />
              </group>
            )}
          </group>

          {/* Right Arm (lansia menggenggam tongkat) */}
          <group ref={armRRef} position={[0, 0.27, -0.34]}>
            <mesh geometry={armRGeo} material={voxelMaterial} castShadow />
            {caneGeo && <mesh geometry={caneGeo} material={voxelMaterial} position={[0.02, CANE_GRIP_Y, 0]} castShadow />}
          </group>

          {/* Left Leg */}
          <group ref={legLRef} position={[0, -0.34, 0.11]}>
            <mesh geometry={legLGeo} material={voxelMaterial} castShadow receiveShadow />
          </group>

          {/* Right Leg */}
          <group ref={legRRef} position={[0, -0.34, -0.11]}>
            <mesh geometry={legRGeo} material={voxelMaterial} castShadow receiveShadow />
          </group>
        </group>
      </group>
    </group>
  );
});

const ShibuyaPedestrianMover = memo(function ShibuyaPedestrianMover({ m }: { m: Mover }) {
  const rootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const geo = useMemo(() => {
    if (m.shibuyaChar === "salaryman") return getShibuyaSalarymanGeo();
    return getShibuyaCharacterGeo(m.shibuyaChar ?? "salaryman");
  }, [m.shibuyaChar]);

  useFrame(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;

    track.frame(m.s, m.lat, m.h, root.position);
    track.quat(m.s, root.quaternion);

    const isHit = m.phase === "hit" && !!m.rag;
    if (isHit && m.rag) {
      inner.position.set(0, m.rag.radius, 0);
      inner.rotation.set(
        m.rag.rx,
        m.rag.ry + (m.dir > 0 ? -Math.PI / 2 : Math.PI / 2),
        m.rag.rz
      );
      inner.scale.setScalar(1);
    } else {
      inner.position.set(0, 0, 0);
      inner.rotation.set(0, m.dir > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      inner.scale.setScalar(1);
      if (m.phase === "hop") {
        const strideFreq = (m.speed / 0.88) * Math.PI;
        inner.position.y = Math.abs(Math.sin(m.hopT * strideFreq)) * 0.04;
        inner.rotation.z = Math.sin(m.hopT * strideFreq) * 0.05;
      }
    }
  });

  return (
    <group ref={rootRef}>
      <group ref={innerRef}>
        <mesh geometry={geo} material={voxelMaterial} castShadow receiveShadow />
      </group>
    </group>
  );
});

const MoverView = memo(function MoverView({
  m,
  register,
  registerSign,
}: {
  m: Mover;
  register: (id: number, g: THREE.Group | null) => void;
  registerSign: (id: number, g: THREE.Group | null) => void;
}) {
  const isAnimal = m.kind === "cat" || m.kind === "chicken" || m.kind === "shibuya_animal";
  /**
   * Kilatan putih ("denyut") pada tubuh hewan tepat setelah di-YEET: material
   * klon dari voxelMaterial dengan emissive, dipakai hanya oleh hewan.
   */
  const flashMat = useMemo(() => {
    if (!isAnimal) return null;
    const mat = applyCurve(voxelMaterial.clone());
    mat.emissive = new THREE.Color("#fff8e1");
    mat.emissiveIntensity = 0;
    return mat;
  }, [isAnimal]);
  useEffect(() => () => flashMat?.dispose(), [flashMat]);

  useFrame(() => {
    if (!flashMat) return;
    // kilatan badan yang tipis: nyala sebentar lalu cepat meredup (tanpa kedip lebay)
    if (m.phase === "hit") {
      flashMat.emissiveIntensity = 0.85 * Math.max(0, 1 - m.hitT / 0.22);
    } else {
      flashMat.emissiveIntensity = 0;
    }
  });

  const geo = useMemo(() => {
    if (m.kind === "car") {
      return getGeometry(`car-${m.variant % 7}`, () => carParts(m.variant));
    }
    if (m.kind === "motorcycle") {
      if (m.shibuyaMoto) {
        return getShibuyaMotorcycleGeo(m.shibuyaMoto, m.motorcycleHelmet !== false);
      }
      return getGeometry(`moto-${m.variant % 6}`, () => motorcycleParts(m.variant));
    }
    if (m.kind === "shibuya_animal") {
      return getShibuyaAnimalWorldGeo(m.shibuyaAnimal ?? "shiba");
    }
    if (m.kind === "cat") {
      if (m.phase === "hit") {
        return getGeometry(`cat-fly-${m.variant % 4}`, () => catRagdollFlyingParts(m.variant));
      }
      return getGeometry(`cat-walk-${m.variant % 4}`, () => catWalkParts(m.variant));
    }
    return getGeometry("chicken", chickenParts);
  }, [m.kind, m.variant, m.phase, m.shibuyaMoto, m.motorcycleHelmet, m.shibuyaAnimal]);
  const bathGeo = useMemo(() => (
    m.kind === "shibuya_animal" && m.shibuyaAnimalActivity === "bathing" && (m.shibuyaAnimal === "monkey" || m.shibuyaAnimal === "capybara")
      ? getShibuyaBathGeo()
      : null
  ), [m.kind, m.shibuyaAnimal, m.shibuyaAnimalActivity]);
  const diamond = useMemo(() => getGeometry("sign-diamond", signDiamondParts), []);
  const exclaim = useMemo(() => getGeometry("sign-ex", signExclaimParts), []);
  const night = useUI((s) => s.trackMode === "shibuya" && s.shibuyaTime === "malam");
  const lightsGeo = useMemo(() => {
    if (!night) return null;
    if (m.kind === "car") return getGeometry("car-lights", carLightParts);
    if (m.kind === "motorcycle") {
      if (m.shibuyaMoto) {
        return getShibuyaMotorcycleLightsGeo();
      }
      return getGeometry("moto-lights", motoLightParts);
    }
    return null;
  }, [night, m.kind, m.shibuyaMoto]);
  const animalActivityRot = m.kind === "shibuya_animal" && m.shibuyaAnimalActivity !== "crossing"
    ? (m.shibuyaAnimalSide === 1 ? -Math.PI / 2 : Math.PI / 2)
    : null;
  // Vehicles keep the explicit π-facing-player orientation; activity actors
  // only override the animal's local facing direction.
  const innerRot = m.kind === "car" || m.kind === "motorcycle" ? Math.PI : animalActivityRot ?? (m.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  return (
    <>
      <group ref={(g) => register(m.id, g)}>
        <group rotation-y={innerRot}>
          <mesh geometry={geo} material={flashMat ?? voxelMaterial} castShadow receiveShadow />
          {bathGeo && <mesh geometry={bathGeo} material={voxelMaterial} castShadow receiveShadow />}
          {lightsGeo && <mesh geometry={lightsGeo} material={glowMaterial} />}
        </group>
      </group>
      {(m.kind === "car" || m.kind === "motorcycle") && (
        <group ref={(g) => registerSign(m.id, g)} visible={false}>
          <group rotation-z={Math.PI / 4}>
            <mesh geometry={diamond} material={voxelMaterial} />
          </group>
          <mesh geometry={exclaim} material={voxelMaterial} />
        </group>
      )}
    </>
  );
});

function Movers() {
  const { camera } = useThree();
  const refs = useRef(new Map<number, THREE.Group>());
  const signs = useRef(new Map<number, THREE.Group>());
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const register = useMemo(
    () => (id: number, g: THREE.Group | null) => {
      if (g) refs.current.set(id, g);
      else refs.current.delete(id);
    },
    [],
  );
  const registerSign = useMemo(
    () => (id: number, g: THREE.Group | null) => {
      if (g) signs.current.set(id, g);
      else signs.current.delete(id);
    },
    [],
  );

  useFrame(() => {
    if (engine.moverVersion !== seen.current) {
      seen.current = engine.moverVersion;
      force();
    }
    const t = engine.time;
    const d = engine.distance;
    for (const m of engine.movers) {
      if (m.kind === "pedestrian") continue; // PedestrianMover handles its own transform & limbs
      const g = refs.current.get(m.id);
      if (g) {
        track.frame(m.s, m.lat, m.h, g.position);
        track.quat(m.s, g.quaternion);
        if (m.phase === "hit" && m.rag) {
          // ragdoll: tumble with the rigid body, pivot at its center
          const inner = g.children[0];
          inner.position.set(0, m.rag.radius, 0);
          inner.rotation.set(m.rag.rx, m.rag.ry + (m.kind === "car" ? Math.PI : m.dir > 0 ? -Math.PI / 2 : Math.PI / 2), m.rag.rz);
          if (m.kind === "cat") {
            const flutter = !m.rag.rest ? Math.sin(t * 24 + m.id) * 0.08 : 0;
            inner.scale.set(CAT_SCALE * (1 + flutter), CAT_SCALE * (1 - flutter * 0.5), CAT_SCALE * (1 + flutter));
          } else if (m.kind === "chicken") {
            inner.scale.setScalar(CHICKEN_SCALE);
          } else if (m.kind === "shibuya_animal") {
            inner.scale.setScalar(1);
          } else {
            inner.scale.setScalar(1);
          }
          const child = inner.children[0];
          // Body offset from the ragdoll pivot also follows the size boost, so the
          // bigger chicken/cat still lies flat on the asphalt during the ragdoll tumble.
          if (child) {
            child.position.set(0, m.kind === "cat" ? 0 : m.kind === "chicken" ? -0.32 * CHICKEN_SIZE_BOOST : m.kind === "shibuya_animal" ? -0.2 : -0.55, 0);
          }
        } else if (m.kind === "shibuya_animal") {
          const inner = g.children[0];
          inner.position.set(0, 0, 0);
          if (inner.children[0]) inner.children[0].position.set(0, 0, 0);
          const activity = m.shibuyaAnimalActivity ?? "crossing";
          if (activity === "crossing") {
            const walk = Math.abs(Math.sin(m.hopT * 11)) * 0.035;
            inner.position.y = walk;
            inner.rotation.x = Math.sin(m.hopT * 11) * 0.04;
          } else if (activity === "waving") {
            // The source rig is flattened for the runner, so a gentle readable
            // side-to-side greeting keeps the unchanged animal silhouette alive
            // without replacing it with an approximate model.
            inner.position.y = 0.025 + Math.abs(Math.sin(t * 3.2 + m.id)) * 0.018;
            inner.rotation.z = Math.sin(t * 3.2 + m.id) * 0.08;
          } else {
            // Onsen scene: the animal and the separate bath/steam geometry bob
            // together beside the storefront, visibly distinct from crossers.
            inner.position.y = 0.018 + Math.sin(t * 2.1 + m.id) * 0.012;
            inner.rotation.x = Math.sin(t * 2.1 + m.id) * 0.025;
          }
          inner.scale.setScalar(1);
        } else if (m.kind === "cat") {
          const inner = g.children[0];
          inner.position.set(0, 0, 0);
          if (inner.children[0]) inner.children[0].position.set(0, 0, 0);
          // Walking/trotting animation across the road
          const walk = Math.abs(Math.sin(m.hopT * 12)) * 0.04;
          inner.position.y = walk;
          inner.rotation.x = Math.sin(m.hopT * 12) * 0.05;
          inner.scale.setScalar(CAT_SCALE);
        } else if (m.kind === "chicken") {
          const inner = g.children[0];
          inner.position.set(0, 0, 0);
          if (inner.children[0]) inner.children[0].position.set(0, 0, 0);
          if (m.phase === "hop") {
            const u = Math.min(1, m.hopT);
            const st = Math.sin(Math.PI * u);
            inner.scale.set(CHICKEN_SCALE * (1 - 0.12 * st), CHICKEN_SCALE * (1 + 0.25 * st), CHICKEN_SCALE * (1 - 0.12 * st));
            inner.rotation.x = 0;
          } else {
            const sq = m.squash * 0.25;
            const peck = m.phase === "wait" ? Math.abs(Math.sin(t * 5 + m.variant)) * 0.06 : 0;
            inner.scale.set(CHICKEN_SCALE * (1 + sq), CHICKEN_SCALE * (1 - sq - peck), CHICKEN_SCALE * (1 + sq));
            inner.rotation.x = 0;
          }
        } else if (m.kind === "car" || m.kind === "motorcycle") {
          const inner = g.children[0];
          inner.position.set(0, 0, 0);
          if (inner.children[0]) inner.children[0].position.set(0, 0, 0);
          // PENTING: kendaraan dari arah depan harus menghadap KITA (yaw = pi).
          // Dulu baris ini menimpa yaw-nya jadi 0, sehingga mobil & motor melaju mundur
          // (moncong + pengendaranya membelakangi pemain).
          inner.rotation.set(0, Math.PI, 0);
          const sq = (m.squash || 0) * 0.14;
          inner.scale.set(1 + sq * 0.35, 1 - sq, 1 + sq * 0.35);
          inner.position.y = Math.sin(t * 18 + m.variant) * 0.015 - sq * 0.25;
          if (m.kind === "motorcycle") {
            // motor & pengendaranya SELALU TEGAK (jangan miring/rebah saat melaju);
            // cukup getaran mesin vertikal yang sangat halus supaya tetap terasa hidup.
            inner.scale.set(1 + sq * 0.3, 1 - sq, 1 + sq * 0.3);
            inner.rotation.z = 0;
            inner.rotation.x = 0;
            inner.position.y += Math.abs(Math.sin(t * 26 + m.id)) * 0.006 - sq * 0.2;
          }
        }
      }
      const sg = signs.current.get(m.id);
      if (sg) {
        const vehicleDistance = m.s - d;
        // PSA is visible only in the readable 40 m -> 20 m approach window.
        const show = m.warned && engine.phase === "playing" && vehicleDistance <= 40 && vehicleDistance >= 20;
        sg.visible = show;
        if (show) {
          // The warning is attached directly above the incoming vehicle, never
          // parked on the shoulder or over the player's lane.
          track.frame(m.s, m.lat, 2.2 + Math.sin(t * 6) * 0.08, sg.position);
          sg.quaternion.copy(camera.quaternion);
          const pulse = 0.7 + 0.06 * Math.sin(t * 10);
          sg.scale.setScalar(pulse);
        }
      }
    }
  });

  return (
    <>
      {engine.movers.map((m) =>
        m.kind === "pedestrian" ? (
          m.shibuyaChar ? (
            <ShibuyaPedestrianMover key={m.id} m={m} />
          ) : (
            <PedestrianMover key={m.id} m={m} />
          )
        ) : (
          <MoverView key={m.id} m={m} register={register} registerSign={registerSign} />
        )
      )}
    </>
  );
}

/* ---------- Railway crossings (Japanese style) ---------- */
const lampOn = new THREE.MeshBasicMaterial({ color: "#ff2a2a" });
const lampOff = new THREE.MeshBasicMaterial({ color: "#4d1010" });
const lampGeo = new THREE.BoxGeometry(0.06, 0.3, 0.3);
const glowGeo = new THREE.PlaneGeometry(0.9, 0.9);
const glowMat = new THREE.MeshBasicMaterial({ color: "#ff3b3b", transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });

const CrossingView = memo(function CrossingView({ cr }: { cr: Crossing }) {
  const rails = useMemo(() => getGeometry("rails", railsParts), []);
  const pole = useMemo(() => getGeometry("gate-pole", gatePoleParts), []);
  const arm = useMemo(() => getGeometry("gate-arm", gateArmParts), []);
  const sign = useMemo(() => getGeometry("train-sign", trainSignParts), []);
  const stopPole = useMemo(() => getGeometry("stop-pole", stopPoleParts), []);
  const plate = useMemo(() => getGeometry("crossing-plate", crossingNameplateParts), []);
  const catenary = useMemo(() => getGeometry("catenary", () => catenaryParts()), []);
  const arms = useRef<(THREE.Group | null)[]>([]);
  const lamps = useRef<(THREE.Mesh | null)[]>([]);
  const glows = useRef<(THREE.Mesh | null)[]>([]);
  const glowMats = useMemo(() => Array.from({ length: 8 }, () => glowMat.clone()), []);
  const signPos2 = useMemo(() => {
    // second sign on the far side of the road, same distance before the rails
    const v = track.frame(cr.s - 24, -4.9, 0.12);
    return [v.x, v.y, v.z] as [number, number, number];
  }, [cr]);

  useFrame(() => {
    const a = -(Math.PI / 2) * (1 - cr.armT);
    for (const g of arms.current) if (g) g.rotation.x = a;
    const active = cr.state === "warning" || cr.state === "clearing";
    const phase = Math.floor(cr.lightPhase / 0.42) % 2;
    lamps.current.forEach((m, i) => {
      if (m) m.material = active && i % 2 === phase ? lampOn : lampOff;
    });
    glows.current.forEach((m, i) => {
      if (!m) return;
      const on = active && i % 2 === phase;
      if (glowMats[i]) glowMats[i].opacity = on ? 0.45 : 0;
    });
  });

  return (
    <group>
      <group position={cr.pos} rotation-y={cr.rotY}>
        <mesh geometry={rails} material={voxelMaterial} receiveShadow />
        <mesh geometry={catenary} material={voxelMaterial} />
        {/* Near gates (facing skater) and Far gates (facing oncoming traffic) */}
        {[-1, 1].flatMap((zSide, zi) =>
          [-1, 1].map((xSide, xi) => {
            const gi = zi * 2 + xi;
            const xPos = xSide * ARM_S;
            return (
              <group key={`${zSide}_${xSide}`} position={[xPos, 0, zSide * GATE_LAT]} scale={[xSide, 1, -zSide * xSide]}>
                <mesh geometry={pole} material={voxelMaterial} castShadow />
                <mesh geometry={plate} material={voxelMaterial} />
                {/* boom pivots on the motor box behind the mast, arm swings over the road */}
                <group
                  ref={(g) => {
                    arms.current[gi] = g;
                  }}
                  position={[0.3, ARM_PIVOT_H, 0.2]}
                >
                  <mesh geometry={arm} material={voxelMaterial} castShadow />
                </group>
                {/* twin flashers: lens + soft glow */}
                {[-0.32, 0.32].map((lz, li) => (
                  <group key={li} position={[-0.29, 2.62, lz]}>
                    <mesh
                      ref={(m) => {
                        lamps.current[gi * 2 + li] = m;
                      }}
                      geometry={lampGeo}
                      material={lampOff}
                    />
                    <mesh
                      ref={(m) => {
                        glows.current[gi * 2 + li] = m;
                      }}
                      geometry={glowGeo}
                      material={glowMats[gi * 2 + li]}
                      position={[-0.06, 0, 0]}
                      rotation-y={-Math.PI / 2}
                    />
                  </group>
                ))}
                {/* stop-line bollards at the curb before the gate */}
                <mesh geometry={stopPole} material={voxelMaterial} position={[-1.6, 0, -0.55]} castShadow />
              </group>
            );
          })
        )}
      </group>
      <mesh geometry={sign} material={voxelMaterial} position={cr.signPos} rotation-y={cr.signRotY} castShadow />
      <mesh geometry={sign} material={voxelMaterial} position={signPos2} rotation-y={cr.signRotY} castShadow />
    </group>
  );
});

function Crossings() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
  });
  return (
    <>
      {engine.crossings.map((c) => (
        <CrossingView key={c.id} cr={c} />
      ))}
    </>
  );
}

const TrainView = memo(function TrainView({ tr }: { tr: Train }) {
  const cars = useRef<(THREE.Group | null)[]>([]);
  const geos = useMemo(
    () =>
      Array.from({ length: tr.nCars }, (_, i) => {
        const cab = i === 0 ? tr.dir : i === tr.nCars - 1 ? -tr.dir : 0;
        const panto = i % 2 === 1;
        return getGeometry(`htrain-${cab}-${panto ? 1 : 0}`, () => hakoneTrainCarParts(cab as 0 | 1 | -1, panto));
      }),
    [tr],
  );
  const q = useMemo(() => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), tr.crossing.rotY), [tr]);
  useFrame(() => {
    for (let i = 0; i < tr.nCars; i++) {
      const g = cars.current[i];
      if (!g) continue;
      const lat = tr.head - tr.dir * (TRAIN_CAR_LEN / 2 + i * (TRAIN_CAR_LEN + TRAIN_GAP));
      track.frame(tr.crossing.s, lat, 0.16, g.position);
      g.quaternion.copy(q);
    }
  });
  return (
    <>
      {geos.map((g, i) => (
        <group
          key={i}
          ref={(el) => {
            cars.current[i] = el;
          }}
        >
          <mesh geometry={g} material={voxelMaterial} castShadow receiveShadow />
        </group>
      ))}
    </>
  );
});

function Trains() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.moverVersion !== seen.current) {
      seen.current = engine.moverVersion;
      force();
    }
  });
  return (
    <>
      {engine.trains.map((t) => (
        <TrainView key={t.id} tr={t} />
      ))}
    </>
  );
}

/* ---------- Shibuya Subway Opposing Trains ---------- */
const SubwayTrainView = memo(function SubwayTrainView({ st }: { st: SubwayTrain }) {
  const cars = useRef<(THREE.Group | null)[]>([]);
  const geos = useMemo(
    () =>
      Array.from({ length: st.nCars }, (_, i) => {
        const isFront = i === 0;
        const isRear = i === st.nCars - 1;
        const isShinkansen = !!st.isShinkansen;
        const isStopped = !!st.isStopped || st.speed === 0;
        const key = `subway-car-${st.line}-${isFront ? "front" : isRear ? "rear" : "mid"}-${isShinkansen ? "shinkansen" : "metro"}-${isStopped ? "stopped" : "run"}`;
        return getGeometryPair(key, () => subwayTrainCarParts(st.line, isFront, isRear, isShinkansen, isStopped));
      }),
    [st],
  );

  useFrame(() => {
    const lat = LANE_LAT[st.lane];
    for (let i = 0; i < st.nCars; i++) {
      const g = cars.current[i];
      if (!g) continue;
      const carS = st.s + SUBWAY_CAR_LEN / 2 + i * (SUBWAY_CAR_LEN + SUBWAY_GAP);
      track.frame(carS, lat, 0.04, g.position);
      track.quat(carS, g.quaternion);
    }
  });

  return (
    <>
      {geos.map((pair, i) => (
        <group
          key={i}
          ref={(el) => {
            cars.current[i] = el;
          }}
        >
          <mesh geometry={pair.lit} material={voxelMaterial} castShadow receiveShadow />
          {pair.glow && <mesh geometry={pair.glow} material={glowMaterial} />}
        </group>
      ))}
    </>
  );
});

function SubwayTrains() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.moverVersion !== seen.current) {
      seen.current = engine.moverVersion;
      force();
    }
  });
  return (
    <>
      {engine.subwayTrains.map((st) => (
        <SubwayTrainView key={st.id} st={st} />
      ))}
    </>
  );
}

/* ---------- Perempatan (4-Way Crossroads / Intersections) ---------- */
/** Penyeberang ambient di paruh jauh Scramble Crossing (median -> trotoar seberang).
 *  Murni visual: jalur pemain hanya diisi penyeberang SUNGGUHAN dari sistem mover. */
const ScrambleWalker = memo(function ScrambleWalker({ inter, idx }: { inter: Intersection; idx: number }) {
  const rootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  // varian 0..7: campuran kasual + salaryman berjas (5..7); idx 4 = anak sekolah ber-randoseru
  const variant = idx % 8;
  const kid = idx === 4;
  const snowW = useUI((s) => s.weather === "snow"); // mode salju: jaket tebal + kupluk
  const pedKey = `${variant}${kid ? "-kid" : ""}${snowW ? "-w" : ""}`;
  const headGeo = useMemo(() => getGeometry(`ped-head-${pedKey}-normal`, () => pedestrianHeadParts(variant, false, false, snowW)), [pedKey, variant, snowW]);
  const torsoGeo = useMemo(() => getGeometry(`ped-torso-${pedKey}`, () => pedestrianTorsoParts(variant, false, kid, snowW)), [pedKey, variant, kid, snowW]);
  const caseGeo = useMemo(() => (!kid && isSuitVariant(variant) && !snowW ? getGeometry(`ped-briefcase-${variant % 2}`, () => briefcaseParts(variant)) : null), [variant, kid, snowW]);
  const armLGeo = useMemo(() => getGeometry(`ped-arm-${pedKey}-L`, () => pedestrianArmParts(variant, 1, false, false, snowW)), [pedKey, variant, snowW]);
  const armRGeo = useMemo(() => getGeometry(`ped-arm-${pedKey}-R`, () => pedestrianArmParts(variant, -1, false, false, snowW)), [pedKey, variant, snowW]);
  const legLGeo = useMemo(() => getGeometry(`ped-leg-${pedKey}-L`, () => pedestrianLegParts(variant, 1, false, snowW)), [pedKey, variant, snowW]);
  const legRGeo = useMemo(() => getGeometry(`ped-leg-${pedKey}-R`, () => pedestrianLegParts(variant, -1, false, snowW)), [pedKey, variant, snowW]);
  const seed = useMemo(() => {
    const slot = -4.6 + (idx + 0.5) * (9.2 / 9); // tiap penyeberang punya "jalur" x sendiri
    const dirU = (idx % 2 === 0 ? 1 : -1) as 1 | -1;
    return {
      slot,
      x: slot + (Math.random() - 0.5) * 0.5,
      diag: (Math.random() - 0.5) * 1.2, // drift diagonal kecil, tetap di jalur masing-masing
      u: dirU > 0 ? 0 : 1,
      dirU,
      rate: 0.11 + Math.random() * 0.07, // kecepatan menyeberang (u/detik)
      cooldown: 0,
      waitingForRed: true,
      t0: Math.random() * 20,
    };
  }, [idx]);
  useFrame((_, dtRaw) => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    const dt = Math.min(dtRaw, 0.05);
    if (seed.cooldown > 0) {
      seed.cooldown -= dt;
      root.visible = false;
      if (seed.cooldown > 0) return;
      // Sudah sampai tujuan: jeda di luar layar, lalu mulai perjalanan baru ke arah yang sama.
      seed.u = seed.dirU > 0 ? 0 : 1;
      seed.x = seed.slot + (Math.random() - 0.5) * 0.5;
      seed.diag = (Math.random() - 0.5) * 1.2;
      seed.waitingForRed = true;
    }
    root.visible = true;
    const waitingAtLight = seed.waitingForRed && inter.lightState !== "red";
    if (seed.waitingForRed && !waitingAtLight) seed.waitingForRed = false;
    if (!waitingAtLight) seed.u += seed.dirU * seed.rate * dt;
    if (seed.dirU > 0 && seed.u >= 1) {
      seed.u = 1;
      seed.cooldown = 2.0 + (idx % 3) * 0.55;
      seed.waitingForRed = true;
      root.visible = false;
      return;
    }
    if (seed.dirU < 0 && seed.u <= 0) {
      seed.u = 0;
      seed.cooldown = 2.0 + (idx % 3) * 0.55;
      seed.waitingForRed = true;
      root.visible = false;
      return;
    }
    const lat = 4.2 + seed.u * 11.0; // median (4.2) -> trotoar seberang (15.2)
    const sPos = inter.s + seed.x + seed.diag * seed.u;
    // tinggi permukaan tepat menapak: median ter-aspal 0.18, dek jalan lintas/trotoar jauh 0.175, apron 0.03
    const h = lat < 5.2 ? 0.18 : lat > 12.25 ? 0.175 : 0.03;
    track.frame(sPos, lat, h, root.position);
    track.quat(sPos, root.quaternion);
    inner.rotation.y = seed.dirU > 0 ? -Math.PI / 2 : Math.PI / 2;
    const scl = PED_SCALE * (kid ? 0.62 : 1);
    inner.scale.setScalar(scl);
    const walkSpeed = waitingAtLight ? 0 : seed.rate * 11.0; // ~m/s dari laju u
    seed.t0 += dt * (walkSpeed / (0.62 * scl)) * Math.PI;
    const t = seed.t0;
    const swing = waitingAtLight ? 0 : Math.sin(t) * 0.4;
    if (legLRef.current) legLRef.current.rotation.z = swing;
    if (legRRef.current) legRRef.current.rotation.z = -swing;
    if (armLRef.current) armLRef.current.rotation.z = -swing * 0.55;
    if (armRRef.current) armRRef.current.rotation.z = swing * 0.55;
    inner.position.y = PED_LIFT + (waitingAtLight ? 0 : Math.abs(Math.sin(t)) * 0.018);
  });
  return (
    <group ref={rootRef}>
      <group ref={innerRef}>
        <mesh geometry={torsoGeo} material={voxelMaterial} />
        <group position={[0, 0.34, 0]} scale={kid ? 1.3 : 1}>
          <mesh geometry={headGeo} material={voxelMaterial} />
        </group>
        <group ref={armLRef} position={[0, 0.27, 0.34]}>
          <mesh geometry={armLGeo} material={voxelMaterial} />
          {caseGeo && <mesh geometry={caseGeo} material={voxelMaterial} />}
        </group>
        <group ref={armRRef} position={[0, 0.27, -0.34]}>
          <mesh geometry={armRGeo} material={voxelMaterial} />
        </group>
        <group ref={legLRef} position={[0, -0.34, 0.11]}>
          <mesh geometry={legLGeo} material={voxelMaterial} />
        </group>
        <group ref={legRRef} position={[0, -0.34, -0.11]}>
          <mesh geometry={legRGeo} material={voxelMaterial} />
        </group>
      </group>
    </group>
  );
});

const IntersectionView = memo(function IntersectionView({ inter, lightState }: { inter: Intersection; lightState: Intersection["lightState"] }) {
  const isShibuya = useUI((s) => s.trackMode) === "shibuya";
  const wide = !!inter.wide;
  const roadGeo = useMemo(
    () => getGeometry(wide ? "intersection-road-wide" : "intersection-road", () => intersectionRoadParts(wide ? INTERSECTION_W_WIDE : undefined)),
    [wide],
  );
  const scrambleGeo = useMemo(() => getGeometryPair("scramble-road", scrambleRoadParts), []);
  const signGeo = useMemo(() => getGeometry("intersection-sign", intersectionSignParts), []);
  const stopGeo = useMemo(() => getGeometryPair("stop-sign", stopSignParts), []);
  const pedSignGeo = useMemo(() => getGeometryPair("ped-crossing-sign", pedCrossingSignParts), []);
  const tlGeoGreen = useMemo(() => getGeometry("tl-green", () => trafficLightParts("green")), []);
  const tlGeoYellow = useMemo(() => getGeometry("tl-yellow", () => trafficLightParts("yellow")), []);
  const tlGeoRed = useMemo(() => getGeometry("tl-red", () => trafficLightParts("red")), []);

  const signPos2 = useMemo(() => {
    const v = track.frame(inter.s - 26, -4.9, 0.12);
    return [v.x, v.y, v.z] as [number, number, number];
  }, [inter]);

  const tlGeo = lightState === "green" ? tlGeoGreen : lightState === "yellow" ? tlGeoYellow : tlGeoRed;
  const cornerX = inter.scramble ? 7.2 : wide ? 7.0 : 4.6;
  const pair = (g: { lit: THREE.BufferGeometry; glow: THREE.BufferGeometry | null }, pos: [number, number, number], ry: number, key: string) => (
    <group key={key} position={pos} rotation-y={ry}>
      <mesh geometry={g.lit} material={voxelMaterial} castShadow />
      {g.glow && <mesh geometry={g.glow} material={glowMaterial} />}
    </group>
  );

  return (
    <group>
      {/* Crossroad asphalt and zebra crossings (scramble = perempatan raksasa selebar avenue) */}
      <group position={inter.pos} rotation-y={inter.rotY}>
        {inter.scramble ? (
          <>
            <mesh geometry={scrambleGeo.lit} material={voxelMaterial} receiveShadow />
            {scrambleGeo.glow && <mesh geometry={scrambleGeo.glow} material={glowMaterial} />}
          </>
        ) : (
          <mesh geometry={roadGeo} material={voxelMaterial} receiveShadow />
        )}
        {/* Traffic light posts at the corner sidewalk curbs */}
        {[-cornerX, cornerX].map((x) =>
          (isShibuya ? [-4.8, 13.1] : [-4.8, 4.8]).map((z) => (
            <mesh
              key={`${x}-${z}`}
              geometry={tlGeo}
              material={voxelMaterial}
              position={[x, isShibuya && z > 10 ? 0.18 : 0, z]}
              rotation-y={z > 0 ? 0 : Math.PI}
              castShadow
            />
          ))
        )}
        {/* Rambu disederhanakan di scramble agar marka dan pejalan kaki tetap jadi fokus. */}
        {inter.scramble ? (
          <>
            {pair(pedSignGeo, [-cornerX - 0.7, 0.18, -4.5], 0, "scramble-ps1")}
            {pair(pedSignGeo, [cornerX + 0.7, 0.18, 12.9], Math.PI, "scramble-ps2")}
          </>
        ) : (
          <>
            {pair(pedSignGeo, [-cornerX - 0.7, 0.18, -4.5], 0, "ps1")}
            {pair(pedSignGeo, [cornerX + 0.7, 0.18, 4.6], Math.PI, "ps2")}
            {pair(stopGeo, [cornerX + 0.6, 0.18, -4.5], Math.PI / 2, "st1")}
            {pair(stopGeo, [-cornerX - 0.6, 0.18, 4.6], -Math.PI / 2, "st2")}
            {isShibuya && pair(pedSignGeo, [cornerX + 0.7, 0.18, 12.9], Math.PI, "ps3")}
            {isShibuya && pair(stopGeo, [-cornerX - 0.6, 0.18, 12.9], -Math.PI / 2, "st3")}
          </>
        )}
      </group>
      {/* ⚠️ Perempatan warning signs placed ahead on both sides of the road */}
      <mesh geometry={signGeo} material={voxelMaterial} position={inter.signPos} rotation-y={inter.signRotY} castShadow />
      <mesh geometry={signGeo} material={voxelMaterial} position={signPos2} rotation-y={inter.signRotY} castShadow />
      {/* Kerumunan scramble: penyeberang ambient memenuhi paruh jauh avenue */}
      {inter.scramble && Array.from({ length: 9 }, (_, i) => <ScrambleWalker key={i} inter={inter} idx={i} />)}
    </group>
  );
});

function Intersections() {
  const seen = useRef(-1);
  const seenLights = useRef(new Map<number, Intersection["lightState"]>());
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    let lightChanged = false;
    for (const inter of engine.intersections) {
      if (seenLights.current.get(inter.id) !== inter.lightState) {
        seenLights.current.set(inter.id, inter.lightState);
        lightChanged = true;
      }
    }
    if (engine.listVersion !== seen.current || lightChanged) {
      seen.current = engine.listVersion;
      force();
    }
  });
  return (
    <>
      {engine.intersections.map((inter) => (
        <IntersectionView key={inter.id} inter={inter} lightState={inter.lightState} />
      ))}
    </>
  );
}

interface ShibuyaFlowCar {
  id: number;
  lat: number;
  s: number;
  speed: number;
  speedK: number;
  variant: number;
}

/** Arus padat di 3 jalur seberang median; berhenti di garis henti saat lampu merah/kuning. */
function ShibuyaTraffic() {
  const trackMode = useUI((s) => s.trackMode);
  const cars = useMemo<ShibuyaFlowCar[]>(() => {
    const lanes = [6.2, 8.6, 11.0];
    return Array.from({ length: 24 }, (_, id) => {
      const lane = Math.floor(id / 8);
      const slot = id % 8;
      return {
        id,
        lat: lanes[lane],
        s: engine.distance + 10 + slot * 13 + lane * 3 + (Math.random() - 0.5) * 4,
        speed: 5.8 + Math.random() * 2.2,
        speedK: 1,
        variant: (id * 3 + lane) % 5,
      };
    });
  }, []);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const lastDistance = useRef(engine.distance);

  useFrame((_, dtRaw) => {
    const currentDistance = engine.distance;
    if (currentDistance < lastDistance.current - 1) {
      // A restart/track switch rewinds the road coordinates; keep traffic positions in that same frame.
      const rewind = currentDistance - lastDistance.current;
      for (const car of cars) car.s += rewind;
    }
    lastDistance.current = currentDistance;
    if (trackMode !== "shibuya") return;
    const dt = Math.min(dtRaw, 0.05);
    // Process the car at the front of each lane first, so followers can keep a safe gap.
    const ordered = [...cars].sort((a, b) => a.s - b.s);
    for (const car of ordered) {
      const root = refs.current[car.id];
      if (!root) continue;

      let targetK = 1;
      let stopLineS: number | null = null;
      const upcoming = engine.intersections
        .filter((inter) => car.s >= inter.s + 6 && car.s - inter.s < 80)
        .sort((a, b) => b.s - a.s)[0];
      if (upcoming) {
        const approach = trafficSignalApproach(car.s, upcoming.s, upcoming.lightState);
        stopLineS = approach.stopLineS;
        targetK = Math.min(targetK, approach.targetK);
      }

      const leader = cars
        .filter((other) => other !== car && Math.abs(other.lat - car.lat) < 0.1 && other.s < car.s)
        .sort((a, b) => b.s - a.s)[0];
      if (leader) {
        const gap = car.s - leader.s;
        if (gap < 14) targetK = Math.min(targetK, leader.speedK, Math.max(0, Math.min(1, (gap - 7) / 7)));
      }

      const braking = targetK < car.speedK;
      car.speedK += (targetK - car.speedK) * (1 - Math.exp(-dt * (braking ? 5.5 : 2.0)));
      car.s -= car.speed * car.speedK * dt;
      if (stopLineS !== null && car.s < stopLineS) {
        car.s = stopLineS;
        car.speedK = 0;
      }
      if (leader && car.s < leader.s + 7) {
        car.s = leader.s + 7;
        car.speedK = Math.min(car.speedK, leader.speedK);
      }
      if (car.s - engine.distance < -24) {
        car.s = engine.distance + 108 + Math.random() * 12;
        car.speedK = 1;
      }

      // Sedan/bus models face local -x and travel toward the intersection along -s.
      track.frame(car.s, car.lat, 0.03, root.position);
      track.quat(car.s, root.quaternion);
    }
  });

  if (trackMode !== "shibuya") return null;
  return (
    <>
      {cars.map((car) => {
        const geo = getGeometryPair(`shibuya-flow-car-${car.variant}`, () => jamCarParts(car.variant));
        return (
          <group
            key={car.id}
            ref={(group) => {
              refs.current[car.id] = group;
            }}
          >
            <mesh geometry={geo.lit} material={voxelMaterial} castShadow receiveShadow />
            {geo.glow && <mesh geometry={geo.glow} material={glowMaterial} />}
          </group>
        );
      })}
    </>
  );
}

const CrossCarView = memo(function CrossCarView({ cc }: { cc: CrossTrafficCar }) {
  const geo = useMemo(() => getGeometry(`cross-car-${cc.variant % 7}`, () => crossingCarParts(cc.variant)), [cc.variant]);
  const rootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    const h = crossCarH(cc.lat);
    track.frame(cc.s, cc.lat, h, root.position);
    track.quat(cc.s, root.quaternion);
    // Face lateral travel direction:
    // +lat (+z) => -Math.PI / 2
    // -lat (-z) => Math.PI / 2
    inner.rotation.y = cc.dir > 0 ? -Math.PI / 2 : Math.PI / 2;
  });

  const night = useUI((s) => s.trackMode === "shibuya" && s.shibuyaTime === "malam");
  const lightsGeo = useMemo(() => (night ? getGeometry("cross-car-lights", crossCarLightParts) : null), [night]);
  return (
    <group ref={rootRef}>
      <group ref={innerRef}>
        <mesh geometry={geo} material={voxelMaterial} castShadow receiveShadow />
        {lightsGeo && <mesh geometry={lightsGeo} material={glowMaterial} />}
      </group>
    </group>
  );
});

function CrossCars() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.moverVersion !== seen.current) {
      seen.current = engine.moverVersion;
      force();
    }
  });
  return (
    <>
      {engine.crossCars.map((cc) => (
        <CrossCarView key={cc.id} cc={cc} />
      ))}
    </>
  );
}

/* ---------- Puddles & overpass traffic ---------- */
const puddleMat = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.85 });

function Puddles() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
  });
  return (
    <>
      {engine.puddles.map((pu) => (
        <mesh key={pu.id} geometry={getGeometry(`puddle-${pu.variant}`, () => puddleParts(pu.variant))} material={puddleMat} position={pu.pos} rotation-y={pu.rotY} receiveShadow />
      ))}
    </>
  );
}

function RoadSigns() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
  });
  const geo = useMemo(() => getGeometry("roadsign", roadworkSignParts), []);
  return (
    <>
      {engine.roadSigns.map((d) => (
        <mesh key={d.variant} geometry={geo} material={voxelMaterial} position={d.pos} rotation-y={d.rotY} castShadow />
      ))}
    </>
  );
}

function OverpassCars() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const refs = useRef(new Map<number, THREE.Group>());
  useFrame(() => {
    if (engine.moverVersion !== seen.current) {
      seen.current = engine.moverVersion;
      force();
    }
    for (const c of engine.overpassCars) {
      const g = refs.current.get(c.id);
      if (!g) continue;
      track.frame(c.s, c.lat, OVERPASS_H + 0.27, g.position);
      track.quat(c.s, g.quaternion);
      g.children[0].rotation.y = c.dir > 0 ? 0 : Math.PI;
    }
  });
  return (
    <>
      {engine.overpassCars.map((c) => (
        <group
          key={c.id}
          ref={(g) => {
            if (g) refs.current.set(c.id, g);
            else refs.current.delete(c.id);
          }}
        >
          <group>
            <mesh geometry={getGeometry(`opcar-${c.variant % 7}`, () => overpassCarParts(c.variant))} material={voxelMaterial} castShadow />
          </group>
        </group>
      ))}
    </>
  );
}

/* ---------- Sakura / Momiji petals & leaves (instanced) ---------- */
const MAX_PETALS = 90;
function Petals() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const trackMode = useUI((s) => s.trackMode);
  const geo = useMemo(
    () => (trackMode === "haruna" ? getGeometry("momiji", momijiLeafParts) : getGeometry("petal", petalParts)),
    [trackMode],
  );
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    let i = 0;
    for (const p of engine.petals) {
      if (i >= MAX_PETALS) break;
      tmpObj.position.set(p.x, p.y, p.z);
      tmpObj.rotation.set(p.rx, p.ry, p.rz);
      tmpObj.scale.setScalar(1);
      tmpObj.updateMatrix();
      m.setMatrixAt(i++, tmpObj.matrix);
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, MAX_PETALS]} frustumCulled={false} />;
}

/* ---------- NOS cans ---------- */
function NosCans() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const geo = useMemo(() => getGeometry("nos-can", nosCanParts), []);
  const refs = useRef(new Map<number, THREE.Group>());
  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
    const t = engine.time;
    for (const c of engine.nosCans) {
      const g = refs.current.get(c.id);
      if (!g) continue;
      g.visible = !c.taken;
      g.position.set(c.wx, c.wy + 0.35 + Math.sin(t * 3 + c.phase) * 0.1, c.wz);
      g.rotation.y = t * 2.5 + c.phase;
    }
  });
  return (
    <>
      {engine.nosCans.map((c) => (
        <group
          key={c.id}
          ref={(g) => {
            if (g) refs.current.set(c.id, g);
            else refs.current.delete(c.id);
          }}
        >
          <mesh geometry={geo} material={voxelMaterial} castShadow />
        </group>
      ))}
    </>
  );
}

/* ---------- Item LANGKA: ROKET NOS + kilatan sinar (raylight) ---------- */
const RARE_TINT: Record<string, string> = {
  rocket: "#ffc93c",
  diamond: "#4fd8ff",
  crown: "#ffc93c",
};

function Rockets() {
  const { camera } = useThree();
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);
  const geos = useMemo(
    () => ({
      rocket: getGeometry("rocket", rocketParts),
      diamond: getGeometry("diamond", diamondParts),
      crown: getGeometry("crown", crownParts),
    }),
    [],
  );
  const ringMats = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(RARE_TINT).map(([kind, color]) => [
          kind,
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
        ]),
      ) as Record<string, THREE.MeshBasicMaterial>,
    [],
  );
  const rayTex = useMemo(() => getRayTexture(), []);
  const rayMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [rayTex],
  );
  useEffect(
    () => () => {
      rayMat.dispose();
      for (const m of Object.values(ringMats)) m.dispose();
    },
    [rayMat, ringMats],
  );

  const refs = useRef(new Map<number, THREE.Group>());
  const rays = useRef(new Map<number, THREE.Mesh>());
  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
    const t = engine.time;
    for (const r of engine.rockets) {
      const g = refs.current.get(r.id);
      if (!g) continue;
      g.visible = !r.taken;
      g.position.set(r.wx, r.wy + 0.42 + Math.sin(t * 2.2 + r.phase) * 0.12, r.wz);
      // mengambang & berputar pelan, seperti barang berharga
      g.rotation.y = t * 1.4 + r.phase;
      const ray = rays.current.get(r.id);
      if (ray) {
        ray.quaternion.copy(camera.quaternion); // billboard: selalu menghadap kamera
        ray.rotateZ(t * 0.35 + r.phase);
        const pulse = 1 + 0.16 * Math.sin(t * 5.5 + r.phase);
        ray.scale.setScalar(pulse);
        (ray.material as THREE.MeshBasicMaterial).opacity = 0.72 + 0.22 * Math.sin(t * 6.3 + r.phase);
      }
    }
  });

  return (
    <>
      {engine.rockets.map((r) => (
        <group
          key={r.id}
          ref={(g) => {
            if (g) refs.current.set(r.id, g);
            else refs.current.delete(r.id);
          }}
        >
          {/* sinar di belakang roket (dulu -> sekarang: roket terlihat "bersinar") */}
          <mesh
            ref={(m) => {
              if (m) rays.current.set(r.id, m);
              else rays.current.delete(r.id);
            }}
            material={rayMat}
            renderOrder={-1}
          >
            <planeGeometry args={[3.1, 3.1]} />
          </mesh>
          {/* piringan cahaya di jalan (warna ikut jenis item) */}
          <mesh material={ringMats[r.kind] ?? ringMats.rocket} rotation-x={-Math.PI / 2} position={[0, -0.4, 0]}>
            <ringGeometry args={[0.42, 0.62, 24]} />
          </mesh>
          <mesh geometry={geos[r.kind] ?? geos.rocket} material={voxelMaterial} castShadow />
        </group>
      ))}
    </>
  );
}

/** Daily Word Hunt letters floating along the track with golden shine. */
function TrackLetters() {
  const { camera } = useThree();
  const refs = useRef<Map<number, THREE.Group>>(new Map());
  const rays = useRef<Map<number, THREE.Mesh>>(new Map());
  const rayTex = useMemo(() => getRayTexture(), []);
  const rayMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: rayTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        color: "#ffd21f",
        opacity: 0.82,
        toneMapped: false,
      }),
    [rayTex],
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffd21f",
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(
    () => () => {
      rayMat.dispose();
      ringMat.dispose();
    },
    [rayMat, ringMat],
  );

  useFrame(() => {
    const t = engine.time;
    for (const l of engine.letters) {
      const g = refs.current.get(l.id);
      if (!g) continue;
      g.visible = !l.taken;
      g.position.set(l.wx, l.wy + 0.45 + Math.sin(t * 2.8 + l.phase) * 0.12, l.wz);
      g.rotation.y = t * 1.8 + l.phase;
      const ray = rays.current.get(l.id);
      if (ray) {
        ray.quaternion.copy(camera.quaternion);
        ray.rotateZ(t * 0.4 + l.phase);
        const pulse = 1 + 0.14 * Math.sin(t * 5.8 + l.phase);
        ray.scale.setScalar(pulse);
        (ray.material as THREE.MeshBasicMaterial).opacity = 0.7 + 0.25 * Math.sin(t * 6.5 + l.phase);
      }
    }
  });

  return (
    <>
      {engine.letters.map((l) => {
        const geo = getGeometry(`letter_${l.char}`, () => letterBadgeParts(l.char));
        return (
          <group
            key={l.id}
            ref={(g) => {
              if (g) refs.current.set(l.id, g);
              else refs.current.delete(l.id);
            }}
          >
            <mesh
              ref={(m) => {
                if (m) rays.current.set(l.id, m);
                else rays.current.delete(l.id);
              }}
              material={rayMat}
              renderOrder={-1}
            >
              <planeGeometry args={[2.9, 2.9]} />
            </mesh>
            <mesh material={ringMat} rotation-x={-Math.PI / 2} position={[0, -0.4, 0]}>
              <ringGeometry args={[0.4, 0.62, 24]} />
            </mesh>
            <mesh geometry={geo} material={voxelMaterial} castShadow />
          </group>
        );
      })}
    </>
  );
}

/** Kilatan sinar besar tepat saat roket diambil (mengembang lalu memudar). */
function RareFlash() {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const rays = useRef<THREE.Mesh>(null);
  const pillar = useRef<THREE.Mesh>(null);
  const rayTex = useMemo(() => getRayTexture(), []);
  const rayMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    [rayTex],
  );
  const pillarMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#fff3c4",
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => {
    rayMat.dispose();
    pillarMat.dispose();
  }, [rayMat, pillarMat]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const f = engine.rareFlash;
    g.visible = f > 0;
    if (f <= 0) return;
    const k = 1 - f / RARE_FLASH_T; // 0 -> 1 seiring waktu
    const [x, y, z] = engine.rareFlashPos;
    g.position.set(x, y + 0.55, z);
    const rgb = engine.rareFlashRGB;
    rayMat.color.setRGB(rgb[0], rgb[1], rgb[2]);
    pillarMat.color.setRGB(Math.min(1, rgb[0] + 0.25), Math.min(1, rgb[1] + 0.25), Math.min(1, rgb[2] + 0.25));
    if (rays.current) {
      rays.current.quaternion.copy(camera.quaternion);
      rays.current.rotateZ(k * 1.6);
      rays.current.scale.setScalar(2.2 + 5.5 * k);
      rayMat.opacity = Math.max(0, 1 - k) * 0.95;
    }
    if (pillar.current) {
      pillar.current.quaternion.copy(camera.quaternion);
      pillar.current.scale.set(1 - 0.25 * k, 2.4 + 3.4 * k, 1);
      pillarMat.opacity = Math.max(0, 1 - k) * 0.42;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={rays} material={rayMat} />
      <mesh ref={pillar} material={pillarMat}>
        <planeGeometry args={[0.55, 1.6]} />
      </mesh>
    </group>
  );
}

/* ---------- Bread (instanced) ---------- */
const MAX_BREAD = 140;
const tmpObj = new THREE.Object3D();

function Breads() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => getGeometry("bread", breadParts), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    let i = 0;
    const t = engine.time;
    for (const b of engine.breads) {
      if (b.taken || i >= MAX_BREAD) continue;
      tmpObj.position.set(b.wx, b.wy + Math.sin(t * 3 + b.phase) * 0.08, b.wz);
      tmpObj.rotation.set(0, t * 2.2 + b.phase, 0);
      tmpObj.scale.setScalar(1);
      tmpObj.updateMatrix();
      m.setMatrixAt(i++, tmpObj.matrix);
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, voxelMaterial, MAX_BREAD]} frustumCulled={false} castShadow />;
}

/* ---------- Efek ambil roti: terbang & mengecil ke badan merpati (juicy hypercasual) ---------- */
const BREAD_FX_N = 8;

function BreadFx() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => getGeometry("bread", breadParts), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const p = engine.player;
    const d = engine.distance;
    let i = 0;
    for (const fx of engine.breadFx) {
      if (i >= BREAD_FX_N) break;
      const u = Math.min(1, fx.age / 0.3);
      const e = u * u * (3 - 2 * u); // smoothstep
      // Ruang TRACK relatif pemain: roti ikut maju bersama pemain (tidak pernah
      // tertinggal / nembus bablas), lalu tersedot mulus ke dada merpati.
      const s = d + fx.rel * (1 - e) + 0.3 * e;
      const lat = fx.lat + (p.lat - fx.lat) * e;
      const h = fx.h + (p.h + 0.55 - fx.h) * e + Math.sin(u * Math.PI) * 0.3;
      track.frame(s, lat, h, tmpObj.position);
      track.quat(s, tmpObj.quaternion);
      // tetap TEGAK — tanpa tilt/miring, hanya yaw pelan biar hidup
      tmpObj.rotateY(fx.age * 4);
      tmpObj.scale.setScalar(Math.max(0.08, 1 - e * 0.92)); // mengecil sampai "masuk" ke badan
      tmpObj.updateMatrix();
      m.setMatrixAt(i++, tmpObj.matrix);
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, voxelMaterial, BREAD_FX_N]} frustumCulled={false} />;
}

/* ---------- Denyut: satu cincin tipis saat hewan mental ---------- */
const PULSE_POOL = 4;

function Pulses() {
  const { camera } = useThree();
  // band tipis (0.94..1) -> efeknya halus, seperti ripple knockback
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.94, 1, 40), []);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const mats = useMemo(
    () =>
      Array.from(
        { length: PULSE_POOL },
        () =>
          new THREE.MeshBasicMaterial({
            color: "#ffffff",
            transparent: true,
            opacity: 0,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [],
  );
  useEffect(
    () => () => {
      ringGeo.dispose();
      mats.forEach((m) => m.dispose());
    },
    [ringGeo, mats],
  );

  useFrame(() => {
    let i = 0;
    for (const q of engine.pulses) {
      if (i >= PULSE_POOL) break;
      const mesh = ringRefs.current[i];
      const mat = mats[i];
      i++;
      if (!mesh) continue;
      const k = Math.min(1, q.t / q.max);
      const grow = 1 - Math.pow(1 - k, 3); // mengembang cepat lalu melambat
      mesh.visible = true;
      mesh.position.set(q.x, q.y, q.z);
      mesh.quaternion.copy(camera.quaternion); // billboard: selalu menghadap pemain
      mesh.scale.setScalar(q.r0 + (q.r1 - q.r0) * grow);
      mat.color.setRGB(q.cr, q.cg, q.cb);
      mat.opacity = 0.6 * Math.pow(1 - k, 1.6); // tipis & cepat hilang
    }
    for (let j = i; j < PULSE_POOL; j++) if (ringRefs.current[j]) ringRefs.current[j]!.visible = false;
  });

  return (
    <group>
      {Array.from({ length: PULSE_POOL }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            ringRefs.current[i] = m;
          }}
          geometry={ringGeo}
          material={mats[i]}
          visible={false}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

/* ---------- Particles (instanced) ---------- */
const MAX_PARTICLES = 150;
const tmpColor = new THREE.Color();

function Particles() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ color: "#ffffff" }), []);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    let i = 0;
    for (const pt of engine.particles) {
      if (i >= MAX_PARTICLES) break;
      const k = 1 - pt.life / pt.max;
      // asap knalpot membesar seiring umur (grow), partikel lain mengecil
      const s = pt.size * (pt.grow ? 0.45 + pt.grow * (1 - k) : 0.4 + 0.6 * k);
      tmpObj.position.set(pt.x, pt.y, pt.z);
      tmpObj.rotation.set(pt.rx, pt.ry, 0);
      tmpObj.scale.set(s, s * (pt.size > 0.15 && pt.gravity < 5 ? 0.35 : 1), s);
      tmpObj.updateMatrix();
      m.setMatrixAt(i, tmpObj.matrix);
      tmpColor.setRGB(pt.r, pt.g, pt.b);
      m.setColorAt(i, tmpColor);
      i++;
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, MAX_PARTICLES]} frustumCulled={false} castShadow />;
}

/* ---------- World root ---------- */

/* ---------- Urban ambient sidewalk crowd: visual-only walkers for Tokyo and Shibuya ---------- */
interface Walker {
  s: number;
  lat: number;
  side: 1 | -1;
  dir: 1 | -1;
  speed: number;
  t0: number;
  seeded: boolean;
}

const URBAN_CROWD_N = 120; // Trotoar ramai, hidup, dan merata khas kota Tokyo/Shibuya
const CROWD_KINDS: ("adult" | "suit" | "kid" | "elder")[] = ["adult", "suit", "kid", "adult", "elder", "suit", "adult", "kid", "suit", "adult", "suit", "kid"];

/** Pilih posisi trotoar. Menyebar merata di seluruh lebar trotoar, tidak menumpuk di satu garis sempit. */
function crowdLat(mode: TrackMode, side: 1 | -1, dir: 1 | -1): number {
  if (mode === "shibuya") {
    // Trotoar Shibuya lebar (near: -4.2 sampai -8.0; far: 12.6 sampai 16.0)
    // 4 lajur pejalan alami per sisi jalan agar menyebar merata, tidak dempet satu garis
    if (side < 0) {
      const nearLanes = dir > 0 ? [-4.8, -5.5] : [-6.3, -7.2];
      return pick(nearLanes) + (Math.random() - 0.5) * 0.35;
    }
    const farLanes = dir > 0 ? [13.2, 13.9] : [14.7, 15.5];
    return pick(farLanes) + (Math.random() - 0.5) * 0.35;
  }
  // Tokyo City / Park
  if (side < 0) {
    const nearLanes = dir > 0 ? [-4.8, -5.4] : [-5.9, -6.6];
    return pick(nearLanes) + (Math.random() - 0.5) * 0.25;
  }
  const farLanes = dir > 0 ? [4.5, 5.0] : [5.4, 5.9];
  return pick(farLanes) + (Math.random() - 0.5) * 0.25;
}

type WalkerKind = "adult" | "elder" | "suit" | "kid" | "kamen";

const AmbientWalker = memo(function AmbientWalker({ w, all, variant, kind, trackMode }: { w: Walker; all: Walker[]; variant: number; kind: WalkerKind; trackMode: TrackMode }) {
  const elderly = kind === "elder";
  const kid = kind === "kid";
  const suit = kind === "suit";
  // EASTER EGG: Kamen Rider kadang ikutan jalan santai di trotoar (tanpa topi kupluk saat salju)
  const kamen = kind === "kamen";
  const rootRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const armLRef = useRef<THREE.Group>(null);
  const armRRef = useRef<THREE.Group>(null);
  const legLRef = useRef<THREE.Group>(null);
  const legRRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  // pakai cache geometri yang sama dengan pedestrian penyeberang (hemat memori)
  const snowW = useUI((s) => s.weather === "snow"); // mode salju: jaket tebal + kupluk
  const pedKey = kamen ? "kamen" : `${variant % 8}${elderly ? "-old" : ""}${kid ? "-kid" : ""}${snowW ? "-w" : ""}`;
  const headGeo = useMemo(
    () => (kamen ? getGeometry("kamen-head", kamenRiderHeadParts) : getGeometry(`ped-head-${pedKey}-normal`, () => pedestrianHeadParts(variant, false, elderly, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const torsoGeo = useMemo(
    () => (kamen ? getGeometry("kamen-torso", kamenRiderTorsoParts) : getGeometry(`ped-torso-${pedKey}`, () => pedestrianTorsoParts(variant, elderly, kid, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const armLGeo = useMemo(
    () => (kamen ? getGeometry("kamen-arm", kamenRiderArmParts) : getGeometry(`ped-arm-${pedKey}-L`, () => pedestrianArmParts(variant, 1, elderly, false, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const armRGeo = useMemo(
    () => (kamen ? getGeometry("kamen-arm", kamenRiderArmParts) : getGeometry(`ped-arm-${pedKey}-R`, () => pedestrianArmParts(variant, -1, elderly, elderly, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const legLGeo = useMemo(
    () => (kamen ? getGeometry("kamen-leg", kamenRiderLegParts) : getGeometry(`ped-leg-${pedKey}-L`, () => pedestrianLegParts(variant, 1, elderly, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const legRGeo = useMemo(
    () => (kamen ? getGeometry("kamen-leg", kamenRiderLegParts) : getGeometry(`ped-leg-${pedKey}-R`, () => pedestrianLegParts(variant, -1, elderly, snowW))),
    [pedKey, variant, elderly, kid, snowW, kamen],
  );
  const caneGeo = useMemo(() => (elderly ? getGeometry("ped-cane", caneParts) : null), [elderly]);
  // salaryman: tas kerja dikempit rapat di sisi badan, lengan kirinya tidak mengayun
  const caseGeo = useMemo(() => (suit ? getGeometry(`ped-briefcase-${variant % 2}`, () => briefcaseParts(variant)) : null), [suit, variant]);

  useFrame((_, dtRaw) => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;
    const dt = Math.min(dtRaw, 0.05);
    const dist = engine.distance;

    // Setiap trotoar punya dua arah; arah dan jalur tetap saat pejalan kaki didaur ulang.
    if (!w.seeded) {
      w.seeded = true;
      w.s = dist - 20 + Math.random() * 125;
      w.lat = crowdLat(trackMode, w.side, w.dir);
    }
    // JAGA KELANCARAN & JARAK ALAMI: tidak dempet, tidak menumpuk jadi antrean macet
    let v = w.speed;
    for (const o of all) {
      if (o === w || !o.seeded || o.side !== w.side || o.dir !== w.dir) continue;
      if (Math.abs(o.lat - w.lat) > 0.42) continue;
      const gap = (o.s - w.s) * w.dir;
      if (gap > 0 && gap < 1.6) {
        // Sesuaikan kecepatan secara halus, tetap melangkah alami (tidak macet berhenti total)
        v = Math.min(v, o.speed * 0.95);
        // Geser ke samping secara halus bila mendekati orang di depan agar tidak dempet
        if (gap < 1.1) {
          const shift = w.lat >= o.lat ? 0.3 : -0.3;
          w.lat += shift * dt;
        }
      }
    }
    w.s += w.dir * v * dt;
    let rel = w.s - dist;
    // Sirkulasi terus menerus di sekitar pemain agar trotoar selalu ramai merata tanpa zona kosong
    if (w.dir > 0 && rel > 98) {
      w.s = dist - 24 - Math.random() * 12;
      w.lat = crowdLat(trackMode, w.side, w.dir);
    } else if (w.dir < 0 && rel < -24) {
      w.s = dist + 88 + Math.random() * 24;
      w.lat = crowdLat(trackMode, w.side, w.dir);
    }
    rel = w.s - dist;

    track.frame(w.s, w.lat, 0.13, root.position);
    track.quat(w.s, root.quaternion);
    inner.rotation.y = w.dir > 0 ? 0 : Math.PI;
    const scl = PED_SCALE * (kid ? 0.62 : 1);
    inner.scale.setScalar(scl);

    // Langkah jalan kaki proporsional, santai, dan alami
    const strideHz = (v / (0.86 * scl)) * Math.PI;
    w.t0 += dt * strideHz;
    const t = w.t0;
    const amp = v < 0.04 ? 0 : elderly ? 0.44 : kid ? 0.62 : 0.65;
    const swing = Math.sin(t) * amp;
    // Model menghadap sumbu +x, ayunan kaki/lengan maju-mundur pada sumbu z
    if (legLRef.current) legLRef.current.rotation.z = swing;
    if (legRRef.current) legRRef.current.rotation.z = -swing;
    if (armLRef.current) armLRef.current.rotation.z = suit ? 0.08 : -swing * 0.52;
    if (armRRef.current) armRRef.current.rotation.z = elderly ? 0.14 : swing * 0.52;
    if (headRef.current) headRef.current.rotation.y = Math.sin(engine.time * 0.7 + w.s * 0.3) * 0.12;
    inner.position.y = PED_LIFT + (amp > 0 ? Math.abs(Math.sin(t)) * 0.024 : 0);
  });

  return (
    <group ref={rootRef}>
      <group ref={innerRef}>
        <mesh geometry={torsoGeo} material={voxelMaterial} />
        <group ref={headRef} position={[0, 0.34, 0]} scale={kid ? 1.3 : 1}>
          <mesh geometry={headGeo} material={voxelMaterial} />
        </group>
        <group ref={armLRef} position={[0, 0.27, 0.34]}>
          <mesh geometry={armLGeo} material={voxelMaterial} />
          {caseGeo && <mesh geometry={caseGeo} material={voxelMaterial} />}
        </group>
        <group ref={armRRef} position={[0, 0.27, -0.34]}>
          <mesh geometry={armRGeo} material={voxelMaterial} />
          {caneGeo && <mesh geometry={caneGeo} material={voxelMaterial} position={[0.02, CANE_GRIP_Y, 0]} />}
        </group>
        <group ref={legLRef} position={[0, -0.34, 0.11]}>
          <mesh geometry={legLGeo} material={voxelMaterial} />
        </group>
        <group ref={legRRef} position={[0, -0.34, -0.11]}>
          <mesh geometry={legRGeo} material={voxelMaterial} />
        </group>
      </group>
    </group>
  );
});

/** Kerumunan urban: trotoar Tokyo dan Shibuya selalu ramai, tanpa collision gameplay. */
function UrbanCrowd() {
  const trackMode = useUI((s) => s.trackMode);
  const walkers = useMemo<Walker[]>(
    () =>
      Array.from({ length: URBAN_CROWD_N }, (_, i) => {
        // SATU Kamen Rider menyamar di keramaian (easter egg — jarang kelihatan, nggak tiap detik ada)
        const kind: WalkerKind = i === 13 ? "kamen" : CROWD_KINDS[i % CROWD_KINDS.length];
        const elderly = kind === "elder";
        const kid = kind === "kid";
        return {
          s: 0,
          lat: 0,
          side: (Math.floor(i / 2) % 2 === 0 ? -1 : 1) as 1 | -1,
          dir: (i % 2 === 0 ? 1 : -1) as 1 | -1,
          speed: elderly ? 0.75 + Math.random() * 0.3 : kid ? 1.3 + Math.random() * 0.65 : 1.3 + Math.random() * 0.8,
          t0: Math.random() * 20,
          seeded: false,
        };
      }),
    [],
  );
  useEffect(() => {
    // ganti track/reset -> sebar ulang di depan kamera
    for (const w of walkers) w.seeded = false;
  }, [trackMode, walkers]);
  if (trackMode === "haruna") return null;
  return (
    <>
      {walkers.map((w, i) => {
        // Mix salarymen, children, elders, casual walkers — dan SATU Kamen Rider easter egg.
        const kind: WalkerKind = i === 13 ? "kamen" : CROWD_KINDS[i % CROWD_KINDS.length];
        return <AmbientWalker key={i} w={w} all={walkers} variant={kind === "suit" ? 5 + (i % 3) : i % 5} kind={kind} trackMode={trackMode} />;
      })}
    </>
  );
}

export function World() {
  const seen = useRef(-1);
  const [, force] = useReducer((x: number) => x + 1, 0);

  useFrame(() => {
    if (engine.listVersion !== seen.current) {
      seen.current = engine.listVersion;
      force();
    }
  });

  return (
    <group>
      {engine.chunks.map((c) => (
        <ChunkView key={c.id} chunk={c} />
      ))}
      {engine.obstacles.map((o) => (
        <ObstacleView key={o.id} o={o} />
      ))}
      <Intersections />
      <CrossCars />
      <Crossings />
      <Trains />
      <SubwayTrains />
      <Puddles />
      <Petals />
      <NosCans />
      <Rockets />
      <TrackLetters />
      <RareFlash />
      <RoadSigns />
      <OverpassCars />
      <ShibuyaTraffic />
      <Movers />
      <UrbanCrowd />
      <Breads />
      <BreadFx />
      <Particles />
      <Pulses />
    </group>
  );
}
