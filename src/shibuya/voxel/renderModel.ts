import {
  Box3, BoxGeometry, BufferAttribute, BufferGeometry, DoubleSide, Euler, FrontSide, Group, Matrix4, Mesh,
  MeshStandardMaterial, PlaneGeometry, Quaternion, Vector3,
} from 'three';
import { getGraphic } from './graphics';
import { buildRigAnimations } from './rig';
import type { AssetData, VoxelBox } from './models';

export function buildAssetObject(data: AssetData): Group {
  const root = new Group();
  root.name = `Shibuya_Blocks_${data.id}`;
  root.userData.floorY = data.floorY;
  const store = new Group(); store.name = 'Store';
  const setting = new Group(); setting.name = 'Diorama';
  root.add(store, setting);
  const rigGroups = new Map<string, Group>();
  for (const node of data.nodes ?? []) {
    const group = new Group();
    group.name = node.name;
    group.position.set(...node.p);
    if (node.rotation) group.rotation.set(...node.rotation);
    if (node.member) group.userData.member = node.member;
    rigGroups.set(node.name, group);
  }
  for (const node of data.nodes ?? []) {
    (node.parent ? rigGroups.get(node.parent)! : store).add(rigGroups.get(node.name)!);
  }
  const batches = new Map<string, VoxelBox[]>();
  const unitBox = new BoxGeometry(1, 1, 1);
  const unitPositions = unitBox.getAttribute('position');
  const unitNormals = unitBox.getAttribute('normal');
  const unitUvs = unitBox.getAttribute('uv');
  const unitIndices = unitBox.getIndex()!;
  const rotation = new Euler();
  const quaternion = new Quaternion();
  const position = new Vector3();
  const vertex = new Vector3();
  const normal = new Vector3();

  // Batch directly into typed buffers instead of allocating a geometry for every voxel.
  for (const box of data.boxes) {
    if (box.opacity === 0) continue;
    const key = `${box.part}|${box.node ?? ''}|${box.color}|${box.opacity ?? 1}|${box.glow ?? 0}`;
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key)!.push(box);
  }
  for (const boxes of batches.values()) {
    const sample = boxes[0];
    const vertexCount = boxes.length * unitPositions.count;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = vertexCount > 65535 ? new Uint32Array(boxes.length * unitIndices.count) : new Uint16Array(boxes.length * unitIndices.count);
    boxes.forEach((box, boxIndex) => {
      position.set(box.p[0] + box.s[0] / 2, box.p[1] + box.s[1] / 2, box.p[2] + box.s[2] / 2);
      if (box.rotation) rotation.set(...box.rotation);
      else rotation.set(0, 0, 0);
      quaternion.setFromEuler(rotation);
      const start = boxIndex * unitPositions.count;
      for (let i = 0; i < unitPositions.count; i++) {
        vertex.set(unitPositions.getX(i) * box.s[0], unitPositions.getY(i) * box.s[1], unitPositions.getZ(i) * box.s[2])
          .applyQuaternion(quaternion).add(position);
        normal.set(unitNormals.getX(i), unitNormals.getY(i), unitNormals.getZ(i)).applyQuaternion(quaternion);
        const offset = (start + i) * 3;
        positions[offset] = vertex.x; positions[offset + 1] = vertex.y; positions[offset + 2] = vertex.z;
        normals[offset] = normal.x; normals[offset + 1] = normal.y; normals[offset + 2] = normal.z;
        uvs[(start + i) * 2] = unitUvs.getX(i); uvs[(start + i) * 2 + 1] = unitUvs.getY(i);
      }
      for (let i = 0; i < unitIndices.count; i++) indices[boxIndex * unitIndices.count + i] = start + unitIndices.getX(i);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();
    const material = new MeshStandardMaterial({
      color: sample.color,
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
      transparent: sample.opacity !== undefined,
      opacity: sample.opacity ?? 1,
      depthWrite: sample.opacity === undefined,
      side: sample.opacity !== undefined ? DoubleSide : FrontSide,
      emissive: sample.glow ? sample.color : '#000000',
      emissiveIntensity: (sample.glow ?? 0) * 0.65,
    });
    material.userData.glow = sample.glow ?? 0;
    const mesh = new Mesh(geometry, material);
    mesh.name = `Voxels_${sample.color.slice(1)}`;
    mesh.castShadow = sample.opacity === undefined;
    mesh.receiveShadow = true;
    (sample.node ? rigGroups.get(sample.node)! : sample.part === 'store' ? store : setting).add(mesh);
  }
  unitBox.dispose();

  for (const panel of data.panels) {
    const texture = getGraphic(panel.kind);
    const material = new MeshStandardMaterial({
      map: texture, roughness: 1, side: DoubleSide,
      emissiveMap: texture, emissive: panel.glow ? '#ffffff' : '#000000',
      emissiveIntensity: (panel.glow ?? 0) * 0.65,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    material.userData.glow = panel.glow ?? 0;
    const mesh = new Mesh(new PlaneGeometry(...panel.s), material);
    mesh.name = `Pixel_Sign_${panel.kind}`;
    mesh.position.set(...panel.p);
    if (panel.rotation) mesh.rotation.set(...panel.rotation);
    (panel.node ? rigGroups.get(panel.node)! : panel.part === 'store' ? store : setting).add(mesh);
  }
  for (const node of data.nodes ?? []) {
    if (!node.member) continue;
    rigGroups.get(node.name)!.traverse(object => { object.userData.member = node.member; });
  }
  root.animations = buildRigAnimations(root, data);
  return root;
}

export function setDiorama(root: Group, show: boolean) {
  root.getObjectByName('Diorama')!.visible = show;
  root.position.y = show ? 0 : -(root.userData.floorY ?? 0.73);
}

export function measureAsset(root: Group, diorama: boolean, direction: Vector3) {
  const right = new Vector3().crossVectors(new Vector3(0, 1, 0), direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const bounds = new Box3();
  const point = new Vector3();
  root.updateMatrixWorld(true);
  const inverseRoot = new Matrix4().copy(root.matrixWorld).invert();
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const floorOffset = diorama ? 0 : -(root.userData.floorY ?? 0.73);
  // Fit the projected geometry, not a fixed zoom: pagodas and towers keep their full silhouette.
  for (const group of root.children) {
    if (group.name === 'Diorama' && !diorama) continue;
    group.traverse(object => {
      if (!(object instanceof Mesh)) return;
      const positions = object.geometry.getAttribute('position');
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld).applyMatrix4(inverseRoot);
        point.y += floorOffset;
        bounds.expandByPoint(point);
        const x = point.dot(right), y = point.dot(up);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    });
  }
  const target = bounds.getCenter(new Vector3());
  target.addScaledVector(right, (minX + maxX) / 2 - target.dot(right));
  target.addScaledVector(up, (minY + maxY) / 2 - target.dot(up));
  return { target, bounds, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
}

export function disposeAsset(root: Group) {
  root.traverse(object => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => material.dispose());
    }
  });
}