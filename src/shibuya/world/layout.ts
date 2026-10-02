import type { AssetId, PackId } from '../voxel/types';
import { ANIMAL_MEMBERS, CAR_MEMBERS, CHARACTER_MEMBERS, MOTORCYCLE_MEMBERS, VEHICLE_MEMBERS, isMotorcycle, isPackAsset } from '../voxel/packCatalog';
import { ASSET_IDS } from '../voxel/catalog';
import { RAILWAY } from './simulation';
import type { CitizenActivity } from './citizenActivities';

export const WORLD = {
  chunkLength: 128,
  width: 80,
  roadWidth: 12,
  laneWidth: 3,
  sidewalkWidth: 3,
  roadY: 0.197,
  pavementY: 0.32,
  groundY: 0.135,
  trafficCycle: 28,
} as const;

export type WorldCamera = 'isometric' | 'overhead';
export interface WorldLayers { buildings: boolean; trees: boolean; people: boolean; vehicles: boolean; animals: boolean; railway: boolean; decor: boolean }
export const DEFAULT_LAYERS: WorldLayers = { buildings: true, trees: true, people: true, vehicles: true, animals: true, railway: true, decor: true };

export interface BuildingPlacement {
  asset: AssetId;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  tier: BuildingTier;
  rotation?: number;
  park?: boolean;
}

export type BuildingTier = 'shop' | 'home' | 'station' | 'midrise' | 'office' | 'landmark' | 'shrine';
export const BUILDING_TIERS: Record<BuildingTier, { name: string; min: number; max: number }> = {
  shop: { name: 'Toko rendah', min: 3.4, max: 6.8 },
  home: { name: 'Rumah dua lantai', min: 6.2, max: 9.5 },
  station: { name: 'Stasiun', min: 5.8, max: 12 },
  midrise: { name: 'Gedung lingkungan', min: 11.5, max: 18.5 },
  office: { name: 'Gedung kantor', min: 18, max: 29 },
  landmark: { name: 'Menara landmark', min: 29, max: 47 },
  shrine: { name: 'Kuil dan pagoda', min: 6.5, max: 32 },
};

export interface ActorPlacement {
  asset: PackId;
  member: string;
  x: number;
  z: number;
  scale: number;
  direction?: 1 | -1;
  axis?: 'x' | 'z';
  parked?: boolean;
  walkRange?: number;
  rotation?: number;
  path?: [number, number];
  watchTrain?: boolean;
  activity?: CitizenActivity;
  destination?: [number, number];
  checkout?: [number, number];
  activityOffset?: number;
}

export interface BusinessScene {
  kind: 'shop' | 'ramen';
  lot: number;
  x: number;
  z: number;
  side: -1 | 1;
}

export interface District {
  id: string;
  name: string;
  japanese: string;
  description: string;
  color: string;
  buildings: BuildingPlacement[];
  people: ActorPlacement[];
  vehicles: ActorPlacement[];
  animals: ActorPlacement[];
  crowd: ActorPlacement[];
  parking: ActorPlacement[];
  activities: ActorPlacement[];
  businesses: BusinessScene[];
}

const person = (member: string, x: number, z: number, direction: 1 | -1 = -1): ActorPlacement =>
  ({ asset: 'characters', member, x, z, scale: 0.66, direction, walkRange: 1.8 });
const vehicle = (member: string, x: number, z: number, direction: 1 | -1 = -1, axis: 'x' | 'z' = 'z'): ActorPlacement =>
  ({ asset: 'vehicles', member, x, z, scale: 1, direction, axis });
const animal = (member: string, x: number, z: number, scale = 0.75): ActorPlacement =>
  ({ asset: 'animals', member, x, z, scale });

const TIER: Partial<Record<AssetId, BuildingTier>> = {
  konbini: 'shop', ramen: 'shop', izakaya: 'shop', machiya: 'home', townhouse: 'home', station: 'station',
  qfront: 'office', shibuya109: 'office', neon: 'midrise', skyscraper: 'landmark', tokyotower: 'landmark', pagoda: 'shrine', torii: 'shrine',
};
const HEIGHT: Partial<Record<AssetId, number>> = {
  konbini: 5.9, ramen: 6.25, izakaya: 4.8, machiya: 7.35, townhouse: 8.15, station: 9,
  qfront: 22.5, shibuya109: 22, neon: 16.5, skyscraper: 35, tokyotower: 43, pagoda: 29.5, torii: 8.6,
};

export const STREET_ROWS = {
  north: [14, 25, 47, 58.5],
  south: [14, 25, 36, 47, 58.5],
} as const;
export const isRailCorridor = (z: number, margin = 0) => Math.abs(z - RAILWAY.z) < RAILWAY.reserveHalfWidth + margin;

function lot(asset: AssetId, x: number, z: number, width: number, depth: number, height?: number, park = false): BuildingPlacement {
  return { asset, x, z, width, depth, height: height ?? HEIGHT[asset]!, tier: TIER[asset]!, park };
}

function denseBlocks(theme: number) {
  const buildings: BuildingPlacement[] = [];
  const frontage: AssetId[][] = [
    ['konbini', 'ramen', 'townhouse', 'ramen', 'izakaya', 'konbini'],
    ['machiya', 'ramen', 'konbini', 'izakaya', 'townhouse', 'ramen'],
    ['konbini', 'townhouse', 'ramen', 'ramen', 'konbini', 'izakaya'],
    ['izakaya', 'ramen', 'machiya', 'ramen', 'izakaya', 'konbini'],
  ];
  const offices: AssetId[][] = [
    ['qfront', 'skyscraper', 'shibuya109', 'neon', 'qfront', 'neon', 'shibuya109', 'townhouse'],
    ['qfront', 'neon', 'neon', 'machiya', 'townhouse', 'qfront', 'machiya', 'neon'],
    ['qfront', 'skyscraper', 'skyscraper', 'qfront', 'shibuya109', 'neon', 'qfront', 'townhouse'],
    ['neon', 'skyscraper', 'qfront', 'neon', 'neon', 'shibuya109', 'qfront', 'townhouse'],
  ];
  const promotions: AssetId[][] = [
    ['qfront', 'shibuya109', 'neon', 'qfront'],
    ['neon', 'qfront', 'neon', 'machiya'],
    ['shibuya109', 'qfront', 'qfront', 'neon'],
    ['qfront', 'neon', 'neon', 'shibuya109'],
  ];
  let quarter = 0;
  for (const side of [-1, 1]) for (const half of [-1, 1]) {
    const rows = half < 0 ? STREET_ROWS.north : STREET_ROWS.south;
    const frontTower = half > 0 && ((theme === 0 && side < 0) || (theme === 2 && side > 0));
    for (let row = 0; row < rows.length; row++) {
      if (frontTower && row === 3) continue;
      if (frontTower && row === 2) {
        buildings.push(lot('skyscraper', side * 14.9, 41.5, 9.8, 21.8, 32.5));
        continue;
      }
      const z = half * rows[row], depth = row === rows.length - 1 ? 9.4 : 10.2;
      const asset = row === 0 ? promotions[theme][quarter] : frontage[theme][(quarter * 3 + row) % 6];
      buildings.push(lot(asset, side * 14.55, z, 9.1, depth));
    }
    const park = half < 0 && (theme === 1 || (theme === 2 && side < 0));
    if (park) {
      buildings.push(lot(theme === 2 ? 'tokyotower' : side < 0 ? 'pagoda' : 'torii', side * 30.0, -18.8, 18.9, 20.3, undefined, true));
    }
    {
      const station = (theme === 0 || theme === 2) && side > 0 && half > 0;
      for (let row = 0; row < rows.length; row++) {
        if (park && row < 2) continue;
        if (station && row === 3) continue;
        if (station && row === 2) {
          buildings.push(lot('station', side * 25.05, 41.5, 8.35, 21.8));
        } else {
          const asset: AssetId = row === 1 && quarter % 2 === 0 && !park ? 'neon' : (row + quarter + theme) % 2 ? 'machiya' : 'townhouse';
          buildings.push(lot(asset, side * 25.05, half * rows[row], 8.35, row === rows.length - 1 ? 9.4 : 10.2));
        }
      }
      for (let row = 0; row < rows.length; row++) {
        if (park && row < 2) continue;
        const selected = offices[theme][(quarter * 2 + row) % 8];
        const asset = selected === 'skyscraper' ? 'qfront' : selected;
        const height = (asset === 'qfront' || asset === 'neon') ? HEIGHT[asset]! + (quarter % 2 ? 1.25 : -0.6) : undefined;
        buildings.push(lot(asset, side * 34.55, half * rows[row], 9.7, row === rows.length - 1 ? 9.4 : 10.2, height));
      }
    }
    quarter++;
  }
  return buildings;
}

function sidewalkCrowd(theme: number) {
  const crowd: ActorPlacement[] = [];
  let i = 0;
  for (const side of [-1, 1]) for (const half of [-1, 1]) {
    for (const z of [10.3, 15.9, 20.0, 26.5, 28.5, 44.6, 47.9, 51.8, 55.4, 58.4, 60.3]) {
      const member = CHARACTER_MEMBERS[(i + theme * 3) % CHARACTER_MEMBERS.length];
      crowd.push({ ...person(member.id, side * 8.16, half * z), rotation: i % 3 === 0 ? -side * Math.PI / 2 : half < 0 ? Math.PI : 0, walkRange: 0.62 });
      i++;
    }
  }
  for (let index = 0; index < 8; index++) {
    const side = index < 4 ? -1 : 1;
    crowd.push({ ...person(CHARACTER_MEMBERS[(index + theme * 2) % 10].id, side * (11.6 + (index % 4) * 7.1), index % 2 ? 7.5 : -7.7), rotation: -side * Math.PI / 2, walkRange: 0.22 });
  }
  for (const side of [-1, 1]) {
    crowd.push({ ...person(side < 0 ? 'salaryman' : 'student', side * 7.67, -27.8), direction: -1, path: [-47.5, -24.0], watchTrain: true });
    crowd.push({ ...person(side < 0 ? 'chef' : 'bosozoku', side * 8.25, -45.0), direction: 1, path: [-51.5, -25], watchTrain: true });
  }
  return crowd;
}

function movingTraffic(theme: number): ActorPlacement[] {
  const traffic: ActorPlacement[] = [];
  const lanes = [
    { x: -1.5, direction: -1 as const, positions: [-55, -25, -10, 18, 39, 56], bikes: false },
    { x: -4.5, direction: -1 as const, positions: [-57, -26, -12, 15, 35, 55], bikes: true },
    { x: 1.5, direction: 1 as const, positions: [-56, -46, -18, 11, 32, 54], bikes: false },
    { x: 4.5, direction: 1 as const, positions: [-58, -47, -23, 16, 36, 57], bikes: true },
  ];
  lanes.forEach((lane, laneIndex) => lane.positions.forEach((z, index) => {
    const types = lane.bikes ? MOTORCYCLE_MEMBERS : CAR_MEMBERS;
    const typeIndex = lane.bikes ? theme * 2 + (laneIndex === 3 ? 6 : 0) + index : theme + laneIndex * 3 + index;
    traffic.push(vehicle(types[typeIndex % types.length].id, lane.x, z, lane.direction));
  }));
  traffic.push(vehicle('taxi', -30, -1.5, 1, 'x'), vehicle('keitruck', -17, -1.5, 1, 'x'),
    vehicle('kei', 18, 1.5, -1, 'x'), vehicle('gt', 31, 1.5, -1, 'x'));
  return traffic;
}

function parkedVehicles(theme: number): ActorPlacement[] {
  return [
    { ...vehicle(MOTORCYCLE_MEMBERS[theme].id, -19.8, 12.1), parked: true, rotation: 0 },
    { ...vehicle(MOTORCYCLE_MEMBERS[theme + 4].id, -19.8, 27.1), parked: true, rotation: 0 },
    { ...vehicle(MOTORCYCLE_MEMBERS[(theme + 2) % 8].id, 19.8, -12.5), parked: true, rotation: Math.PI },
    { ...vehicle(MOTORCYCLE_MEMBERS[(theme + 6) % 8].id, 19.8, -49.0), parked: true, rotation: Math.PI },
    { ...vehicle(['keitruck', 'kei', 'taxi', 'kei'][theme], -19.8, -19.5), parked: true },
    { ...vehicle(['kei', 'taxi', 'hachiroku', 'keitruck'][theme], -19.8, 54.4), parked: true },
    { ...vehicle(['taxi', 'keitruck', 'kei', 'hachiroku'][theme], 19.8, 22.5), parked: true },
    { ...vehicle(['kei', 'taxi', 'hachiroku', 'keitruck'][theme], 19.8, 54.4), parked: true },
  ];
}

function walkingPeople(theme: number) {
  const people: ActorPlacement[] = [];
  for (const side of [-1, 1]) for (const half of [-1, 1]) {
    const points = half < 0 ? [11.5, 19, 25.8, 45.9, 52.8, 59.8] : [11.5, 20, 27, 35.3, 43.1, 51, 58.9];
    points.forEach((z, index) => people.push({ ...person(CHARACTER_MEMBERS[(people.length + theme * 3) % 10].id,
      side * 7.43, half * z, index % 2 ? 1 : -1), walkRange: 1.1 }));
  }
  return people;
}

function businessScenes(buildings: BuildingPlacement[]) {
  const used = new Set<string>();
  const businesses: BusinessScene[] = [];
  const activities: ActorPlacement[] = [];
  for (const [index, building] of buildings.entries()) {
    if (Math.abs(building.x) > 20 || !['konbini', 'ramen'].includes(building.asset)) continue;
    const side = Math.sign(building.x) as -1 | 1;
    const kind = building.asset === 'ramen' ? 'ramen' : 'shop';
    const key = `${side}:${Math.sign(building.z)}:${kind}`;
    if (used.has(key)) continue;
    used.add(key);
    const scene: BusinessScene = { kind, lot: index, x: side * 10.75, z: building.z, side };
    businesses.push(scene);
    if (kind === 'ramen') {
      for (let seat = 0; seat < 2; seat++) activities.push({ ...person(['salaryman', 'student', 'yakuza', 'sumo'][(index + seat) % 4], side * 10.08, building.z - 1.05 + seat * 1.45),
        activity: 'ramen', rotation: side * Math.PI / 2 });
      activities.push({ ...person('chef', side * 10.98, building.z + 2.2), activity: 'serve', rotation: -side * Math.PI / 2 });
      activities.push({ ...person('student', side * 9.58, building.z + 2.4), activity: 'queue', rotation: side * Math.PI / 2 });
    } else {
      for (let customer = 0; customer < 2; customer++) {
        activities.push({ ...person(['student', 'salaryman', 'yakuza', 'bosozoku'][(index + customer) % 4], side * 8.74, building.z - 1.7 + customer * 2.7),
          activity: 'shopping', rotation: side * Math.PI / 2,
          destination: [side * 9.94, building.z - 1.05 + customer * 1.04],
          checkout: [side * 10.04, building.z + 0.83], activityOffset: index * 1.7 + customer * 17 });
        activities.push({ ...person(['salaryman', 'yakuza'][customer], side * 9.47, building.z + 1.38 + customer * 0.91),
          activity: 'queue', rotation: side * Math.PI / 2 });
      }
      activities.push({ ...person('salaryman', side * 11.22, building.z + 1.01), activity: 'checkout', rotation: -side * Math.PI / 2 });
    }
  }
  return { activities, businesses };
}

function district(theme: number, info: Pick<District, 'id' | 'name' | 'japanese' | 'description' | 'color'>, animals: ActorPlacement[]): District {
  const buildings = denseBlocks(theme);
  return { ...info, buildings, people: walkingPeople(theme), vehicles: movingTraffic(theme), crowd: sidewalkCrowd(theme),
    parking: parkedVehicles(theme), animals, ...businessScenes(buildings) };
}

export const DISTRICTS: District[] = [
  district(0, { id: 'shibuya', name: 'Shibuya Avenue', japanese: '\u6e0b\u8c37\u5927\u901a\u308a',
    description: 'Toko ramai, pelanggan ramen, dan lalu lintas motor berpadu di depan skyline kota.', color: '#497861' },
    [animal('shiba', -19.6, 24.8), animal('neko', 9.52, 15.5, 0.7), animal('tanuki', -19.6, -11.2)]),
  district(1, { id: 'sakura', name: 'Sakura Gardens', japanese: '\u685c\u306e\u5ead',
    description: 'Pagoda dan kuil dikelilingi hunian kayu, toko kecil, serta taman sakura.', color: '#b78091' },
    [animal('kitsune', -23.5, -26.1), animal('deer', 23.0, -26.1), animal('crane', 35.9, -27.5, 0.8), animal('shiba', 19.65, 15.3)]),
  district(2, { id: 'tokyo', name: 'Tokyo Skyline', japanese: '\u6771\u4eac\u306e\u7a7a',
    description: 'Tokyo Tower menjadi aksen tinggi di antara kantor, rumah, dan deretan toko.', color: '#b27152' },
    [animal('monkey', -22.1, -24.3), animal('capybara', -30, -29.4, 0.95), animal('neko', 9.53, 24.5, 0.7)]),
  district(3, { id: 'yokocho', name: 'Yokocho Quarter', japanese: '\u6a2a\u4e01',
    description: 'Lentera hangat, kedai ramen sibuk, dan toko berulang rapi di antara gedung neon.', color: '#88749a' },
    [animal('tanuki', -19.8, 25.2), animal('shiba', 19.65, -24.5), animal('neko', -9.45, -15.5, 0.7)]),
];

export function sakuraPlacements(district: District) {
  const parks = district.buildings.filter(lot => lot.park);
  const points = parks.flatMap(lot => [
    [lot.x - 6.5, lot.z - 9.45], [lot.x + 6.5, lot.z - 9.45],
    [lot.x - 6.5, lot.z + 9.0], [lot.x + 6.5, lot.z + 9.0],
    [lot.x + 7.65, lot.z - 4.5], [lot.x - 7.65, lot.z + 4.5],
  ]);
  return points.length ? points : [[-19.8, -24.55], [19.8, 15.8], [-19.8, 15.8], [19.8, -15.8]];
}

export function districtIndex(index: number) { return ((index % DISTRICTS.length) + DISTRICTS.length) % DISTRICTS.length; }
export function getDistrict(index: number) { return DISTRICTS[districtIndex(index)]; }
export function worldProgress(distance: number) {
  const safe = Math.max(0, distance);
  const index = Math.floor(safe / WORLD.chunkLength);
  return { distance: safe, index, offset: safe - index * WORLD.chunkLength, district: districtIndex(index) };
}

export function mainRoadGreen(time: number) { return time % WORLD.trafficCycle < 11; }
export function crossRoadGreen(time: number) { const phase = time % WORLD.trafficCycle; return phase >= 16 && phase < 23; }

// Check that the repeatable route includes every member, without ever placing a lot in the road.
export function validateWorldLayout() {
  const buildings = new Set<AssetId>(['sakura', 'crossing', ...DISTRICTS.flatMap(district => district.buildings.map(lot => lot.asset))]);
  for (const asset of ASSET_IDS) if (!isPackAsset(asset) && !buildings.has(asset)) throw new Error(`World is missing ${asset}.`);
  const expected = [CHARACTER_MEMBERS, VEHICLE_MEMBERS, ANIMAL_MEMBERS];
  const kinds = ['people', 'vehicles', 'animals'] as const;
  kinds.forEach((kind, i) => {
    const placed = new Set(DISTRICTS.flatMap(district => [...district[kind], ...(kind === 'people' ? district.crowd : kind === 'vehicles' ? district.parking : [])].map(item => item.member)));
    for (const member of expected[i]) if (!placed.has(member.id)) throw new Error(`World is missing ${member.id}.`);
  });
  for (const district of DISTRICTS) {
    if (district.buildings.length < 40) throw new Error(`District ${district.id} is too sparse.`);
    if (district.vehicles.length < 28 || district.parking.length < 8) throw new Error(`Traffic in ${district.id} is too sparse.`);
    const motorcycles = new Set(district.vehicles.filter(item => isMotorcycle(item.member)).map(item => item.member));
    if (MOTORCYCLE_MEMBERS.some(item => !motorcycles.has(item.id))) throw new Error(`Missing motorcycle type in ${district.id}.`);
    if (district.people.length + district.crowd.length + district.activities.length < 95) throw new Error(`Too few citizens in ${district.id}.`);
    if (!district.activities.some(item => item.activity === 'ramen') || !district.activities.some(item => item.activity === 'shopping')) {
      throw new Error(`Shopping and dining are required in ${district.id}.`);
    }
    for (const business of district.businesses) {
      if (isRailCorridor(business.z, 3.5) || Math.abs(business.z) + 3 > WORLD.chunkLength / 2 || Math.abs(business.x) < 9) {
        throw new Error(`Unsafe business scene in ${district.id}.`);
      }
      const lot = district.buildings[business.lot];
      if ((business.kind === 'ramen' ? 'ramen' : 'konbini') !== lot.asset) throw new Error('Business was assigned to the wrong storefront.');
    }
    for (const actor of district.vehicles) {
      if ((actor.axis ?? 'z') === 'z' && ![-4.5, -1.5, 1.5, 4.5].includes(actor.x)) throw new Error('Vehicle is outside its traffic lane.');
      if ((actor.axis ?? 'z') === 'z' && Math.sign(actor.x) !== actor.direction) throw new Error('Vehicle travels against left-hand traffic.');
    }
    const characterIds = new Set(district.crowd.map(item => item.member));
    if (CHARACTER_MEMBERS.some(item => !characterIds.has(item.id))) throw new Error(`Crowd in ${district.id} is missing a character type.`);
    if (district.crowd.filter(item => item.watchTrain).length < 4) throw new Error(`No waiting pedestrians near the railway in ${district.id}.`);
    for (const actor of [...district.people, ...district.crowd, ...district.activities]) {
      const [min, max] = actor.path ?? [actor.z - (actor.walkRange ?? 1.8), actor.z + (actor.walkRange ?? 1.8)];
      if (min < -WORLD.chunkLength / 2 || max > WORLD.chunkLength / 2 || min >= max) throw new Error(`Invalid pedestrian path in ${district.id}.`);
      if (!actor.watchTrain && Math.abs(actor.x) < 9 && (Math.abs(actor.z) < 6.7 || min < 0 && max > 0)) throw new Error('Pedestrian route entered the intersection.');
      if (actor.destination && (Math.abs(actor.destination[0]) < 9 || isRailCorridor(actor.destination[1], 1))) throw new Error('Shopping destination entered a road or track.');
      if (actor.checkout && (Math.abs(actor.checkout[0]) < 9 || isRailCorridor(actor.checkout[1], 1))) throw new Error('Checkout point entered a road or track.');
    }
    for (const side of [-1, 1]) {
      const frontage = district.buildings.filter(lot => Math.sign(lot.x) === side && Math.abs(lot.x) < 20);
      if (frontage.length < 7 || frontage.filter(lot => lot.height <= 9.5).length < 4
        || !frontage.some(lot => lot.height >= 11.5)) throw new Error(`Street frontage is not mixed in ${district.id}.`);
    }
    for (const [index, lot] of district.buildings.entries()) {
      const halfX = lot.width / 2, halfZ = lot.depth / 2;
      if (Math.abs(lot.x) - halfX < WORLD.roadWidth / 2 + WORLD.sidewalkWidth
        || Math.abs(lot.z) - halfZ < WORLD.roadWidth / 2 + 2.1
        || Math.abs(lot.x) + halfX > WORLD.width / 2
        || Math.abs(lot.z) + halfZ > WORLD.chunkLength / 2) throw new Error(`Lot ${lot.asset} is outside its safe block.`);
      if (lot.height < BUILDING_TIERS[lot.tier].min || lot.height > BUILDING_TIERS[lot.tier].max) throw new Error(`Invalid height for ${lot.asset}.`);
      if (Math.abs(lot.z - RAILWAY.z) < halfZ + RAILWAY.reserveHalfWidth) throw new Error(`${lot.asset} obstructs the railway corridor.`);
      for (const other of district.buildings.slice(index + 1)) {
        if (Math.abs(lot.x - other.x) < (lot.width + other.width) / 2 - 0.01 && Math.abs(lot.z - other.z) < (lot.depth + other.depth) / 2 - 0.01) {
          throw new Error(`Overlapping lots: ${lot.asset} and ${other.asset}.`);
        }
      }
    }
  }
  return true;
}

validateWorldLayout();