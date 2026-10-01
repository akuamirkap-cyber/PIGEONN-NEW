import * as THREE from "three";

/**
 * Subway-Surfers style "world curve": every vertex is bent downward (and optionally sideways)
 * based on its distance in front of the camera, so the road rolls over the horizon like a small planet.
 * A light distance haze is computed in the same patch (no scene.fog), so it can never wash out the screen:
 * it is clamped, range-controlled and only applied to the far end of the visible world.
 *
 * Safety: if any shader fails to compile on the device, `disableCurve()` restores the stock shaders.
 */
export const curveUniforms = {
  uCurveOrigin: { value: new THREE.Vector3() }, // world-space point where bending starts (near the camera)
  uCurveDir: { value: new THREE.Vector3(1, 0, 0) }, // horizontal forward direction of travel
  uCurveDown: { value: 0.0 }, // downward bend strength
  uCurveSide: { value: 0.0 }, // sideways bend strength (+ = to the right of travel)
  uCurveStart: { value: 6.0 }, // distance ahead before bending kicks in
  uHazeColor: { value: new THREE.Color("#dbeeff") },
  uHazeRange: { value: new THREE.Vector2(1e6, 2e6) }, // (start, end) view distance; defaults = no haze
};

const vertexPars = /* glsl */ `
uniform vec3 uCurveOrigin;
uniform vec3 uCurveDir;
uniform float uCurveDown;
uniform float uCurveSide;
uniform float uCurveStart;
varying float vPigeonDist;
vec3 pigeonCurve(vec3 wp) {
  float ahead = dot(wp - uCurveOrigin, uCurveDir) - uCurveStart;
  float a = max(ahead, 0.0);
  float a2 = a * a;
  vec3 side = vec3(-uCurveDir.z, 0.0, uCurveDir.x);
  wp.y -= a2 * uCurveDown;
  wp += side * (a2 * uCurveSide);
  return wp;
}
`;

// Replaces three's <project_vertex>: same math, but through the bent world position.
const vertexBody = /* glsl */ `
vec4 pcWorld = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  pcWorld = instanceMatrix * pcWorld;
#endif
pcWorld = modelMatrix * pcWorld;
pcWorld.xyz = pigeonCurve( pcWorld.xyz );
vec4 mvPosition = viewMatrix * pcWorld;
gl_Position = projectionMatrix * mvPosition;
vPigeonDist = length( mvPosition.xyz );
`;

const fragmentPars = /* glsl */ `
uniform vec3 uHazeColor;
uniform vec2 uHazeRange;
varying float vPigeonDist;
`;

const fragmentHaze = /* glsl */ `
#include <fog_fragment>
{
  float hz = clamp( ( vPigeonDist - uHazeRange.x ) / max( uHazeRange.y - uHazeRange.x, 0.001 ), 0.0, 1.0 );
  hz = hz * hz * ( 3.0 - 2.0 * hz );
  gl_FragColor.rgb = mix( gl_FragColor.rgb, uHazeColor, hz * 0.92 );
}
`;

interface Entry {
  mat: THREE.Material;
  prevCompile: THREE.Material["onBeforeCompile"];
  prevKey: THREE.Material["customProgramCacheKey"];
}
const registry = new Map<THREE.Material, Entry>();
export let curveDisabled = false;

/** Patch a material so its vertices follow the world curve. Safe to call multiple times. */
export function applyCurve<T extends THREE.Material>(mat: T): T {
  if (curveDisabled || registry.has(mat)) return mat;
  const entry: Entry = { mat, prevCompile: mat.onBeforeCompile, prevKey: mat.customProgramCacheKey };
  registry.set(mat, entry);
  mat.onBeforeCompile = (shader, renderer) => {
    entry.prevCompile?.call(mat, shader, renderer);
    Object.assign(shader.uniforms, curveUniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${vertexPars}`)
      .replace("#include <project_vertex>", vertexBody)
      .replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
worldPosition = pcWorld;
#endif`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${fragmentPars}`)
      .replace("#include <fog_fragment>", fragmentHaze);
  };
  // make sure three doesn't reuse a cached, unpatched program
  mat.customProgramCacheKey = () => "pigeon-curve-v2";
  mat.needsUpdate = true;
  return mat;
}

/** Depth material for shadows that bends the same way (shared by all casters). */
export const curvedDepthMaterial = applyCurve(new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking }));

/** Walk a scene and patch every material + shadow depth material found. */
export function applyCurveToScene(root: THREE.Object3D) {
  if (curveDisabled) return;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    if (m.userData && m.userData.noCurve) return; // distant backdrop layers must not be bent
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    for (const mat of mats) if (mat && !(mat as THREE.ShaderMaterial).isShaderMaterial) applyCurve(mat);
    if (m.castShadow) m.customDepthMaterial = curvedDepthMaterial;
  });
}

/**
 * Emergency fallback: restore stock shaders everywhere (called when the GPU driver rejects a patched shader).
 * The game keeps running with a flat world and regular three.js fog.
 */
export function disableCurve(root?: THREE.Object3D) {
  if (curveDisabled) return;
  curveDisabled = true;
  for (const e of registry.values()) {
    e.mat.onBeforeCompile = e.prevCompile;
    e.mat.customProgramCacheKey = e.prevKey;
    e.mat.needsUpdate = true;
  }
  registry.clear();
  curveUniforms.uCurveDown.value = 0;
  curveUniforms.uCurveSide.value = 0;
  root?.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.customDepthMaterial === curvedDepthMaterial) m.customDepthMaterial = undefined;
  });
}
