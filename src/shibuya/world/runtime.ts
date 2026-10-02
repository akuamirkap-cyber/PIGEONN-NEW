import { BoxGeometry, Color, Group, InstancedMesh, MeshBasicMaterial, Object3D } from 'three';
import { disposeAsset } from '../voxel/renderModel';
import { WorldLibrary } from './library';
import { createDistrictScenery, setSceneryNight } from './scenery';
import { ActorInstances, actorAction, spawnActor, type LiveActor } from './actors';
import { shoppingStage } from './citizenActivities';
import { isMotorcycle } from '../voxel/packCatalog';
import { DECORATION_FEATURES, STREET_PROPS } from './propLayout';
import { RailwayLibrary, type RailwayInstance } from './railway';
import { actorPose, RAILWAY, railwayStop, railState, stopAdvance, type RailState } from './simulation';
import {
  BUILDING_TIERS, crossRoadGreen, DISTRICTS, getDistrict, mainRoadGreen, WORLD, worldProgress,
  type District, type WorldLayers,
} from './layout';

export interface WorldChunk {
  index: number;
  district: District;
  root: Group;
  scenery: Group;
  actors: LiveActor[];
  batches: ActorInstances[];
  people: Group;
  vehicles: Group;
  animals: Group;
  signals: InstancedMesh;
  railway: RailwayInstance;
  populated: boolean;
}

export interface RailReport { label: string; phase: RailState['phase']; waiting: number; secondsToOpen: number }

export class WorldRuntime {
  library = new WorldLibrary();
  root = new Group();
  chunks = new Map<number, WorldChunk>();
  private scenery = new Map<string, Group>();
  private signalGeometry = new BoxGeometry(0.15, 0.15, 0.026);
  private signalMaterial = new MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  private signalColors = [new Color('#dc6850'), new Color('#e2bc58'), new Color('#8acc69')];
  private signalDim = [new Color('#653e32'), new Color('#655839'), new Color('#385541')];
  private railwayLibrary: RailwayLibrary | null = null;
  private railEvents = new Map<number, number>();
  private lastSignal = -1;
  private night = false;
  private lastTime = 12.5;

  constructor() { this.root.name = 'Shibuya_Endless_World'; }

  private getScenery(district: District) {
    let cached = this.scenery.get(district.id);
    if (!cached) {
      cached = createDistrictScenery(this.library, district);
      setSceneryNight(cached, this.night);
      this.scenery.set(district.id, cached);
    }
    return cached;
  }

  private makeSignals() {
    const mesh = new InstancedMesh(this.signalGeometry, this.signalMaterial, 24);
    mesh.name = 'Traffic_Signals';
    const dummy = new Object3D();
    let index = 0;
    for (const x of [-6.65, 6.65]) for (const z of [-6.65, 6.65]) {
      for (const axis of ['z', 'x']) for (let bulb = 0; bulb < 3; bulb++) {
        dummy.position.set(axis === 'z' ? x - 0.31 + bulb * 0.31 : x + Math.sign(x) * 0.161,
          axis === 'z' ? 3.45 : 2.93, axis === 'z' ? z + Math.sign(z) * 0.161 : z - 0.31 + bulb * 0.31);
        dummy.rotation.set(0, axis === 'z' ? z > 0 ? 0 : Math.PI : x > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index++, this.signalDim[bulb]);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  private makeChunk(index: number): WorldChunk {
    const district = getDistrict(index);
    const root = new Group(); root.name = `Block_${index}_${district.id}`;
    const scenery = this.getScenery(district).clone(true);
    const people = new Group(); people.name = 'People';
    const vehicles = new Group(); vehicles.name = 'Vehicles';
    const animals = new Group(); animals.name = 'Animals';
    const signals = this.makeSignals();
    this.railwayLibrary ??= new RailwayLibrary();
    const railway = this.railwayLibrary.create();
    root.add(scenery, people, vehicles, animals, signals, railway.root);
    this.root.add(root);
    return { index, district, root, scenery, actors: [], batches: [], people, vehicles, animals, signals, railway, populated: false };
  }

  populate(chunk: WorldChunk) {
    if (chunk.populated) return;
    let order = 0;
    const placements = [
      { specs: [...chunk.district.people, ...chunk.district.crowd, ...chunk.district.activities], parent: chunk.people, name: 'People' },
      { specs: [...chunk.district.vehicles, ...chunk.district.parking], parent: chunk.vehicles, name: 'Vehicles' },
      { specs: chunk.district.animals, parent: chunk.animals, name: 'Animals' },
    ];
    for (const placement of placements) {
      const actors = placement.specs.map(spec => spawnActor(this.library, spec, order++ + (chunk.index % 4 + 4) % 4 * 2.7));
      const batch = new ActorInstances(actors, placement.name);
      chunk.actors.push(...actors);
      chunk.batches.push(batch);
      placement.parent.add(batch.root);
    }
    this.library.setNight(this.night);
    chunk.populated = true;
  }

  setWindow(center: number) {
    for (const [index, chunk] of this.chunks) {
      if (index < center - 1 || index > center + 3) {
        this.releaseChunk(chunk);
        this.chunks.delete(index);
        this.railEvents.delete(index);
      }
    }
    // Endless distance never grows scene memory: keep only five recyclable blocks.
    for (let index = center - 1; index <= center + 3; index++) {
      if (!this.chunks.has(index)) this.chunks.set(index, this.makeChunk(index));
    }
    this.lastSignal = -1;
  }

  private updateSignals(time: number) {
    const phase = time % WORLD.trafficCycle;
    const main = phase < 10 ? 2 : phase < 11 ? 1 : 0;
    const cross = phase >= 16 && phase < 22 ? 2 : phase >= 22 && phase < 23 ? 1 : 0;
    const state = main * 3 + cross;
    if (state === this.lastSignal) return;
    this.lastSignal = state;
    for (const chunk of this.chunks.values()) {
      for (let i = 0; i < 24; i++) {
        const bulb = i % 3, axis = Math.floor(i / 3) % 2;
        chunk.signals.setColorAt(i, (axis === 0 ? main : cross) === bulb ? this.signalColors[bulb] : this.signalDim[bulb]);
      }
      chunk.signals.instanceColor!.needsUpdate = true;
    }
  }

  private animateVehicle(actor: LiveActor, chunk: WorldChunk, delta: number, time: number, rail: RailState, enabledRail: boolean) {
    const { spec } = actor;
    actor.waitReason = null;
    if (spec.parked) {
      const posing = actorPose(time, actor.seed);
      actor.state = 'parked';
      actorAction(actor, posing ? 'StationaryPose' : 'Wait');
      actor.mixer.update(delta);
      return;
    }
    const green = spec.axis === 'x' ? crossRoadGreen(time) : mainRoadGreen(time);
    const stops: { coord: number; reason: 'train' | 'signal' | 'queue' }[] = [];
    if (!green) stops.push({ coord: -actor.direction * (actor.halfLength + 8.5), reason: 'signal' });
    if (enabledRail && rail.blocked && spec.axis !== 'x') stops.push({ coord: railwayStop(actor.direction, actor.halfLength), reason: 'train' });
    const cruiseSpeed = isMotorcycle(spec.member) ? 5.2 : spec.member === 'bus' ? 3.8 : 4.5;
    let desired = cruiseSpeed;
    for (const stop of stops) {
      const ahead = (stop.coord - actor.coord) * actor.direction;
      if (ahead >= -0.001 && ahead < 8) {
        desired = Math.min(desired, Math.sqrt(5.6 * Math.max(0, ahead - 0.035)));
        if (ahead < 0.25) actor.waitReason = stop.reason;
      }
    }
    for (const other of chunk.actors) {
      if (other === actor || other.spec.asset !== 'vehicles' || other.spec.parked || other.direction !== actor.direction
        || (other.spec.axis ?? 'z') !== (spec.axis ?? 'z')
        || Math.abs(spec.axis === 'x' ? other.spec.z - spec.z : other.spec.x - spec.x) > 0.1) continue;
      const gap = (other.coord - actor.coord) * actor.direction;
      if (gap > 0 && gap < 16) {
        const coord = other.coord - actor.direction * (actor.halfLength + other.halfLength + 1.3);
        const free = (coord - actor.coord) * actor.direction;
        desired = Math.min(desired, Math.sqrt(5.6 * Math.max(0, free - 0.04)));
        stops.push({ coord, reason: other.waitReason === 'train' ? 'train' : 'queue' });
        if (free < 0.2) actor.waitReason = other.waitReason === 'train' ? 'train' : 'queue';
      }
    }
    actor.velocity += Math.max(-delta * 4, Math.min(delta * 2.4, desired - actor.velocity));
    let next = actor.coord + delta * actor.velocity * actor.direction;
    for (const stop of stops) next = stopAdvance(actor.coord, next, actor.direction, stop.coord);
    const limit = spec.axis === 'x' ? WORLD.width / 2 - actor.halfLength - 0.4 : WORLD.chunkLength / 2 - actor.halfLength - 0.4;
    if (next > limit || next < -limit) {
      const wrapped = -actor.direction * limit;
      const occupied = chunk.actors.some(other => other !== actor && other.spec.asset === 'vehicles' && !other.spec.parked
        && other.direction === actor.direction && (other.spec.axis ?? 'z') === (spec.axis ?? 'z')
        && Math.abs(spec.axis === 'x' ? other.spec.z - spec.z : other.spec.x - spec.x) < 0.1
        && Math.abs(other.coord - wrapped) < actor.halfLength + other.halfLength + 1.4);
      next = occupied ? actor.direction * limit : wrapped;
      if (occupied) { actor.velocity = 0; actor.waitReason = 'queue'; }
    }
    const moved = Math.abs(next - actor.coord) > 0.0001;
    actor.waiting = !moved || actor.velocity < 0.075;
    if (!moved) actor.velocity = 0;
    actor.coord = next;
    if (spec.axis === 'x') actor.root.position.x = next;
    else actor.root.position.z = next;
    if (!actor.waiting) {
      actor.state = 'moving'; actor.waitReason = null; actorAction(actor, 'Ride');
    } else {
      actor.state = 'waiting';
      actorAction(actor, actorPose(time, actor.seed) ? 'StationaryPose' : 'Wait');
    }
    actor.mixer.update(delta * (actor.waiting ? 1 : Math.max(0.12, actor.velocity / cruiseSpeed)));
  }

  private animateCustomer(actor: LiveActor, delta: number, time: number) {
    const { spec } = actor;
    actor.waitReason = null;
    if (spec.activity === 'ramen') {
      actor.state = 'eating';
      actorAction(actor, actorPose(time, actor.seed) ? 'EatPause' : 'Eat');
    } else if (spec.activity === 'shopping' && spec.destination) {
      const stage = shoppingStage(time + (spec.activityOffset ?? actor.seed * 1.63), 0);
      const returning = stage === 'leave' || stage === 'rest';
      const [x, z] = returning ? [spec.x, spec.z] : stage === 'pay' ? spec.checkout ?? spec.destination : spec.destination;
      const dx = x - actor.root.position.x, dz = z - actor.root.position.z;
      const remaining = Math.hypot(dx, dz);
      const moving = remaining > 0.025;
      if (moving) {
        const amount = Math.min(remaining, delta * 0.46);
        actor.root.position.x += dx / remaining * amount;
        actor.root.position.z += dz / remaining * amount;
        actorAction(actor, 'ShopWalk');
      } else actorAction(actor, !returning && stage === 'pay' ? 'Shop' : !returning ? 'Browse' : 'ShopPause');
      const heading = moving ? Math.atan2(dx, dz) : spec.rotation ?? 0;
      let difference = heading - actor.root.rotation.y;
      if (difference > Math.PI) difference -= Math.PI * 2;
      if (difference < -Math.PI) difference += Math.PI * 2;
      actor.root.rotation.y += difference * (1 - Math.exp(-delta * 7));
      actor.coord = actor.root.position.z;
      actor.state = 'shopping';
    } else if (spec.activity === 'serve') {
      actor.state = 'serving'; actorAction(actor, actorPose(time, actor.seed) ? 'Iconic' : 'Serve');
    } else if (spec.activity === 'checkout') {
      actor.state = 'serving'; actorAction(actor, actorPose(time, actor.seed) ? 'Browse' : 'Shop');
    } else {
      actor.state = 'queuing'; actorAction(actor, actorPose(time, actor.seed) ? 'Browse' : 'ShopPause');
    }
    actor.mixer.update(delta);
  }

  private animatePedestrian(actor: LiveActor, delta: number, time: number, rail: RailState, enabledRail: boolean) {
    const { spec } = actor;
    const posing = !spec.watchTrain && actorPose(time, actor.seed);
    const [min, max] = spec.path ?? [spec.z - (spec.walkRange ?? 1.8), spec.z + (spec.walkRange ?? 1.8)];
    let next = actor.coord;
    const atRailApproach = spec.watchTrain && Math.abs(actor.coord - RAILWAY.z) < 8.5;
    const speed = atRailApproach ? RAILWAY.pedestrianCrossingSpeed : spec.member === 'ninja' ? 0.66 : 0.39;
    if (!posing) next += delta * speed * actor.direction;
    if (enabledRail && rail.blocked) next = stopAdvance(actor.coord, next, actor.direction, railwayStop(actor.direction, 0.28, true));
    const waiting = !posing && delta > 0 && Math.abs(next - actor.coord) < 0.0001;
    actor.waiting = waiting;
    actor.waitReason = waiting && enabledRail && rail.blocked ? 'train' : null;
    if (next < min || next > max) {
      actor.direction *= -1;
      next = Math.max(min, Math.min(max, next));
    }
    actor.coord = next;
    actor.root.position.z = next;
    const distanceToRail = Math.abs(next - RAILWAY.z);
    const ramp = Math.max(0, Math.min(1, (distanceToRail - 3.6) / 2.2));
    actor.root.position.y = distanceToRail < 5.8 ? 0.243 + (WORLD.pavementY + 0.016 - 0.243) * ramp : WORLD.pavementY + 0.016;
    const desiredRotation = posing && spec.rotation !== undefined ? spec.rotation : actor.direction < 0 ? Math.PI : 0;
    let difference = desiredRotation - actor.root.rotation.y;
    if (difference > Math.PI) difference -= Math.PI * 2;
    if (difference < -Math.PI) difference += Math.PI * 2;
    actor.root.rotation.y += difference * (1 - Math.exp(-delta * 6));
    if (posing || (waiting && actorPose(time, actor.seed))) {
      actor.state = 'posing'; actorAction(actor, 'Iconic');
    } else if (waiting) {
      actor.state = 'waiting'; actorAction(actor, 'Wait');
    } else {
      actor.state = 'moving'; actorAction(actor, 'Walk');
    }
    actor.mixer.update(delta * (atRailApproach && !waiting ? 2.4 : 1));
  }

  update(distance: number, delta: number, time: number, layers: WorldLayers, animated: boolean, mobile: boolean) {
    this.lastTime = time;
    const progress = worldProgress(distance);
    if (!this.chunks.has(progress.index + 3) || this.chunks.size !== 5) this.setWindow(progress.index);
    this.updateSignals(time);
    for (const chunk of this.chunks.values()) {
      const z = -(chunk.index - progress.index) * WORLD.chunkLength + progress.offset;
      chunk.root.position.z = z;
      const nearby = Math.abs(z + 17) < (mobile ? 95 : 143);
      if (nearby) this.populate(chunk);
      chunk.scenery.getObjectByName('Buildings')!.visible = layers.buildings;
      chunk.scenery.getObjectByName('Street_Furniture')!.visible = layers.decor;
      chunk.scenery.getObjectByName('Road_Details')!.visible = layers.decor;
      chunk.scenery.getObjectByName('Sidewalk_Details')!.visible = layers.decor;
      chunk.scenery.getObjectByName('Business_Furniture')!.visible = layers.buildings;
      chunk.scenery.getObjectByName('Trees')!.visible = layers.trees;
      chunk.scenery.getObjectByName('Rail_Infrastructure')!.visible = layers.railway;
      chunk.railway.root.visible = layers.railway;
      const rail = railState(time, chunk.index, this.railEvents.get(chunk.index));
      this.railwayLibrary!.update(chunk.railway, rail, this.night);
      chunk.people.visible = nearby && layers.people;
      chunk.vehicles.visible = nearby && layers.vehicles;
      chunk.animals.visible = nearby && layers.animals;
      let placementVisibilityChanged = false;
      chunk.actors.forEach(actor => {
        if (actor.spec.activity && actor.root.scale.x !== (layers.buildings ? 1 : 0)) {
          actor.root.scale.setScalar(layers.buildings ? 1 : 0);
          placementVisibilityChanged = true;
        }
      });
      if (!nearby || !animated) {
        if (placementVisibilityChanged) chunk.batches.forEach(batch => batch.update());
        continue;
      }
      const ordered = [...chunk.actors].sort((a, b) => b.coord * b.direction - a.coord * a.direction);
      for (const actor of ordered) {
        const { spec } = actor;
        if (!(spec.asset === 'characters' ? layers.people : spec.asset === 'vehicles' ? layers.vehicles : layers.animals)) continue;
        if (spec.asset === 'vehicles') this.animateVehicle(actor, chunk, delta, time, rail, layers.railway);
        else if (spec.asset === 'characters') {
          if (spec.activity) this.animateCustomer(actor, delta, time);
          else this.animatePedestrian(actor, delta, time, rail, layers.railway);
        }
        else {
          const pose = actorPose(time, actor.seed);
          actorAction(actor, pose ? 'Iconic' : 'Play');
          actor.state = pose ? 'posing' : 'moving';
          if (['shiba', 'deer', 'kitsune'].includes(spec.member)) {
            actor.root.position.z = spec.z + (pose ? 0 : Math.sin(time * 0.33 + actor.seed) * 0.43);
          }
          actor.mixer.update(delta);
        }
      }
      chunk.batches.forEach(batch => batch.update());
    }
  }

  triggerTrain(index: number, time: number) {
    this.railEvents.set(index, time);
    const chunk = this.chunks.get(index);
    if (!chunk) return;
    this.populate(chunk);
    for (const lane of [-4.5, -1.5, 1.5, 4.5]) {
      const direction = lane < 0 ? -1 : 1;
      const approach = chunk.actors.filter(actor => actor.spec.asset === 'vehicles' && !actor.spec.parked
        && actor.spec.axis !== 'x' && actor.spec.x === lane && (actor.coord - railwayStop(direction, actor.halfLength)) * direction <= 0)
        .sort((a, b) => (b.coord - a.coord) * direction).slice(0, 2);
      let previous: LiveActor | undefined;
      for (const actor of approach) {
        const coord = previous ? previous.coord - direction * (previous.halfLength + actor.halfLength + 1.5)
          : railwayStop(direction, actor.halfLength) - direction * 0.4;
        if (Math.abs(coord) > WORLD.chunkLength / 2 - actor.halfLength) continue;
        actor.coord = coord; actor.root.position.z = coord; actor.velocity = 0.5;
        previous = actor;
      }
    }
    for (const actor of chunk.actors) {
      if (actor.spec.watchTrain) {
        actor.coord = railwayStop(actor.direction, 0.28, true) - actor.direction * 0.25;
        actor.root.position.z = actor.coord;
      }
    }
    chunk.batches.forEach(batch => batch.update());
  }

  getRailReport(index: number): RailReport {
    const chunk = this.chunks.get(index);
    const state = chunk?.railway.state ?? railState(this.lastTime, index);
    return { label: state.label, phase: state.phase, secondsToOpen: state.secondsToOpen,
      waiting: chunk?.actors.filter(actor => actor.waitReason === 'train').length ?? 0 };
  }

  setNight(night: boolean) {
    this.night = night;
    this.library.setNight(night);
    this.scenery.forEach(scenery => setSceneryNight(scenery, night));
  }

  exportBlock(index: number, layers: WorldLayers) {
    const chunk = this.makeChunk(index);
    this.populate(chunk);
    chunk.scenery.getObjectByName('Buildings')!.visible = layers.buildings;
    chunk.scenery.getObjectByName('Street_Furniture')!.visible = layers.decor;
    chunk.scenery.getObjectByName('Road_Details')!.visible = layers.decor;
    chunk.scenery.getObjectByName('Sidewalk_Details')!.visible = layers.decor;
    chunk.scenery.getObjectByName('Business_Furniture')!.visible = layers.buildings;
    chunk.scenery.getObjectByName('Trees')!.visible = layers.trees;
    chunk.scenery.getObjectByName('Rail_Infrastructure')!.visible = layers.railway;
    chunk.railway.root.visible = layers.railway;
    this.railwayLibrary!.update(chunk.railway, railState(16.5), this.night);
    chunk.people.visible = layers.people;
    chunk.vehicles.visible = layers.vehicles;
    chunk.animals.visible = layers.animals;
    if (!layers.buildings) {
      const oldPeople = chunk.batches.find(batch => batch.root.parent === chunk.people);
      if (oldPeople) {
        oldPeople.dispose();
        chunk.batches.splice(chunk.batches.indexOf(oldPeople), 1);
      }
      chunk.people.clear();
      const people = new ActorInstances(chunk.actors.filter(actor => actor.spec.asset === 'characters' && !actor.spec.activity), 'People');
      chunk.people.add(people.root);
      chunk.batches.push(people);
    }
    this.root.remove(chunk.root);
    chunk.root.updateMatrixWorld(true);
    return chunk;
  }

  releaseChunk(chunk: WorldChunk) {
    chunk.actors.forEach(actor => { actor.mixer.stopAllAction(); actor.mixer.uncacheRoot(actor.object); actor.root.clear(); });
    chunk.batches.forEach(batch => batch.dispose());
    this.railwayLibrary?.release(chunk.railway);
    chunk.signals.dispose();
    this.root.remove(chunk.root);
    chunk.root.clear(); chunk.actors.length = 0; chunk.batches.length = 0;
  }

  dispose() {
    this.chunks.forEach(chunk => this.releaseChunk(chunk));
    this.chunks.clear(); this.railEvents.clear();
    this.scenery.forEach(scenery => disposeAsset(scenery)); this.scenery.clear();
    this.library.dispose(); this.railwayLibrary?.dispose(); this.railwayLibrary = null;
    this.signalGeometry.dispose(); this.signalMaterial.dispose(); this.root.clear();
  }
}

export function createWorldManifest() {
  return {
    version: 5, name: 'Shibuya Blocks / Detailed Everyday Avenue', units: 'meters', forward: [0, 0, -1], traffic: 'left-hand',
    modules: { length: WORLD.chunkLength, width: WORLD.width, repeat: 'unbounded', maxResidentChunks: 5 },
    road: { width: WORLD.roadWidth, lanes: 4, laneWidth: WORLD.laneWidth, intersectionsEvery: WORLD.chunkLength, sidewalkWidth: WORLD.sidewalkWidth },
    signals: { cycleSeconds: WORLD.trafficCycle, mainGreen: [0, 10], mainAmber: [10, 11], crossGreen: [16, 22], crossAmber: [22, 23], allRedClearanceSeconds: 5 },
    railway: { ...RAILWAY, direction: [1, 0, 0], train: 'Yamanote 4-car voxel', gates: 2, pedestrianGates: 4,
      order: ['warning', 'lowering', 'train', 'clearance', 'raising', 'open'], vehiclesAndPeopleWait: true },
    connections: { entrance: [0, WORLD.roadY, WORLD.chunkLength / 2], exit: [0, WORLD.roadY, -WORLD.chunkLength / 2], intersection: [0, WORLD.roadY, 0] },
    scale: { people: 0.66, vehicles: 1, animals: '0.7-0.95', buildings: 'uniform height-class footprint fit', placement: 'mixed low-rise and towers at street front, middle and rear' },
    heightClasses: BUILDING_TIERS,
    decoration: { features: DECORATION_FEATURES, repeatableProps: STREET_PROPS, independentLayer: true,
      tactileTiles: 'raised strips and dotted warning pads', paintedSpeed: 30,
      preservedSafetyEquipment: 'gates and railway warnings stay with the railway layer' },
    animation: { everyActorAnimated: true, occasionalIconicPoses: true, instancedRigs: true, stoppedWheelsWhileWaiting: true },
    dailyLife: { shopping: ['approach display', 'browse', 'pay', 'leave with bag'], ramen: ['sit on stool', 'lift noodles with chopsticks', 'pause and look around'], queues: true, servingChefs: true },
    population: DISTRICTS.map(district => ({ id: district.id, citizens: district.people.length + district.crowd.length + district.activities.length,
      traffic: district.vehicles.length, parked: district.parking.length, businesses: district.businesses.length })),
    export: 'One static assembled GLB block; JSON contains live world rules. Original asset animation clips are available in the studio.',
    districts: DISTRICTS,
  };
}