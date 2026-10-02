import { AnimationMixer, Box3, Group, Mesh, MeshStandardMaterial, Vector3, type AnimationClip } from 'three';
import { getAssetData } from '../voxel/models';
import { buildAssetObject, disposeAsset } from '../voxel/renderModel';
import type { AssetId } from '../voxel/types';
import type { Vec3 } from '../voxel/types';
import { isMotorcycle, isPackAsset } from '../voxel/packCatalog';
import { bakeScenery } from './scenery';
import { citizenActivityModel, primaryActivity, type CitizenActivity } from './citizenActivities';

export interface WorldTemplate {
  object: Group;
  size: Vector3;
  clips: AnimationClip[];
}

export class WorldLibrary {
  private templates = new Map<string, WorldTemplate>();
  private glowingMaterials = new Set<MeshStandardMaterial>();

  get(asset: AssetId, member?: string, activity?: CitizenActivity): WorldTemplate {
    const key = `${asset}:${member ?? ''}:${activity ?? ''}`;
    const cached = this.templates.get(key);
    if (cached) return cached;
    const source = getAssetData(asset, member);
    const data = asset === 'characters' && member ? citizenActivityModel(source, member, activity) : source;
    const motorcycle = asset === 'vehicles' && isMotorcycle(member ?? '');
    const rider = `rider_${member}_`;
    const nodes = data.nodes?.map(node => {
      const copy = { ...node, p: [...node.p] as Vec3 };
      if (!node.parent && isPackAsset(asset)) copy.rotation = [node.rotation?.[0] ?? 0, 0, node.rotation?.[2] ?? 0];
      if (motorcycle && node.name === `${rider}root`) copy.p[1] += 0.35;
      if (motorcycle && (node.name === `${rider}legL` || node.name === `${rider}legR`)) copy.p[0] /= 0.66;
      return copy;
    });
    // Remove the old individual diorama bases. Every asset now sits on one common ground plane.
    const object = buildAssetObject({
      ...data,
      boxes: data.boxes.filter(box => box.part === 'store'),
      panels: data.panels.filter(panel => panel.part === 'store'),
      nodes,
    });
    // Riders use the same body scale as pedestrians, while the motorcycle keeps its lane-sized footprint.
    if (motorcycle) object.getObjectByName(`${rider}root`)!.scale.setScalar(0.66);
    if (isPackAsset(asset)) {
      const joints: Group[] = [];
      object.traverse(node => { if (node instanceof Group && node.children.some(child => child instanceof Mesh)) joints.push(node); });
      for (const joint of joints) {
        const meshes = joint.children.filter(child => child instanceof Mesh) as Mesh[];
        const source = new Group();
        meshes.forEach(mesh => source.add(mesh.clone()));
        const baked = bakeScenery(source, `Joint_${joint.name}`);
        meshes.forEach(mesh => {
          joint.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as MeshStandardMaterial).dispose();
        });
        while (baked.children.length) joint.add(baked.children[0]);
      }
    }
    object.getObjectByName('Diorama')!.visible = false;
    object.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(object);
    const size = bounds.getSize(new Vector3());
    const characterRoot = asset === 'characters' ? object.getObjectByName(`character_${member}_root`) : undefined;
    object.position.set(characterRoot ? -characterRoot.position.x : -(bounds.min.x + bounds.max.x) / 2,
      -bounds.min.y, characterRoot ? -characterRoot.position.z : -(bounds.min.z + bounds.max.z) / 2);
    const normalized = new Group();
    normalized.name = `World_${asset}_${member ?? 'building'}`;
    normalized.add(object);
    normalized.animations = object.animations;
    normalized.userData.activity = activity;
    normalized.traverse(node => {
      node.userData.worldAsset = asset;
      node.userData.worldMember = member;
      if (node instanceof Mesh) {
        const material = node.material as MeshStandardMaterial;
        if (material.userData.glow) this.glowingMaterials.add(material);
      }
    });
    const template = { object: normalized, size, clips: object.animations };
    this.templates.set(key, template);
    return template;
  }

  instance(asset: AssetId, member?: string, activity?: CitizenActivity) {
    return this.get(asset, member, activity).object.clone(true);
  }

  animate(object: Group, asset: AssetId, seed: number) {
    const mixer = new AnimationMixer(object);
    const name = asset === 'characters' ? primaryActivity(object.userData.activity) : asset === 'vehicles' ? 'Ride' : 'Play';
    const clip = object.animations.find(item => item.name === name);
    if (clip) { mixer.clipAction(clip).play(); mixer.setTime(((seed % 4) + 4) % 4); }
    return mixer;
  }

  setNight(night: boolean) {
    for (const material of this.glowingMaterials) material.emissiveIntensity = material.userData.glow * (night ? 2.6 : 0.45);
  }

  dispose() {
    for (const template of this.templates.values()) disposeAsset(template.object);
    this.templates.clear();
    this.glowingMaterials.clear();
  }
}