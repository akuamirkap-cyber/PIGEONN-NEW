import {
  AnimationClip, DynamicDrawUsage, Group, InstancedMesh, Mesh, Sphere, Vector3,
  type AnimationAction, type AnimationMixer, type MeshStandardMaterial,
} from 'three';
import type { WorldLibrary } from './library';
import { placeWorldActor } from './scenery';
import type { ActorPlacement } from './layout';
import { primaryActivity } from './citizenActivities';

export interface LiveActor {
  root: Group;
  object: Group;
  mixer: AnimationMixer;
  spec: ActorPlacement;
  coord: number;
  direction: number;
  halfLength: number;
  seed: number;
  waiting: boolean;
  state: 'moving' | 'posing' | 'waiting' | 'parked' | 'shopping' | 'eating' | 'serving' | 'queuing';
  primary: string;
  actions: Map<string, AnimationAction>;
  current: string;
  velocity: number;
  waitReason: 'train' | 'signal' | 'queue' | null;
}

export function spawnActor(library: WorldLibrary, spec: ActorPlacement, seed: number): LiveActor {
  const { root, object } = placeWorldActor(library, spec);
  const mixer = library.animate(object, spec.asset, seed);
  mixer.stopAllAction();
  const primary = spec.asset === 'characters' ? primaryActivity(spec.activity) : spec.asset === 'vehicles' ? 'Ride' : 'Play';
  const actions = new Map<string, AnimationAction>();
  for (const clip of object.animations) actions.set(clip.name, mixer.clipAction(clip));
  const base = object.animations.find(clip => clip.name === primary);
  const iconic = object.animations.find(clip => clip.name === 'Iconic');
  if (base) {
    const tracks = base.tracks.filter(track => spec.asset === 'vehicles' ? !track.name.toLowerCase().includes('wheel')
      : !/_(leg|knee|arm|fore)/.test(track.name));
    actions.set('Wait', mixer.clipAction(new AnimationClip('Wait', base.duration, tracks)));
  }
  if (iconic && spec.asset === 'vehicles') {
    actions.set('StationaryPose', mixer.clipAction(new AnimationClip('StationaryPose', iconic.duration,
      iconic.tracks.filter(track => !track.name.toLowerCase().includes('wheel')))));
  }
  const current = spec.parked ? 'Wait' : primary;
  actions.get(current)?.play();
  mixer.setTime(((seed * 0.41) % 4 + 4) % 4);
  return { root, object, mixer, spec, coord: spec.axis === 'x' ? spec.x : spec.z, direction: spec.direction ?? 1,
    halfLength: library.get(spec.asset, spec.member, spec.activity).size.z * spec.scale / 2, seed, waiting: false,
    state: spec.parked ? 'parked' : spec.activity === 'ramen' ? 'eating' : 'moving', primary, actions, current, velocity: spec.parked ? 0 : 4.3, waitReason: null };
}

export function actorAction(actor: LiveActor, name: string) {
  if (name === actor.current) return;
  const next = actor.actions.get(name);
  if (!next) return;
  next.stopFading().reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  const previous = actor.actions.get(actor.current);
  if (previous) previous.crossFadeTo(next, 0.3, false);
  actor.current = name;
}

interface InstanceBinding { mesh: Mesh; actor: LiveActor }
interface InstanceBatch { mesh: InstancedMesh; bindings: InstanceBinding[] }

export class ActorInstances {
  root = new Group();
  private batches: InstanceBatch[] = [];
  private actors: LiveActor[];

  constructor(actors: LiveActor[], name: string) {
    this.actors = actors;
    this.root.name = name;
    const buckets = new Map<string, InstanceBinding[]>();
    for (const actor of actors) actor.object.traverse(node => {
      if (!(node instanceof Mesh)) return;
      const key = `${node.geometry.uuid}:${(node.material as MeshStandardMaterial).uuid}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push({ mesh: node, actor });
    });
    // Bodies remain independently rigged; instancing keeps a moving crowd from multiplying draw calls.
    for (const bindings of buckets.values()) {
      const source = bindings[0].mesh;
      const mesh = new InstancedMesh(source.geometry, source.material, bindings.length);
      mesh.instanceMatrix.setUsage(DynamicDrawUsage);
      mesh.castShadow = name === 'Vehicles' && source.castShadow;
      mesh.receiveShadow = true;
      mesh.boundingSphere = new Sphere(new Vector3(0, 3, 0), 86);
      mesh.userData.worldInstances = bindings.map(binding => ({
        asset: binding.actor.spec.asset, member: binding.actor.spec.member,
      }));
      this.root.add(mesh);
      this.batches.push({ mesh, bindings });
    }
    this.update();
  }

  update() {
    this.actors.forEach(actor => actor.root.updateMatrixWorld(true));
    for (const batch of this.batches) {
      batch.bindings.forEach((binding, index) => batch.mesh.setMatrixAt(index, binding.mesh.matrixWorld));
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  dispose() {
    this.batches.forEach(batch => batch.mesh.dispose());
    this.batches.length = 0;
    this.actors.length = 0;
    this.root.clear();
  }
}