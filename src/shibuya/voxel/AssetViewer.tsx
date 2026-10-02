import { Component, forwardRef, useEffect, useImperativeHandle, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import {
  AnimationMixer, DirectionalLight, Group, HemisphereLight, Mesh, MeshStandardMaterial,
  OrthographicCamera, PointLight, Vector3,
} from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { getAssetData, type AssetId } from './models';
import { buildAssetObject, disposeAsset, measureAsset, setDiorama } from './renderModel';
import { captureAsset } from './exportAsset';
import { isPackAsset } from './packCatalog';

export type CameraView = 'iso' | 'front';

export interface ViewerHandle {
  zoom: (direction: number) => void;
  capture: () => Promise<Blob>;
}

interface ViewerProps {
  asset: AssetId;
  night: boolean;
  diorama: boolean;
  spin: boolean;
  view: CameraView;
  resetSignal: number;
  reducedMotion: boolean;
  focus: string | null;
  animationName: string;
  animationPlaying: boolean;
  animationSpeed: number;
  onSelectMember: (member: string) => void;
  onReady: () => void;
  onInteract: () => void;
  onError: () => void;
}

function Steam({ diorama }: { diorama: boolean }) {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const progress = (clock.elapsedTime * 0.26 + (i % 3) / 3) % 1;
      mesh.position.set(3.91 + Math.sin(progress * 5 + i) * 0.07,
        2.24 + progress * 0.9 - (diorama ? 0 : 0.73), -1.11 + Math.floor(i / 3) * 1.12);
      mesh.scale.setScalar(0.6 + progress * 0.6);
      (mesh.material as MeshStandardMaterial).opacity = Math.sin(progress * Math.PI) * 0.32;
    });
  });
  return <group>{Array.from({ length: 9 }, (_, i) => (
    <mesh key={i} ref={mesh => { refs.current[i] = mesh; }}>
      <boxGeometry args={[0.11, 0.14, 0.11]} />
      <meshStandardMaterial color="#fff5da" transparent opacity={0} depthWrite={false} />
    </mesh>
  ))}</group>;
}

function SakuraPetals({ asset, diorama }: { asset: AssetId; diorama: boolean }) {
  const refs = useRef<(Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const progress = (clock.elapsedTime * 0.055 + i / 17) % 1;
      const garden = asset === 'pagoda';
      const x = garden ? (i % 2 ? 5.8 : -5.8) : ((i * 7) % 9 - 4) * 0.47;
      const z = garden ? (i % 4 - 1.5) * 3.4 : ((i * 5) % 9 - 4) * 0.39 - 0.55;
      mesh.position.set(x + Math.sin(progress * 7 + i) * 0.5, 0.78 + (1 - progress) * (garden ? 4.6 : 6.7) - (diorama ? 0 : 0.73), z + progress * 0.63);
      mesh.rotation.set(progress * 4, progress * 6 + i, progress * 3);
      (mesh.material as MeshStandardMaterial).opacity = Math.sin(progress * Math.PI) * 0.85;
    });
  });
  return <group>{Array.from({ length: 17 }, (_, i) => <mesh key={i} ref={mesh => { refs.current[i] = mesh; }}>
    <boxGeometry args={[0.1, 0.018, 0.09]} />
    <meshStandardMaterial color={i % 2 ? '#f2bdc9' : '#f8d6d6'} transparent opacity={0} depthWrite={false} />
  </mesh>)}</group>;
}

const Scene = forwardRef<ViewerHandle, ViewerProps>(function Scene(props, apiRef) {
  const { asset, night, diorama, spin, view, resetSignal, reducedMotion, onReady, onInteract,
    focus, animationName, animationPlaying, animationSpeed, onSelectMember } = props;
  const { camera: activeCamera, gl, scene, size } = useThree();
  const camera = activeCamera as OrthographicCamera;
  const controls = useRef<OrbitControlsImpl>(null);
  const presentation = useRef<Group>(null);
  const hemisphere = useRef<HemisphereLight>(null);
  const sunlight = useRef<DirectionalLight>(null);
  const fillLight = useRef<DirectionalLight>(null);
  const interior = useRef<PointLight>(null);
  const lanternLight = useRef<PointLight>(null);
  const pack = isPackAsset(asset);
  const model = useMemo(() => buildAssetObject(getAssetData(asset, focus)), [asset, focus]);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const direction = useMemo(() => (view === 'iso'
    ? pack ? asset === 'characters' ? new Vector3(3.8, 8.5, 30) : new Vector3(10, 18, 30) : new Vector3(18, 17.3, 22)
    : new Vector3(0, pack ? 0.12 : 0.26, 1)).normalize(), [view, pack, asset]);
  const frame = useMemo(() => measureAsset(model, diorama, direction), [model, diorama, direction]);
  const dimensions = frame.bounds.getSize(new Vector3());
  const radius = Math.max(dimensions.x, dimensions.z, 12);
  const glowMaterials = useMemo(() => {
    const result: MeshStandardMaterial[] = [];
    model.traverse(object => {
      if (object instanceof Mesh && object.material instanceof MeshStandardMaterial && object.material.userData.glow) result.push(object.material);
    });
    return result;
  }, [model]);
  const targetPosition = useRef(new Vector3(18, 20, 22));
  const focusGoal = useRef(new Vector3(0, 2.7, 0));
  const transition = useRef(false);
  const zoomGoal = useRef(45);
  const desktop = size.width > 760;
  const availableWidth = desktop ? size.width - 415 : size.width - 40;
  const availableHeight = size.height - (desktop ? 300 : 450);
  const baseZoom = Math.max(3, Math.min(availableWidth / frame.width, Math.max(160, availableHeight - (pack ? 42 : 0)) / frame.height) * (pack && focus ? 0.85 : 0.92));
  const district = asset === 'skyscraper' || asset === 'tokyotower';
  const zoomLimit = district || pack ? 4 : 3;

  useEffect(() => {
    mixer.stopAllAction();
    const clip = model.animations.find(item => item.name === animationName) ?? model.animations[0];
    if (clip) { mixer.clipAction(clip).reset().play(); mixer.update(0); }
    return () => { mixer.stopAllAction(); };
  }, [mixer, model, animationName]);

  useEffect(() => () => mixer.uncacheRoot(model), [mixer, model]);

  useEffect(() => {
    camera.setViewOffset(size.width, size.height, desktop ? -size.width * 0.113 : 0,
      desktop ? 34 : -25, size.width, size.height);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, desktop]);

  useEffect(() => {
    focusGoal.current.copy(frame.target);
    targetPosition.current.copy(direction).multiplyScalar(Math.max(35, dimensions.y * 2)).add(frame.target);
    zoomGoal.current = baseZoom;
    transition.current = true;
  }, [asset, view, resetSignal, baseZoom, frame, direction, dimensions.y]);

  useEffect(() => {
    setDiorama(model, diorama);
  }, [model, diorama]);

  useEffect(() => {
    if (presentation.current) {
      presentation.current.scale.setScalar(reducedMotion ? 1 : 0.94);
      presentation.current.position.y = reducedMotion ? 0 : 0.2;
    }
    const timer = window.setTimeout(onReady, reducedMotion ? 80 : 500);
    return () => window.clearTimeout(timer);
  }, [model, onReady, reducedMotion]);

  useEffect(() => () => disposeAsset(model), [model]);

  useImperativeHandle(apiRef, () => ({
    zoom(direction) {
      const goal = camera.zoom * (direction > 0 ? 1.19 : 1 / 1.19);
      zoomGoal.current = Math.max(baseZoom * 0.55, Math.min(baseZoom * zoomLimit, goal));
      targetPosition.current.copy(camera.position);
      if (controls.current) focusGoal.current.copy(controls.current.target);
      transition.current = true;
    },
    async capture() {
      gl.render(scene, camera);
      return captureAsset(gl.domElement);
    },
  }), [baseZoom, camera, gl, scene, zoomLimit]);

  useFrame((_, delta) => {
    if (animationPlaying) mixer.update(Math.min(delta, 0.08) * animationSpeed);
    const ease = reducedMotion ? 1 : 1 - Math.exp(-delta * 7);
    if (presentation.current) {
      const group = presentation.current;
      group.scale.setScalar(group.scale.x + (1 - group.scale.x) * ease);
      group.position.y += (0 - group.position.y) * ease;
    }
    if (transition.current && controls.current) {
      camera.position.lerp(targetPosition.current, ease);
      camera.zoom += (zoomGoal.current - camera.zoom) * ease;
      camera.updateProjectionMatrix();
      controls.current.target.lerp(focusGoal.current, ease);
      controls.current.update();
      if (camera.position.distanceTo(targetPosition.current) < 0.015 && Math.abs(camera.zoom - zoomGoal.current) < 0.025 && controls.current.target.distanceTo(focusGoal.current) < 0.015) transition.current = false;
    }
    if (controls.current) controls.current.autoRotate = spin && !transition.current;
    const mix = reducedMotion ? 1 : 1 - Math.exp(-delta * 3);
    for (const material of glowMaterials) {
      const goal = material.userData.glow * (night ? 2.4 : 0.55);
      material.emissiveIntensity += (goal - material.emissiveIntensity) * mix;
    }
    if (hemisphere.current) hemisphere.current.intensity += ((night ? 0.85 : 1.65) - hemisphere.current.intensity) * mix;
    if (sunlight.current) sunlight.current.intensity += ((night ? 0.65 : 2.5) - sunlight.current.intensity) * mix;
    if (fillLight.current) fillLight.current.intensity += ((night ? 0.7 : 0.5) - fillLight.current.intensity) * mix;
    if (interior.current) interior.current.intensity += ((night ? 22 : 1.5) - interior.current.intensity) * mix;
    if (lanternLight.current) lanternLight.current.intensity += ((night ? asset === 'tokyotower' ? 100 : 14 : 0.5) - lanternLight.current.intensity) * mix;
  });

  return <>
    <hemisphereLight ref={hemisphere} args={['#f8ffe7', '#95a891', 1.65]} />
    <directionalLight ref={sunlight} position={[-radius * 0.58, dimensions.y * 1.6 + 7, radius * 0.8]} intensity={2.5} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-radius} shadow-camera-right={radius}
      shadow-camera-top={Math.max(radius, dimensions.y)} shadow-camera-bottom={-radius} shadow-camera-far={120}
      shadow-normalBias={0.035} shadow-bias={-0.0002} />
    <directionalLight ref={fillLight} position={[9, 8, -7]} color="#c3e5ee" intensity={0.5} />
    <pointLight ref={interior} position={[0.6, 2.75, 0.9]} color="#ffe1a4" intensity={1.5} distance={8} decay={2} />
    <pointLight ref={lanternLight} position={asset === 'tokyotower' ? [0, 10.5, 6.7] : asset === 'ramen' ? [2, 4.3, 3.25] : [0, 5.8, 2.7]}
      color={asset === 'ramen' || asset === 'tokyotower' ? '#ffb281' : '#d3ffc4'} intensity={0.5} distance={asset === 'tokyotower' ? 26 : 7} decay={2} />
    <group ref={presentation}>
      <primitive object={model} dispose={null} onClick={(event: ThreeEvent<MouseEvent>) => {
        if (pack && event.delta < 5 && event.object.userData.member) {
          event.stopPropagation(); onSelectMember(event.object.userData.member);
        }
      }} />
      {asset === 'ramen' && !reducedMotion && <Steam diorama={diorama} />}
      {!reducedMotion && (asset === 'sakura' || (asset === 'pagoda' && diorama)) && <SakuraPetals asset={asset} diorama={diorama} />}
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.066, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <shadowMaterial transparent opacity={night ? 0.22 : 0.12} color="#243c2b" />
    </mesh>
    <ContactShadows key={`${asset}-${diorama}-${night}`} position={[0, -0.062, 0]} opacity={night ? 0.35 : 0.25}
      scale={radius * 1.7} blur={2.6} far={Math.max(8, dimensions.y + 1)} resolution={512} frames={48} color="#304533" />
    <OrbitControls ref={controls} makeDefault target={[0, 2.7, 0]} enablePan panSpeed={0.6}
      enableDamping dampingFactor={0.08} rotateSpeed={0.65} zoomSpeed={0.8}
      autoRotate={spin} autoRotateSpeed={0.65}
      minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.1}
      minZoom={baseZoom * 0.55} maxZoom={baseZoom * zoomLimit}
      onStart={() => { transition.current = false; onInteract(); }} />
  </>;
});

class ViewerBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    return this.state.failed ? <div className="viewer-error"><span>Viewer 3D tidak tersedia.</span><p>Aktifkan WebGL di browser. Aset GLB tetap bisa diunduh.</p></div> : this.props.children;
  }
}

const AssetViewer = forwardRef<ViewerHandle, ViewerProps>(function AssetViewer(props, ref) {
  return <ViewerBoundary onError={props.onError}>
    <Canvas className="asset-canvas" orthographic shadows dpr={[1, 2]}
      camera={{ position: [18, 20, 22], zoom: 24, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}>
      <Scene {...props} ref={ref} />
    </Canvas>
  </ViewerBoundary>;
});

export default AssetViewer;