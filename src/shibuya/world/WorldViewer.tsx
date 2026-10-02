import { Component, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  Color, DirectionalLight, Fog, HemisphereLight, PerspectiveCamera, Vector3,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { captureAsset } from '../voxel/exportAsset';
import type { AssetId } from '../voxel/types';
import { WORLD, worldProgress, type WorldCamera, type WorldLayers } from './layout';
import { WorldRuntime, type RailReport } from './runtime';
import { DETAIL_FOCUS } from './propLayout';

export interface WorldViewerHandle {
  zoom: (direction: number) => void;
  jump: (distance: number) => void;
  getDistance: () => number;
  capture: () => Promise<Blob>;
  exportBlock: () => Promise<Blob>;
  demoTrain: () => void;
  focusBusiness: (kind: 'shop' | 'ramen') => void;
  focusDetails: () => void;
}

export interface WorldViewerProps {
  initialDistance: number;
  night: boolean;
  running: boolean;
  speed: number;
  live: boolean;
  layers: WorldLayers;
  view: WorldCamera;
  resetSignal: number;
  reducedMotion: boolean;
  onProgress: (distance: number) => void;
  onReady: () => void;
  onInteract: () => void;
  onError: () => void;
  onOpenAsset: (asset: AssetId, member?: string) => void;
  onRailReport: (report: RailReport) => void;
}

const Scene = forwardRef<WorldViewerHandle, WorldViewerProps>(function Scene(props, ref) {
  const { initialDistance, night, running, speed, live, layers, view, resetSignal, reducedMotion,
    onProgress, onReady, onInteract, onOpenAsset, onRailReport } = props;
  const { camera: activeCamera, gl, scene, size } = useThree();
  const camera = activeCamera as PerspectiveCamera;
  const runtime = useMemo(() => new WorldRuntime(), []);
  const controls = useRef<OrbitControlsImpl>(null);
  const light = useRef<DirectionalLight>(null);
  const ambient = useRef<HemisphereLight>(null);
  const distance = useRef(initialDistance);
  const time = useRef(12.5);
  const progressTick = useRef(0);
  const cleanupTimer = useRef<number>(0);
  const transitioning = useRef(true);
  const goalPosition = useRef(new Vector3(38, 74, 80));
  const goalTarget = useRef(new Vector3(0, 4, -17));
  const goalZoom = useRef(1);
  const keyDirection = useRef(0);
  const mobile = size.width < 761;
  const day = useMemo(() => new Color('#eaf0e5'), []);
  const dusk = useMemo(() => new Color('#1a2c29'), []);

  useEffect(() => {
    window.clearTimeout(cleanupTimer.current);
    runtime.setWindow(worldProgress(distance.current).index);
    runtime.update(distance.current, 0, time.current, layers, false, mobile);
    const ready = window.setTimeout(onReady, 120);
    return () => {
      window.clearTimeout(ready);
      cleanupTimer.current = window.setTimeout(() => runtime.dispose(), 0);
    };
  }, [runtime, onReady]);

  useEffect(() => { runtime.setNight(night); }, [runtime, night]);

  useEffect(() => {
    if (view === 'overhead') {
      goalPosition.current.set(0, mobile ? 112 : 101, -12);
      goalTarget.current.set(0, 0, -15.1);
      camera.up.set(0, 1, 0);
    } else {
      goalPosition.current.set(mobile ? 31 : 38, mobile ? 79 : 74, mobile ? 87 : 80);
      goalTarget.current.set(0, 4, -17);
      camera.up.set(0, 1, 0);
    }
    goalZoom.current = mobile ? 0.76 : 1;
    transitioning.current = true;
  }, [camera, view, resetSignal, mobile]);

  useEffect(() => {
    camera.setViewOffset(size.width, size.height, mobile ? 0 : -size.width * 0.092,
      mobile ? -size.height * 0.06 : 24, size.width, size.height);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, mobile]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName) || document.querySelector('[role="dialog"], [role="menu"]')) return;
      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') { event.preventDefault(); keyDirection.current = 1; onInteract(); }
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') { event.preventDefault(); keyDirection.current = -1; onInteract(); }
    };
    const up = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(event.key)) keyDirection.current = 0;
    };
    const blur = () => { keyDirection.current = 0; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); };
  }, [onInteract]);

  useImperativeHandle(ref, () => ({
    zoom(direction) {
      goalZoom.current = Math.max(0.55, Math.min(2.7, camera.zoom * (direction > 0 ? 1.2 : 1 / 1.2)));
      goalPosition.current.copy(camera.position);
      if (controls.current) goalTarget.current.copy(controls.current.target);
      transitioning.current = true;
    },
    jump(next) {
      distance.current = Math.max(0, next);
      runtime.setWindow(worldProgress(distance.current).index);
      runtime.update(distance.current, 0, time.current, layers, false, mobile);
      onProgress(distance.current);
      onRailReport(runtime.getRailReport(worldProgress(distance.current).index));
    },
    demoTrain() {
      const index = worldProgress(distance.current).index;
      distance.current = index * WORLD.chunkLength + 19;
      runtime.setWindow(index);
      runtime.triggerTrain(index, time.current);
      runtime.update(distance.current, 0, time.current, layers, false, mobile);
      goalPosition.current.set(mobile ? 12 : 14, mobile ? 41 : 35, mobile ? 36 : 29);
      goalTarget.current.set(0, 1.5, -17);
      goalZoom.current = mobile ? 0.85 : 1.04;
      transitioning.current = true;
      onProgress(distance.current);
      onRailReport(runtime.getRailReport(index));
    },
    focusBusiness(kind) {
      const index = worldProgress(distance.current).index;
      runtime.setWindow(index);
      const block = runtime.chunks.get(index)!;
      const business = block.district.businesses.find(scene => scene.kind === kind) ?? block.district.businesses[0];
      if (!business) return;
      distance.current = index * WORLD.chunkLength;
      runtime.update(distance.current, 0, time.current, layers, false, mobile);
      goalTarget.current.set(business.side * 10.4, 1.2, business.z);
      goalPosition.current.set(-business.side * 4.45, mobile ? 17 : 14, business.z + (mobile ? 28 : 23));
      goalZoom.current = mobile ? 0.88 : 1.22;
      transitioning.current = true;
      onProgress(distance.current);
    },
    focusDetails() {
      const index = worldProgress(distance.current).index;
      distance.current = index * WORLD.chunkLength;
      runtime.setWindow(index);
      runtime.update(distance.current, 0, time.current, layers, false, mobile);
      goalTarget.current.set(...DETAIL_FOCUS);
      goalPosition.current.set(mobile ? 2.2 : 6, mobile ? 22 : 17, DETAIL_FOCUS[2] + (mobile ? 27 : 23));
      goalZoom.current = mobile ? 0.98 : 1.42;
      transitioning.current = true;
      onProgress(distance.current);
    },
    getDistance: () => distance.current,
    async capture() { gl.render(scene, camera); return captureAsset(gl.domElement); },
    async exportBlock() {
      const block = runtime.exportBlock(worldProgress(distance.current).index, layers);
      try {
        const buffer = await new GLTFExporter().parseAsync(block.root, { binary: true, onlyVisible: true, maxTextureSize: 512 });
        if (!(buffer instanceof ArrayBuffer)) throw new Error('Invalid world export.');
        return new Blob([buffer], { type: 'model/gltf-binary' });
      } finally { runtime.releaseChunk(block); }
    },
  }), [camera, gl, scene, runtime, layers, mobile, onProgress, onRailReport]);

  useFrame((_, frameDelta) => {
    const delta = Math.min(frameDelta, 0.07);
    if (keyDirection.current) distance.current = Math.max(0, distance.current + keyDirection.current * delta * 21);
    else if (running) distance.current += delta * 6 * speed;
    if (live) time.current += delta;
    runtime.update(distance.current, live ? delta : 0, time.current, layers, live, mobile);
    progressTick.current += delta;
    if (progressTick.current > 0.35) {
      onProgress(distance.current);
      onRailReport(runtime.getRailReport(worldProgress(distance.current).index));
      progressTick.current = 0;
    }

    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    if (transitioning.current && controls.current) {
      camera.position.lerp(goalPosition.current, ease);
      controls.current.target.lerp(goalTarget.current, ease);
      camera.zoom += (goalZoom.current - camera.zoom) * ease;
      camera.updateProjectionMatrix();
      controls.current.update();
      if (camera.position.distanceTo(goalPosition.current) < 0.025 && Math.abs(camera.zoom - goalZoom.current) < 0.003) transitioning.current = false;
    }
    const color = night ? dusk : day;
    if (scene.background instanceof Color) scene.background.lerp(color, ease);
    if (scene.fog instanceof Fog) scene.fog.color.lerp(color, ease);
    if (light.current) light.current.intensity += ((night ? 0.68 : 2.6) - light.current.intensity) * ease;
    if (ambient.current) ambient.current.intensity += ((night ? 0.83 : 1.7) - ambient.current.intensity) * ease;
  });

  return <>
    <color attach="background" args={['#eaf0e5']} />
    <fog attach="fog" args={['#eaf0e5', 152, 282]} />
    <hemisphereLight ref={ambient} args={['#fff8e9', '#a6b4ad', 1.7]} />
    <directionalLight ref={light} position={[-46, 91, 37]} intensity={2.6} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-70} shadow-camera-right={70}
      shadow-camera-top={101} shadow-camera-bottom={-88} shadow-camera-near={1} shadow-camera-far={235}
      shadow-normalBias={0.065} shadow-bias={-0.0002} />
    <directionalLight position={[32, 29, -48]} color="#c5e0e4" intensity={0.5} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.105, -65]} receiveShadow>
      <planeGeometry args={[450, 650]} />
      <meshStandardMaterial color="#c0ccaa" roughness={1} />
    </mesh>
    <mesh position={[0, 0.172, -65]} receiveShadow>
      <boxGeometry args={[12, 0.042, 1800]} />
      <meshStandardMaterial color="#4c5b62" roughness={1} />
    </mesh>
    <primitive object={runtime.root} dispose={null} onClick={(event: ThreeEvent<MouseEvent>) => {
      const instance = event.instanceId === undefined ? undefined : event.object.userData.worldInstances?.[event.instanceId];
      const asset = instance?.asset ?? event.object.userData.worldAsset;
      if (event.delta < 5 && asset) {
        event.stopPropagation(); onOpenAsset(asset, instance?.member ?? event.object.userData.worldMember);
      }
    }} />
    <OrbitControls ref={controls} makeDefault target={[0, 4, -17]} enablePan panSpeed={0.55} enableDamping dampingFactor={0.09}
      minDistance={28} maxDistance={170} minPolarAngle={0.015} maxPolarAngle={1.37} rotateSpeed={0.5}
      onStart={() => { transitioning.current = false; onInteract(); }} />
  </>;
});

class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? <div className="world-error"><strong>World Map tidak dapat dirender.</strong><p>Aktifkan WebGL atau buka Studio Aset. Koleksi asli tetap tersedia.</p></div> : this.props.children; }
}

const WorldViewer = forwardRef<WorldViewerHandle, WorldViewerProps>(function WorldViewer(props, ref) {
  const camera = useMemo(() => {
    const value = new PerspectiveCamera(42, 1, 0.2, 380);
    value.position.set(38, 74, 80);
    value.lookAt(0, 4, -17);
    return value;
  }, []);
  return <WorldBoundary onError={props.onError}>
    <Canvas className="world-canvas" shadows dpr={[1, 1.5]} camera={camera}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <Scene ref={ref} {...props} />
    </Canvas>
  </WorldBoundary>;
});

export default WorldViewer;