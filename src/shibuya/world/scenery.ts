import { BufferAttribute, Group, Mesh, MeshStandardMaterial, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildAssetObject, disposeAsset } from '../voxel/renderModel';
import { BUILDING_TIERS, sakuraPlacements, WORLD, type ActorPlacement, type BuildingPlacement, type District } from './layout';
import { buildWorldRoad, buildWorldTrees } from './road';
import { buildParkDetails, buildStreetFurniture } from './decorations';
import { buildRailInfrastructure } from './railway';
import { buildBusinessFurniture } from './businessFurniture';
import { buildRoadDetails, buildSidewalkDetails } from './streetDetails';
import { STREET_PROPS } from './propLayout';
import type { WorldLibrary } from './library';

export function bakeScenery(source: Group, name: string) {
  const output = new Group();
  output.name = name;
  source.updateMatrixWorld(true);
  const batches = new Map<string, { geometry: BufferGeometry[]; material: MeshStandardMaterial }>();
  // Vertex-color batching keeps the whole district lightweight, rather than one draw call per cube.
  source.traverse(node => {
    if (!(node instanceof Mesh)) return;
    const material = node.material as MeshStandardMaterial;
    const glow = material.userData.glow ?? 0;
    const key = `${material.map?.uuid ?? 'plain'}:${material.opacity}:${material.side}:${glow}:${glow ? material.emissive.getHexString() : ''}`;
    if (!batches.has(key)) {
      const copy = material.clone();
      copy.color.set('#ffffff');
      copy.vertexColors = true;
      batches.set(key, { geometry: [], material: copy });
    }
    const geometry = node.geometry.clone().applyMatrix4(node.matrixWorld);
    const count = geometry.getAttribute('position').count;
    const existingColors = geometry.getAttribute('color');
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = material.color.r * (existingColors ? existingColors.getX(i) : 1);
      colors[i * 3 + 1] = material.color.g * (existingColors ? existingColors.getY(i) : 1);
      colors[i * 3 + 2] = material.color.b * (existingColors ? existingColors.getZ(i) : 1);
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    batches.get(key)!.geometry.push(geometry);
  });
  for (const batch of batches.values()) {
    const geometry = mergeGeometries(batch.geometry, false);
    if (!geometry) throw new Error(`Unable to batch ${name}.`);
    batch.geometry.forEach(item => item.dispose());
    geometry.computeBoundingSphere();
    const mesh = new Mesh(geometry, batch.material);
    mesh.castShadow = !batch.material.transparent;
    mesh.receiveShadow = true;
    output.add(mesh);
  }
  return output;
}

export function placeBuilding(library: WorldLibrary, lot: BuildingPlacement) {
  const template = library.get(lot.asset);
  const rotation = lot.rotation ?? (lot.x < 0 ? Math.PI / 2 : -Math.PI / 2);
  const rotated = Math.abs(Math.sin(rotation)) > 0.5;
  const footprintX = rotated ? template.size.z : template.size.x;
  const footprintZ = rotated ? template.size.x : template.size.z;
  const scale = Math.min(lot.height / template.size.y, (lot.width - 0.6) / footprintX, (lot.depth - 0.6) / footprintZ);
  const actualHeight = template.size.y * scale;
  const tier = BUILDING_TIERS[lot.tier];
  if (actualHeight < tier.min - 0.025 || actualHeight > tier.max + 0.025) {
    throw new Error(`${lot.asset}: height ${actualHeight.toFixed(1)} is not suitable for ${lot.tier}.`);
  }
  const object = library.instance(lot.asset);
  object.position.set(lot.x, WORLD.pavementY + 0.015, lot.z);
  object.rotation.y = rotation;
  object.scale.setScalar(scale);
  object.userData.worldHeight = actualHeight;
  object.userData.buildingTier = lot.tier;
  const halfX = footprintX * scale / 2, halfZ = footprintZ * scale / 2;
  if (Math.abs(lot.x) - halfX < 9 || Math.abs(lot.z) - halfZ < 8 || Math.abs(lot.z) + halfZ > WORLD.chunkLength / 2 || Math.abs(lot.x) + halfX > 40) {
    throw new Error(`World asset ${lot.asset} overlaps a road or chunk edge.`);
  }
  return object;
}

export function placeWorldActor(library: WorldLibrary, spec: ActorPlacement) {
  const object = library.instance(spec.asset, spec.member, spec.activity);
  object.scale.setScalar(spec.scale);
  const root = new Group();
  root.name = `Placed_${spec.asset}_${spec.member}`;
  root.position.set(spec.x, spec.asset === 'vehicles' && !spec.parked ? WORLD.roadY + 0.008 : WORLD.pavementY + 0.016, spec.z);
  const direction = spec.direction ?? 1;
  root.rotation.y = spec.rotation ?? (spec.axis === 'x' ? direction * Math.PI / 2 : direction < 0 ? Math.PI : 0);
  root.add(object);
  return { root, object };
}

export function createDistrictScenery(library: WorldLibrary, district: District) {
  for (const prop of STREET_PROPS) for (const lot of district.buildings) {
    if (Math.abs(prop.x - lot.x) < (prop.footprint[0] + lot.width) / 2
      && Math.abs(prop.z - lot.z) < (prop.footprint[1] + lot.depth) / 2) {
      throw new Error(`${prop.kind} entered the plot of ${lot.asset}.`);
    }
  }
  const root = new Group();
  const rawRoad = buildAssetObject(buildWorldRoad(district));
  root.add(bakeScenery(rawRoad, 'Road'));
  disposeAsset(rawRoad);
  const roadDetail = buildAssetObject(buildRoadDetails(district));
  root.add(bakeScenery(roadDetail, 'Road_Details'));
  disposeAsset(roadDetail);
  const sidewalkDetail = buildAssetObject(buildSidewalkDetails());
  root.add(bakeScenery(sidewalkDetail, 'Sidewalk_Details'));
  disposeAsset(sidewalkDetail);

  const furniture = buildAssetObject(buildStreetFurniture(district));
  root.add(bakeScenery(furniture, 'Street_Furniture'));
  disposeAsset(furniture);
  const business = buildAssetObject(buildBusinessFurniture(district));
  root.add(bakeScenery(business, 'Business_Furniture'));
  disposeAsset(business);
  const railway = buildAssetObject(buildRailInfrastructure());
  root.add(bakeScenery(railway, 'Rail_Infrastructure'));
  disposeAsset(railway);

  const rawBuildings = new Group();
  district.buildings.forEach(lot => rawBuildings.add(placeBuilding(library, lot)));
  root.userData.buildingHeights = rawBuildings.children.map(object => ({ tier: object.userData.buildingTier, height: object.userData.worldHeight }));
  root.add(bakeScenery(rawBuildings, 'Buildings'));
  rawBuildings.clear();

  const rawTrees = new Group();
  const green = buildAssetObject(buildWorldTrees(district));
  rawTrees.add(green);
  const details = buildAssetObject(buildParkDetails(district));
  rawTrees.add(details);
  for (const [x, z] of sakuraPlacements(district)) {
    const tree = library.instance('sakura');
    tree.position.set(x, WORLD.pavementY + 0.015, z);
    tree.scale.setScalar(district.id === 'sakura' ? 0.82 : 0.59);
    rawTrees.add(tree);
  }
  root.add(bakeScenery(rawTrees, 'Trees'));
  disposeAsset(green);
  disposeAsset(details);
  root.name = `District_${district.id}`;
  return root;
}

export function setSceneryNight(root: Group, night: boolean) {
  root.traverse(node => {
    if (node instanceof Mesh) {
      const material = node.material as MeshStandardMaterial;
      if (material.userData.glow) material.emissiveIntensity = material.userData.glow * (night ? 2.5 : 0.45);
    }
  });
}