import * as THREE from "three";
import { SKINS } from "./skins";
import { useUI } from "./store";
import { buildPigeonGroup } from "./pigeonRig";
import { curveUniforms } from "./curve";

const cache = new Map<string, string>();
let failed = false;
let listeners: (() => void)[] = [];

export function getThumb(id: string): string | undefined {
  return cache.get(id);
}
export function onThumbsReady(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * Renders every skin once with a small offscreen WebGL renderer (same iso angle + lighting as the game)
 * and caches the results as PNG data URLs for the collection grid. Falls back gracefully if WebGL fails.
 */
export function ensureThumbs(size = 208): boolean {
  if (cache.size === SKINS.length) return true;
  if (failed || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
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

    // Keep the rig readable inside the larger cards: a slightly tighter ortho frame
    // makes the feet, board, and riding pose survive the small collection grid.
    const half = 0.98;
    const cam = new THREE.OrthographicCamera(-half, half, half, -half, 0.1, 100);
    cam.position.set(-3.4, 7, 5.2).normalize().multiplyScalar(30).add(new THREE.Vector3(0, 0.75, 0));
    cam.lookAt(0, 0.75, 0);

    const savedDown = curveUniforms.uCurveDown.value;
    curveUniforms.uCurveDown.value = 0;
    for (const skin of SKINS) {
      const { group, dispose } = buildPigeonGroup(skin, "default", useUI.getState().wheelColor);
      group.rotation.y = 4.35; // 3/4 front view
      scene.add(group);
      renderer.render(scene, cam);
      cache.set(skin.id, canvas.toDataURL("image/png"));
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
