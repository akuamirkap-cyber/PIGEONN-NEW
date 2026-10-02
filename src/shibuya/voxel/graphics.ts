import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';
import { ASSET_INFO } from './catalog';
import type { AssetId } from './types';
import { PACK_MEMBERS } from './packCatalog';

const FONT: Record<string, string[]> = {
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01111','10000','10000','10111','10001','10001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['11111','00100','00100','00100','00100','00100','11111'],
  J: ['00111','00010','00010','00010','10010','10010','01100'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  N: ['10001','11001','11001','10101','10011','10011','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  Q: ['01110','10001','10001','10001','10101','10010','01101'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  V: ['10001','10001','10001','10001','10001','01010','00100'],
  W: ['10001','10001','10001','10101','10101','11011','10001'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  Z: ['11111','00001','00010','00100','01000','10000','11111'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['01110','10000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  '/': ['00001','00001','00010','00100','01000','10000','10000'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '.': ['00000','00000','00000','00000','00000','00100','00100'],
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
};

function pixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string, center = false) {
  ctx.fillStyle = color;
  const start = center ? x - (text.length * 6 - 1) * scale / 2 : x;
  text.toUpperCase().split('').forEach((char, index) => {
    (FONT[char] || FONT[' ']).forEach((row, yy) => {
      row.split('').forEach((pixel, xx) => {
        if (pixel === '1') ctx.fillRect(start + index * 6 * scale + xx * scale, y + yy * scale, scale, scale);
      });
    });
  });
}

function logo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#faf6df'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#168348'; ctx.lineWidth = 3; ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
  const scale = Math.min((w - 18) / 5, (h - 25) / 7);
  pixelText(ctx, '7', x + w / 2, y + 9, scale, '#e64429', true);
  ctx.fillStyle = '#f49a30'; ctx.fillRect(x + 10, y + 9, w - 20, scale);
  pixelText(ctx, 'BLOCKS', x + w / 2, y + h - 14, Math.max(1, Math.floor(w / 39)), '#197642', true);
}

const textureCache = new Map<string, CanvasTexture>();

const SIGNS: Record<string, { title: string; detail?: string; bg: string; ink: string }> = {
  'sign-office': { title: 'SHIBUYA OFFICE', bg: '#254761', ink: '#edf4e3' },
  'sign-tower': { title: 'SHIBUYA SKY TOWER', bg: '#314d5e', ink: '#f0f1dc' },
  'sign-modern': { title: 'TOKYO CENTRAL', detail: 'OFFICES / SHIBUYA', bg: '#294365', ink: '#d1eced' },
  'sign-jr': { title: 'JR', detail: 'YAMANOTE LINE', bg: '#3b973f', ink: '#ffffe2' },
  'sign-store': { title: 'SHIBUYA STORE', bg: '#d8573d', ink: '#fff2d1' },
  'sign-cafe': { title: 'COFFEE / SHIBUYA', bg: '#2d7e58', ink: '#fff4d2' },
  'sign-station': { title: 'JR SHIBUYA STATION', bg: '#f1edda', ink: '#388345' },
  'sign-hachiko': { title: 'HACHIKO', bg: '#958d67', ink: '#f4eac9' },
  'sign-neon': { title: 'CENTER-GAI', detail: 'SHIBUYA NIGHTS', bg: '#277f8b', ink: '#ffdfae' },
  'sign-izakaya': { title: 'NONBEI YOKOCHO', bg: '#724d32', ink: '#f3d7a9' },
  'sign-game': { title: 'GAME CENTER', detail: 'SHIBUYA / OPEN', bg: '#c3568b', ink: '#fff1da' },
  'sign-hotel': { title: 'TOKYO HOTEL', detail: 'WELCOME TO TOKYO', bg: '#795e93', ink: '#fff2d2' },
  'sign-tokyo-deck': { title: 'TOKYO TOWER', bg: '#edeede', ink: '#ad5140' },
  'sign-foot-town': { title: 'TOKYO TOWER / FOOT TOWN', bg: '#674b3e', ink: '#f6e7ca' },
  'sign-bus-stop': { title: 'BUS', bg: '#477c61', ink: '#f3e5c1' },
  'zone-shibuya': { title: 'SHIBUYA', bg: '#4c8776', ink: '#f6eed6' },
  'zone-sakura': { title: 'SAKURA', bg: '#b18093', ink: '#fff2df' },
  'zone-tokyo': { title: 'TOKYO', bg: '#a47b54', ink: '#fff0cd' },
  'zone-yokocho': { title: 'YOKOCHO', bg: '#7c7297', ink: '#fff0db' },
  'rail-destination': { title: 'SHIBUYA / JR', bg: '#294b43', ink: '#f4edcd' },
  'activity-ramen': { title: 'RAMEN / ITADAKIMASU', bg: '#a87b48', ink: '#f8e8bd' },
  'activity-shop': { title: 'KONBINI / FRESH', bg: '#60806c', ink: '#f7e9c4' },
  'prop-address': { title: 'SHIBUYA 1-7', bg: '#d7d5bb', ink: '#526e59' },
  'prop-utility': { title: 'TOKYO / W-01', bg: '#bdc8b2', ink: '#4f6a51' },
};

export function getGraphic(kind: string): CanvasTexture {
  if (textureCache.has(kind)) return textureCache.get(kind)!;
  const canvas = document.createElement('canvas');
  let w = 128;
  let h = 128;
  if (kind === 'konbini-main') { w = 512; h = 96; }
  if (kind === 'ramen-main') { w = 80; h = 320; }
  if (kind.startsWith('noren')) { w = 64; h = 80; }
  if (kind === 'menu' || kind === 'side-menu') { w = 96; h = 128; }
  if (kind === 'open') { w = 64; h = 192; }
  if (kind === 'lantern') { w = 48; h = 96; }
  if (kind === '24-hours' || kind === 'drinks' || kind.startsWith('plaque')) { w = 256; h = 32; }
  if (kind.startsWith('sign-') || kind.startsWith('zone-')) { w = 512; h = 96; }
  if (kind === 'sign-109') { w = 192; h = 80; }
  if (kind === 'led-screen') { w = 192; h = 256; }
  if (kind === 'vertical-neon') { w = 64; h = 320; }
  if (kind.startsWith('neon-board-')) { w = 128; h = 80; }
  if (['sign-jr-station', 'sign-rakuten', 'sign-karaoke', 'sign-shibuya109'].includes(kind)) { w = 384; h = 128; }
  if (kind === 'vertical-karaoke') { w = 64; h = 320; }
  if (kind === 'shibuya-tower-large') { w = 256; h = 160; }
  if (kind.startsWith('member-')) { w = 384; h = 64; }
  if (kind.startsWith('index-')) { w = 64; h = 32; }
  if (kind.startsWith('vehicle-')) { w = 256; h = 96; }
  if (kind === 'traffic-stop') { w = 128; h = 64; }
  if (kind === 'traffic-crossing') { w = 80; h = 80; }
  if (kind === 'rail-warning') { w = 256; h = 96; }
  if (kind === 'rail-destination') { w = 256; h = 64; }
  if (kind.startsWith('activity-')) { w = 384; h = 96; }
  if (kind === 'activity-menu') { w = 96; h = 128; }
  if (kind === 'road-speed30') { w = 128; h = 192; }
  if (kind === 'traffic-speed30') { w = 128; h = 96; }
  if (kind === 'prop-post') { w = 96; h = 80; }
  if (kind === 'prop-bicycle' || kind.startsWith('prop-recycle-')) { w = 96; h = 64; }
  if (kind === 'prop-direction') { w = 256; h = 128; }
  if (kind === 'prop-address' || kind === 'prop-utility') { w = 256; h = 64; }
  if (kind === 'rail-sos') { w = 96; h = 32; }
  if (kind === 'rail-id') { w = 64; h = 48; }
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  if (kind === 'rail-sos') {
    ctx.fillStyle = '#e4bb59'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'SOS', w / 2, 6, 3, '#904e3a', true);
  } else if (kind === 'rail-id') {
    ctx.fillStyle = '#b6bca5'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'JR 07', w / 2, 10, 1, '#4a6655', true);
    pixelText(ctx, '128', w / 2, 28, 1, '#4a6655', true);
  } else if (kind === 'road-speed30' || kind === 'traffic-speed30') {
    ctx.fillStyle = kind === 'road-speed30' ? '#4c5b62' : '#f5ebd1'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, '30', w / 2, kind === 'road-speed30' ? 20 : 12, kind === 'road-speed30' ? 10 : 9,
      kind === 'road-speed30' ? '#e4e8d3' : '#495d51', true);
    if (kind === 'road-speed30') pixelText(ctx, 'SLOW', w / 2, 147, 4, '#e4e8d3', true);
  } else if (kind === 'prop-post') {
    ctx.fillStyle = '#c65e4b'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f1ddbc'; ctx.fillRect(23, 8, 50, 6); ctx.fillRect(23, 23, 50, 6); ctx.fillRect(45, 26, 6, 20);
    pixelText(ctx, 'POST', w / 2, 59, 2, '#f1ddbc', true);
  } else if (kind === 'prop-direction') {
    ctx.fillStyle = '#568094'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'SHIBUYA', 103, 18, 3, '#f2eddb', true);
    pixelText(ctx, 'JR STATION', 103, 61, 2, '#e1ebd9', true);
    pixelText(ctx, 'TOKYO / 1-7', 103, 102, 1, '#cedecd', true);
    ctx.fillStyle = '#f3eedb'; ctx.fillRect(210, 20, 8, 55);
    for (let i = 0; i < 5; i++) ctx.fillRect(191 + i * 4, 36 - i * 4, 46 - i * 8, 5);
  } else if (kind === 'prop-bicycle') {
    ctx.fillStyle = '#69845f'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'P', 19, 9, 3, '#f2ebc9', true);
    ctx.strokeStyle = '#e0e7cc'; ctx.lineWidth = 2;
    ctx.strokeRect(37, 24, 15, 15); ctx.strokeRect(70, 24, 15, 15);
    ctx.beginPath(); ctx.moveTo(44, 30); ctx.lineTo(54, 17); ctx.lineTo(61, 31); ctx.lineTo(44, 30);
    ctx.lineTo(69, 17); ctx.lineTo(78, 30); ctx.moveTo(61, 31); ctx.lineTo(69, 17); ctx.lineTo(54, 17); ctx.stroke();
    pixelText(ctx, 'BICYCLE', w / 2, 51, 1, '#f0e8c9', true);
  } else if (kind.startsWith('prop-recycle-')) {
    const i = Number(kind.split('-')[2]);
    ctx.fillStyle = '#afbea8'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, ['CANS', 'PAPER', 'PET'][i], w / 2, 18, 3, '#4a6950', true);
    pixelText(ctx, 'RECYCLE', w / 2, 48, 1, '#637e57', true);
  } else if (kind === 'activity-menu') {
    ctx.fillStyle = '#465844'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'RAMEN', 48, 12, 2, '#f5e3b5', true);
    ctx.fillStyle = '#ebd7b0'; ctx.fillRect(23, 40, 50, 13); ctx.fillRect(30, 53, 36, 7);
    ctx.fillStyle = '#d2a54d'; ctx.fillRect(26, 37, 44, 7);
    pixelText(ctx, '850', 48, 77, 3, '#e3bd73', true);
    pixelText(ctx, 'OPEN', 48, 111, 1, '#f1e6c7', true);
  } else if (kind === 'traffic-stop') {
    ctx.fillStyle = '#c95747'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff2d9'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u6b62\u307e\u308c', w / 2, 30);
    pixelText(ctx, 'STOP', w / 2, 43, 2, '#fff2d9', true);
  } else if (kind === 'traffic-crossing') {
    ctx.fillStyle = '#f0e7cf'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#455b49'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u6a2a\u65ad', w / 2, 50);
  } else if (kind === 'rail-warning') {
    ctx.fillStyle = '#f0d58d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#354940'; ctx.font = 'bold 38px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u8e0f\u5207\u6ce8\u610f', w / 2, 48);
    pixelText(ctx, 'STOP / LOOK', w / 2, 70, 2, '#354940', true);
  } else if (kind.startsWith('member-')) {
    const id = kind.slice(7);
    const member = Object.values(PACK_MEMBERS).flat().find(item => item.id === id);
    const text = member?.name.toUpperCase() ?? id.toUpperCase();
    ctx.fillStyle = '#e3e9d4'; ctx.fillRect(0, 0, w, h);
    const scale = Math.max(1, Math.min(3, Math.floor((w - 16) / (text.length * 6))));
    pixelText(ctx, text, w / 2, (h - scale * 7) / 2, scale, '#56704d', true);
  } else if (kind.startsWith('index-')) {
    ctx.fillStyle = '#d8e1c7'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, kind.slice(6), w / 2, 8, 2, '#6d8560', true);
  } else if (kind === 'costume-bosozoku') {
    ctx.fillStyle = '#f0e8d0'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#b38e49'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u6771\u4eac', w / 2, 38);
    ctx.fillText('\u7279\u653b', w / 2, 77);
    pixelText(ctx, 'TOKYO', w / 2, 107, 2, '#b38e49', true);
  } else if (kind.startsWith('vehicle-')) {
    ctx.fillStyle = kind === 'vehicle-bus' ? '#304c45' : kind === 'vehicle-taxi' ? '#e5e6bf' : '#54885e'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, kind === 'vehicle-bus' ? 'SHIBUYA' : kind === 'vehicle-taxi' ? 'TAXI' : kind === 'vehicle-police' ? 'POLICE' : 'RAMEN', w / 2, 28, 5, kind === 'vehicle-taxi' ? '#637d44' : '#f3e5c1', true);
  } else if (kind === 'logo') {
    logo(ctx, 0, 0, w, h);
  } else if (kind === 'konbini-main') {
    ctx.fillStyle = '#1c3b2e'; ctx.fillRect(0, 0, w, h);
    logo(ctx, 9, 7, 73, 82); logo(ctx, 430, 7, 73, 82);
    pixelText(ctx, 'KONBINI', 256, 17, 7, '#ffe9ab', true);
    pixelText(ctx, 'SHIBUYA  /  OPEN 24 HOURS', 256, 74, 2, '#a9cbb3', true);
  } else if (kind === 'ramen-main') {
    ctx.fillStyle = '#176482'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f1bd57'; ctx.fillRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = '#213e50'; ctx.fillRect(9, 9, w - 18, h - 18);
    ctx.fillStyle = '#c92e24'; ctx.fillRect(13, 13, w - 26, h - 26);
    'RAMEN'.split('').forEach((letter, i) => {
      pixelText(ctx, letter, 42, 27 + i * 55, 6, '#6f3827', true);
      pixelText(ctx, letter, 39, 24 + i * 55, 6, '#fff0bd', true);
    });
  } else if (kind.startsWith('noren')) {
    const index = Number(kind.split('-')[1]);
    ctx.fillStyle = index % 2 ? '#d83a28' : '#e4442d'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff1d7'; ctx.font = 'bold 49px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(['\u30e9', '\u30fc', '\u30e1', '\u30f3'][index], w / 2, 35);
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = '#ffe9ce'; ctx.lineWidth = 1; ctx.strokeRect(5 + i * 9, 67, 7, 6);
      ctx.fillRect(7 + i * 9, 69, 3, 2);
    }
  } else if (kind === 'lantern') {
    ctx.fillStyle = '#f34d28'; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 25px sans-serif';
    ['\u3089', '\u30fc', '\u3081', '\u3093'].forEach((char, i) => {
      ctx.strokeStyle = '#ffe3b4'; ctx.lineWidth = 3; ctx.strokeText(char, 24, 14 + i * 23);
      ctx.fillStyle = '#342c23'; ctx.fillText(char, 24, 14 + i * 23);
    });
  } else if (kind === 'menu' || kind === 'side-menu') {
    ctx.fillStyle = kind === 'menu' ? '#26392e' : '#f4dfb5'; ctx.fillRect(0, 0, w, h);
    const ink = kind === 'menu' ? '#fff0cf' : '#673b2e';
    pixelText(ctx, 'MENU', 48, 9, 3, kind === 'menu' ? '#edb95f' : ink, true);
    ctx.fillStyle = '#faf0cf'; ctx.fillRect(28, 43, 40, 12); ctx.fillRect(33, 55, 30, 6);
    ctx.fillStyle = '#edaa4e'; ctx.fillRect(30, 41, 36, 7);
    ctx.fillStyle = '#7ca843'; ctx.fillRect(33, 40, 8, 5);
    ctx.fillStyle = '#fff9db'; ctx.fillRect(50, 42, 10, 6);
    pixelText(ctx, 'SHOYU 850', 48, 78, 1, ink, true);
    pixelText(ctx, 'MISO  950', 48, 92, 1, ink, true);
    pixelText(ctx, 'OPEN 11-23', 48, 112, 1, ink, true);
  } else if (kind === 'open') {
    ctx.fillStyle = '#268147'; ctx.fillRect(0, 0, w, h);
    'OPEN'.split('').forEach((letter, i) => pixelText(ctx, letter, 32, 12 + i * 44, 5, '#f6f3d8', true));
  } else if (kind === 'atm') {
    ctx.fillStyle = '#cf3929'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#fff6db'; ctx.lineWidth = 4; ctx.strokeRect(5, 5, w - 10, h - 10);
    pixelText(ctx, 'ATM', w / 2, h / 2 - 21, 6, '#fff2dc', true);
  } else if (kind === '24-hours') {
    ctx.fillStyle = '#1e6e3d'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'OPEN 24 HOURS', w / 2, 6, 3, '#fff4d3', true);
  } else if (kind === 'drinks') {
    ctx.fillStyle = '#f6f0d4'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'COLD DRINKS', w / 2, 8, 2, '#356b4b', true);
  } else if (kind === 'sign-109') {
    ctx.fillStyle = '#f0eadd'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, '109', w / 2, 6, 9, '#d84e48', true);
  } else if (kind === 'shibuya-tower-large') {
    ctx.fillStyle = '#284c63'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'SHIBUYA', w / 2, 12, 5, '#f4f1db', true);
    pixelText(ctx, 'TOWER', w / 2, 62, 6, '#f4f1db', true);
    pixelText(ctx, 'TOKYO / JAPAN', w / 2, 132, 2, '#a9c9d4', true);
  } else if (kind === 'sign-jr-station') {
    ctx.fillStyle = '#34884b'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c3e9b4'; ctx.lineWidth = 3; ctx.strokeRect(5, 5, w - 10, h - 10);
    pixelText(ctx, 'JR', 79, 23, 11, '#f8f9e8', true);
    ctx.fillStyle = '#f8f9e8'; ctx.font = 'bold 43px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u6e0b\u8c37\u99c5', 254, 62);
    pixelText(ctx, 'SHIBUYA STATION', 254, 82, 2, '#f4f7da', true);
  } else if (kind === 'sign-rakuten') {
    ctx.fillStyle = '#f6f2df'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, 'RAKUTEN', w / 2, 26, 7, '#b63935', true);
    ctx.fillStyle = '#b63935'; ctx.fillRect(70, 91, 245, 5);
  } else if (kind === 'sign-karaoke' || kind === 'sign-shibuya109') {
    ctx.fillStyle = kind === 'sign-karaoke' ? '#2584b5' : '#a64c59'; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, kind === 'sign-karaoke' ? 'KARAOKE' : 'SHIBUYA 109', w / 2, 14, kind === 'sign-karaoke' ? 6 : 5, '#fff4db', true);
    ctx.fillStyle = '#fff4db'; ctx.font = 'bold 38px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u6e0b\u8c37', w / 2, 111);
  } else if (kind === 'vertical-karaoke') {
    ctx.fillStyle = '#257dba'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#bcebf1'; ctx.lineWidth = 2; ctx.strokeRect(3, 3, w - 6, h - 6);
    'KARAOKE'.split('').forEach((char, i) => pixelText(ctx, char, w / 2, 10 + i * 43, 4, '#f4f5e6', true));
  } else if (SIGNS[kind]) {
    const sign = SIGNS[kind];
    ctx.fillStyle = sign.bg; ctx.fillRect(0, 0, w, h);
    const scale = Math.min(sign.detail ? 6 : 8, Math.floor((w - 20) / (sign.title.length * 6)));
    pixelText(ctx, sign.title, w / 2, sign.detail ? 11 : (h - scale * 7) / 2, scale, sign.ink, true);
    if (sign.detail) pixelText(ctx, sign.detail, w / 2, 70, 2, sign.ink, true);
  } else if (kind === 'helipad') {
    ctx.fillStyle = '#596e79'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#bfd0b9';
    for (let i = 0; i < 4; i++) ctx.fillRect(i % 2 ? w - 21 : 0, i < 2 ? 0 : h - 21, 21, 21);
    ctx.strokeStyle = '#e3c84b'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(25, 8); ctx.lineTo(w - 25, 8); ctx.lineTo(w - 8, 25);
    ctx.lineTo(w - 8, h - 25); ctx.lineTo(w - 25, h - 8); ctx.lineTo(25, h - 8);
    ctx.lineTo(8, h - 25); ctx.lineTo(8, 25); ctx.closePath(); ctx.stroke();
    pixelText(ctx, 'H', w / 2, 32, 9, '#f8f6df', true);
  } else if (kind === 'led-screen') {
    ctx.fillStyle = '#79cdd3'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#ef9b88'; ctx.fillRect(71, 35, 65, 57); ctx.fillRect(61, 46, 84, 34);
    const blocks = [[4, 101, 31, 78], [43, 88, 34, 92], [85, 113, 30, 68], [125, 75, 28, 105], [160, 106, 29, 74]];
    blocks.forEach(([x, y, ww, hh], i) => {
      ctx.fillStyle = i % 2 ? '#335d78' : '#447c8c'; ctx.fillRect(x, y, ww, hh);
      for (let xx = 0; xx < 3; xx++) for (let yy = 0; yy < 5; yy++) {
        ctx.fillStyle = (xx + yy) % 3 ? '#91dbd4' : '#f3d490'; ctx.fillRect(x + 5 + xx * 8, y + 9 + yy * 11, 3, 5);
      }
    });
    ctx.fillStyle = '#294f5f'; ctx.fillRect(0, 178, w, 78);
    pixelText(ctx, 'SHIBUYA', w / 2, 190, 3, '#fff0c8', true);
    pixelText(ctx, 'BLOCKS', w / 2, 226, 2, '#a9ded5', true);
  } else if (kind === 'vertical-neon') {
    ctx.fillStyle = '#273e58'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e59ac7'; ctx.lineWidth = 2; ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.font = 'bold 46px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#efa9d6';
    ['\u6e0b', '\u8c37', '\u30bf', '\u30ef', '\u30fc'].forEach((char, i) => ctx.fillText(char, w / 2, 39 + i * 59));
  } else if (kind.startsWith('neon-board-')) {
    const i = Number(kind.split('-')[2]);
    const palettes = ['#c64b3a', '#ddad44', '#378a91', '#a65587', '#e5e3c4', '#d4783d', '#537c58'];
    const text = ['RAMEN', 'SUSHI', 'GAME', 'MUSIC', 'SHOP', 'OPEN', 'CAFE'][i];
    ctx.fillStyle = palettes[i]; ctx.fillRect(0, 0, w, h);
    pixelText(ctx, text, w / 2, 14, 3, i === 4 ? '#40655c' : '#fff3d6', true);
    pixelText(ctx, 'SHIBUYA', w / 2, 57, 1, i === 4 ? '#40655c' : '#fff3d6', true);
  } else {
    ctx.fillStyle = '#d9d4b5'; ctx.fillRect(0, 0, w, h);
    const id = kind.replace('plaque-', '') as AssetId;
    const title = ASSET_INFO[id] ? ASSET_INFO[id].name.toUpperCase() : 'SHIBUYA BLOCKS';
    pixelText(ctx, title, w / 2, 9, Math.min(2, Math.floor((w - 10) / (title.length * 6))), '#3f5140', true);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  textureCache.set(kind, texture);
  return texture;
}