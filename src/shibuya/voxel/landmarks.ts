import {
  build109, buildCrossing, buildIzakaya, buildNeon, buildQFront,
  buildSkyscraper, buildStation,
} from './city';
import { buildPagoda, buildSakura, buildShrine } from './traditional';
import { buildTokyoTower } from './tokyoTower';
import { buildMachiya, buildTownhouse } from './houses';
import type { AssetData, AssetId, PackId } from './types';

const builders: Record<Exclude<AssetId, 'konbini' | 'ramen' | PackId>, () => AssetData> = {
  pagoda: buildPagoda,
  sakura: buildSakura,
  skyscraper: buildSkyscraper,
  tokyotower: buildTokyoTower,
  shibuya109: build109,
  qfront: buildQFront,
  station: buildStation,
  neon: buildNeon,
  torii: buildShrine,
  izakaya: buildIzakaya,
  crossing: buildCrossing,
  machiya: buildMachiya,
  townhouse: buildTownhouse,
};

export function createLandmark(id: Exclude<AssetId, 'konbini' | 'ramen' | PackId>): AssetData {
  return builders[id]();
}