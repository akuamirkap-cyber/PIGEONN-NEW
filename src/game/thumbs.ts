import * as THREE from "three";
import { SKINS } from "./skins";
import { useUI } from "./store";
import { buildPigeonGroup } from "./pigeonRig";
import { curveUniforms } from "./curve";

export const THUMB_FRAME_COUNT = 16;
const cache = new Map<string, { first: string; sprite: string }>();
let failed = false;
let listeners: (() => void)[] = [];

export function getThumb(id: string): string | undefined {
  return cache.get(id)?.first;
}

export function getThumbSprite(id: string): string | undefined {
  return cache.get(id)?.sprite;
}

export function onThumbsReady(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Renders every skin into one sixteen-frame sprite strip. CSS steps through the
 * strip in sync for every card, avoiding React re-renders and the stutter that
 * comes from replacing many large data URLs on every frame.
 */
export function ensureThumbs(size = 208): boolean {
  if (cache.size === SKINS.length) return true;
  if (failed || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = size * THUMB_FRAME_COUNT;
    spriteCanvas.height = size;
    const spriteContext = spriteCanvas.getContext("2d");
    if (!spriteContext) return false;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "low-power" });
    renderer.setPixelRatio(1);
    renderer.setSize(size, size, false);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#b0c4d8", 1.7));
    scene.add(new THREE.AmbientLight("#ffffff", 0.2));
    const sun = new THREE.DirectionalLight("#ffffff", 2.1);
    sun.position.set(-2, 25, 4.5);
    scene.add(sun);

    // Almost eye-level: the rider should read front-on, never like a board seen from above.
    const half = 0.88;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
    cam.position.set(-5.2, 0.8, 7.4).normalize().multiplyScalar(30).add(new THREE.Vector3(0, 0.64, 0));
    cam.lookAt(0, 0.64, 0);

    const savedDown = curveUniforms.uCurveDown.value;
    curveUniforms.uCurveDown.value = 0;
    for (const skin of SKINS) {
      const { group, dispose } = buildPigeonGroup(skin, "default", useUI.getState().wheelColor);
      group.scale.setScalar(1.1);
      scene.add(group);
      for (let frame = 0; frame < THUMB_FRAME_COUNT; frame += 1) {
        // The first frame is the 3/4 showcase view, then the rider orbits in true 3D.
        group.rotation.y = 4.35 + (frame / THUMB_FRAME_COUNT) * Math.PI * 2;
        renderer.render(scene, cam);
        spriteContext.drawImage(canvas, frame * size, 0, size, size);
      }
      cache.set(skin.id, {
        first: canvas.toDataURL("image/png"),
        sprite: spriteCanvas.toDataURL("image/png"),
      });
      spriteContext.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
      scene.remove(group);
      dispose();
    }
    curveUniforms.uCurveDown.value = savedDown;
    renderer.dispose();
    listeners.forEach((l) => l());
    return true;
  } catch {
    failed = true;
    return false;
  }
}
