import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownToLine, ArrowUpRight, Box, Building2, Check, ChevronDown, ChevronUp,
  Code2, Download, Image, Infinity as InfinityIcon, Layers, LoaderCircle, Map,
  Moon, PawPrint, Pause, Play, RotateCcw, SlidersHorizontal, Sun, Trees,
  Users, X, ZoomIn, ZoomOut, Car, TrainFront, ShoppingBag,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import BrandMark from '../components/BrandMark';
import { ASSET_IDS } from '../voxel/catalog';
import type { AssetId } from '../voxel/types';
import { BUILDING_TIERS, DEFAULT_LAYERS, DISTRICTS, WORLD, worldProgress, type District, type WorldCamera, type WorldLayers } from './layout';
import { createWorldManifest, type RailReport } from './runtime';
import { DECORATION_FEATURES } from './propLayout';
import WorldViewer, { type WorldViewerHandle } from './WorldViewer';
import './world.css';

interface Props {
  initialDistance: number;
  night: boolean;
  onNightChange: () => void;
  onSavePosition: (distance: number) => void;
  onStudio: (asset?: AssetId, member?: string) => void;
  onLibrary: () => void;
  onBackToPigeon?: () => void;
}

const LAYERS = [
  { key: 'buildings', label: 'Bangunan, rumah & toko', detail: 'Tiga lapis kota, bukan bangunan seragam', Icon: Building2 },
  { key: 'trees', label: 'Pohon & sakura', detail: 'Taman dan peneduh di sisi trotoar', Icon: Trees },
  { key: 'people', label: 'Warga & pelanggan', detail: 'Pejalan kaki, belanja, antrean, dan makan ramen', Icon: Users },
  { key: 'vehicles', label: 'Motor & mobil', detail: '8 tipe motor dengan rider, 6 jenis mobil', Icon: Car },
  { key: 'animals', label: 'Hewan & maskot', detail: '8 teman kecil di taman dan depan toko', Icon: PawPrint },
  { key: 'railway', label: 'Rel & perlintasan JR', detail: 'Kereta bergerak, palang, dan lampu peringatan', Icon: TrainFront },
  { key: 'decor', label: 'Hiasan jalan & trotoar', detail: 'Drainase, manhole, tactile paving, sepeda, dan pos', Icon: SlidersHorizontal },
] as const;

function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function Settings({ layers, onToggle, live, onLive, onClose, district, onInspect }: {
  layers: WorldLayers; onToggle: (key: keyof WorldLayers) => void; live: boolean; onLive: () => void; onClose: () => void; district: District;
  onInspect: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = panel.current!.querySelectorAll<HTMLElement>('button, summary');
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', keys);
    return () => { window.removeEventListener('keydown', keys); previous?.focus(); };
  }, [onClose]);
  return <motion.div className="world-settings-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div ref={panel} className="world-settings" role="dialog" aria-modal="true" aria-labelledby="world-settings-title"
      initial={{ x: 25, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 25, opacity: 0 }}>
      <div className="dialog-top"><span className="eyebrow">SUSUNAN DUNIA</span><button className="icon-button" aria-label="Tutup pengaturan" onClick={onClose}><X size={19} /></button></div>
      <h2 id="world-settings-title">Semua aset.<br />Satu dunia.</h2>
      <p>{district.people.length + district.crowd.length + district.activities.length} warga, {district.vehicles.length} kendaraan bergerak, dan {district.parking.length} kendaraan parkir di blok ini. Pelanggan memilih barang, membayar, lalu membawa tas; pelanggan ramen duduk dan makan dengan sumpit.</p>
      <div className="world-layer-list">
        {LAYERS.map(({ key, label, detail, Icon }) => <button key={key} role="switch" aria-checked={layers[key]} onClick={() => onToggle(key)}>
          <Icon size={18} /><span><strong>{label}</strong><small>{detail}</small></span><span className={`world-switch ${layers[key] ? 'on' : ''}`} aria-hidden="true"><i /></span>
        </button>)}
      </div>
      <button className="world-live-switch" role="switch" aria-checked={live} onClick={onLive}><span><strong>Simulasi hidup</strong><small>Belanja, makan ramen, pose, dan lalu lintas</small></span><span className={`world-switch ${live ? 'on' : ''}`} aria-hidden="true"><i /></span></button>
      <div className="world-decoration-guide">
        <span className="eyebrow">DETAIL KECIL, DUNIA LEBIH HIDUP</span>
        {DECORATION_FEATURES.map(feature => <div key={feature.name}><strong>{feature.name}</strong><p>{feature.items}</p></div>)}
        <button onClick={onInspect}><ZoomIn size={14} /><span>Lihat detail trotoar</span><ArrowUpRight size={13} /></button>
      </div>
      <div className="world-size-guide"><span className="eyebrow">HIERARKI UKURAN</span>
        {(['shop', 'home', 'office', 'landmark'] as const).map(tier => <div key={tier}><span>{BUILDING_TIERS[tier].name}</span><strong>{BUILDING_TIERS[tier].min}-{BUILDING_TIERS[tier].max} m</strong></div>)}
        <p>Skala seragam per model. Batas petak dan tinggi aktual diperiksa saat dunia dibangun.</p>
      </div>
      <details className="world-grid-notes"><summary>Grid & simulasi <ChevronDown size={13} /></summary><p>4 lajur x 3 meter. Trotoar 3 meter. Perempatan setiap {WORLD.chunkLength} meter. Rel melintang terpisah dari perempatan. Kereta hanya melintas setelah palang turun; kendaraan dan pejalan kaki mengantre sampai palang terbuka penuh.</p><p>Objek besar diletakkan di tepi atau kantong parkir, bukan di koridor pejalan kaki. Hiasan dapat disembunyikan tanpa mematikan palang dan simulasi keselamatan. GLB adalah snapshot satu blok; JSON berisi layout, prop, dan aturan simulasi.</p></details>
    </motion.div>
  </motion.div>;
}

export default function WorldMap(props: Props) {
  const { initialDistance, night, onNightChange, onSavePosition, onStudio, onLibrary, onBackToPigeon } = props;
  const reduceMotion = useReducedMotion();
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [live, setLive] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [layers, setLayers] = useState<WorldLayers>(DEFAULT_LAYERS);
  const [view, setView] = useState<WorldCamera>('isometric');
  const [resetSignal, setResetSignal] = useState(0);
  const [distance, setDistance] = useState(initialDistance);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [railReport, setRailReport] = useState<RailReport>({ label: 'Kereta melintas', phase: 'passing', waiting: 0, secondsToOpen: 0 });
  const [businessFocus, setBusinessFocus] = useState<'ramen' | 'shop'>('ramen');
  const viewer = useRef<WorldViewerHandle>(null);
  const latestDistance = useRef(initialDistance);
  const downloadMenu = useRef<HTMLDivElement>(null);
  const progress = worldProgress(distance);
  const district = DISTRICTS[progress.district];
  const remaining = WORLD.chunkLength - progress.offset;
  const handleProgress = useCallback((next: number) => { latestDistance.current = next; setDistance(next); }, []);
  const handleReady = useCallback(() => setReady(true), []);
  const handleInteract = useCallback(() => setRunning(false), []);
  const handleError = useCallback(() => { setFailed(true); setReady(false); setRunning(false); }, []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const handleRailReport = useCallback((report: RailReport) => setRailReport(report), []);

  useEffect(() => () => onSavePosition(latestDistance.current), [onSavePosition]);
  useEffect(() => {
    const away = (event: PointerEvent) => { if (!downloadMenu.current?.contains(event.target as Node)) setDownloadOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const reset = useCallback(() => {
    setRunning(false); viewer.current?.jump(0); setView('isometric'); setResetSignal(value => value + 1);
  }, []);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDownloadOpen(false);
      if (settingsOpen || downloadOpen || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT|BUTTON/.test((event.target as HTMLElement).tagName)) return;
      if (event.code === 'Space' && !event.repeat) { event.preventDefault(); setRunning(value => !value); }
      if (event.key === '0') reset();
      if (event.key.toLowerCase() === 'n') onNightChange();
      if (event.key === '+' || event.key === '=') viewer.current?.zoom(1);
      if (event.key === '-') viewer.current?.zoom(-1);
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, [settingsOpen, downloadOpen, reset, onNightChange]);

  function leave(asset?: AssetId, member?: string) {
    latestDistance.current = viewer.current?.getDistance() ?? distance;
    onSavePosition(latestDistance.current);
    onStudio(asset, member);
  }

  function jumpDistrict(index: number) {
    const cycle = Math.floor(progress.index / DISTRICTS.length) * DISTRICTS.length;
    setRunning(false);
    viewer.current?.jump((cycle + index) * WORLD.chunkLength);
  }

  function nextCrossing(direction: number) {
    setRunning(false);
    const current = worldProgress(viewer.current?.getDistance() ?? distance);
    const next = direction > 0 ? (current.index + 1) * WORLD.chunkLength : Math.max(0, (current.index - (current.offset < 1 ? 1 : 0)) * WORLD.chunkLength);
    viewer.current?.jump(next);
  }

  function showTrain() {
    setRunning(false); setLive(true); setLayers(value => ({ ...value, railway: true, people: true, vehicles: true }));
    viewer.current?.demoTrain();
  }

  function showBusiness() {
    setRunning(false); setLive(true); setLayers(value => ({ ...value, buildings: true, people: true }));
    viewer.current?.focusBusiness(businessFocus);
    setBusinessFocus(value => value === 'ramen' ? 'shop' : 'ramen');
  }

  function inspectDecorations() {
    setRunning(false); setSettingsOpen(false);
    setLayers(value => ({ ...value, decor: true }));
    viewer.current?.focusDetails();
  }

  async function download(kind: 'glb' | 'json' | 'png') {
    setDownloadOpen(false); setExporting(true); setRunning(false);
    try {
      const blob = kind === 'json' ? new Blob([JSON.stringify(createWorldManifest(), null, 2)], { type: 'application/json' })
        : kind === 'glb' ? await viewer.current?.exportBlock() : await viewer.current?.capture();
      if (!blob) throw new Error('World viewer is not ready.');
      downloadFile(blob, `shibuya-blocks-world-${kind === 'json' ? 'layout' : district.id}.${kind}`);
      setToast(kind === 'json' ? 'Aturan world map berhasil diunduh.' : kind === 'glb' ? `Blok map ${WORLD.chunkLength} meter berhasil diunduh.` : 'Gambar world map berhasil diunduh.');
    } catch (error) { console.error('World export failed:', error); setToast('Unduhan gagal. Silakan coba lagi.'); }
    finally { setExporting(false); }
  }

  return <main className={`studio world-studio ${night ? 'night' : ''}`}>
    <div className="world-canvas-layer" role="img" aria-label="World map voxel Jepang dengan jalan lurus endless, perempatan, bangunan, karakter, kendaraan, dan hewan.">
      <WorldViewer ref={viewer} initialDistance={initialDistance} night={night} running={running} speed={speed} live={live}
        layers={layers} view={view} resetSignal={resetSignal} reducedMotion={!!reduceMotion} onProgress={handleProgress}
        onReady={handleReady} onInteract={handleInteract} onError={handleError} onRailReport={handleRailReport} onOpenAsset={(asset, member) => leave(asset, member)} />
    </div>
    <div className="world-readability" aria-hidden="true" />
    <header className="studio-header world-header">
      <a href="#world" className="brand" onClick={event => { event.preventDefault(); reset(); }} aria-label="Shibuya Blocks, kembali ke awal dunia"><BrandMark /><span>shibuya<span className="brand-second">blocks<span className="brand-dot">.</span></span></span></a>
      <nav className="main-nav world-main-nav" aria-label="Mode tampilan">
        <button className="nav-link active" onClick={() => { setView('isometric'); setResetSignal(value => value + 1); }}><Map size={13} /> World Map</button>
        <button className="nav-link studio-nav" onClick={() => leave()}>Studio Aset <ArrowUpRight size={12} /></button>
        <button className="nav-link library-nav" onClick={() => { latestDistance.current = viewer.current?.getDistance() ?? distance; onSavePosition(latestDistance.current); onLibrary(); }}>Koleksi <span>{ASSET_IDS.length}</span></button>
      </nav>
      <div className="header-actions">
        {onBackToPigeon && (
          <button
            onClick={onBackToPigeon}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#ffd21f',
              color: '#151823',
              fontWeight: 800,
              fontSize: '12px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              border: 'none',
            }}
            title="Pindah ke Game Skateboard Pigeon SK8"
          >
            <span>🛹</span>
            <span>Pigeon SK8</span>
          </button>
        )}
        <button className="theme-button" onClick={onNightChange} aria-label={night ? 'Ganti ke siang' : 'Ganti ke malam'} title="Siang / malam (N)">{night ? <Moon size={17} /> : <Sun size={18} />}<span>{night ? 'Malam' : 'Siang'}</span></button>
        <div className="download-wrap" ref={downloadMenu}>
          <button className="primary-button download-button" onClick={() => setDownloadOpen(value => !value)} disabled={exporting} aria-expanded={downloadOpen} aria-haspopup="menu" aria-label="Unduh world map">{exporting ? <LoaderCircle size={16} className="spinning" /> : <Download size={16} />}<span>{exporting ? 'Menyiapkan...' : 'Unduh map'}</span><ChevronDown size={13} /></button>
          <AnimatePresence>{downloadOpen && <motion.div className="download-menu" role="menu" initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -5, opacity: 0 }}>
            <span className="menu-label">MAP MODULAR / {district.name.toUpperCase()}</span>
            <button role="menuitem" disabled={!ready || failed} onClick={() => download('glb')}><Box size={19} /><span><strong>Blok map <small>.glb</small></strong><em>Snapshot {WORLD.chunkLength} m dengan rel dan palang</em></span><ArrowDownToLine size={14} /></button>
            <button role="menuitem" onClick={() => download('json')}><Code2 size={19} /><span><strong>Aturan & layout <small>.json</small></strong><em>Grid, skala, dan empat zona dunia</em></span><ArrowDownToLine size={14} /></button>
            <button role="menuitem" disabled={!ready || failed} onClick={() => download('png')}><Image size={19} /><span><strong>Gambar map <small>.png</small></strong><em>Sudut kamera saat ini</em></span><ArrowDownToLine size={14} /></button>
          </motion.div>}</AnimatePresence>
        </div>
      </div>
    </header>

    <motion.section className="world-intro" aria-labelledby="world-title" initial={reduceMotion ? false : { y: 9, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.65 }}>
      <div className="eyebrow intro-eyebrow"><span className="tiny-square" /> ENDLESS WORLD MAP</div>
      <h1 id="world-title">Shibuya{' '}<br />Blocks<span>.</span></h1>
      <p>Motor berlalu, warga belanja.<br />Ramen hangat di sudut kota.</p>
      <button className="world-explore-button" disabled={!ready || failed} onClick={() => setRunning(value => !value)}>{running ? <Pause size={14} /> : <Play size={14} />}<span>{running ? 'Jeda penjelajahan' : 'Jelajahi jalan'}</span><ArrowUpRight size={15} /></button>
      <button className="world-arrange-link" onClick={() => { setRunning(false); setSettingsOpen(true); }}><SlidersHorizontal size={13} /> Susunan dunia</button>
      <button className="world-train-link" disabled={!ready || failed} onClick={showTrain}><TrainFront size={14} /> Lihat kereta lewat <ArrowUpRight size={12} /></button>
      <button className="world-business-link" disabled={!ready || failed} onClick={showBusiness}><ShoppingBag size={13} />{businessFocus === 'ramen' ? 'Lihat yang makan ramen' : 'Lihat yang belanja'}<ArrowUpRight size={12} /></button>
      {layers.railway && <div className="world-rail-status" role="status"><span>{live ? railReport.label : 'Simulasi dijeda'}</span>{railReport.waiting > 0 && <small>{railReport.waiting} menunggu</small>}</div>}
      <div className="world-zone-name"><span className="location-line" /><span>{district.name.toUpperCase()}</span></div>
    </motion.section>

    <AnimatePresence>{!ready && !failed && <motion.div className="world-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoaderCircle size={18} className="spinning" /><span>Menyambungkan dunia...</span></motion.div>}</AnimatePresence>

    <div className="world-viewer-tools" aria-label="Navigasi world map">
      <button className={`tool-button ${running ? 'selected' : ''}`} disabled={!ready || failed} onClick={() => setRunning(value => !value)} aria-label={running ? 'Jeda jelajah' : 'Mulai jelajah'} title="Jelajah otomatis (Space)">{running ? <Pause size={15} /> : <Play size={15} />}</button>
      <button className="tool-button" disabled={!ready || distance < 1} onClick={() => nextCrossing(-1)} aria-label="Perempatan sebelumnya" title="Perempatan sebelumnya"><ChevronDown size={17} /></button>
      <button className="tool-button" disabled={!ready} onClick={() => nextCrossing(1)} aria-label="Perempatan berikutnya" title="Perempatan berikutnya"><ChevronUp size={17} /></button>
      <select className="world-speed" aria-label="Kecepatan penjelajahan" value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option></select>
      <span className="tool-divider" />
      <select className="world-camera" aria-label="Sudut kamera world map" value={view} onChange={event => { setView(event.target.value as WorldCamera); setRunning(false); }}><option value="isometric">Isometrik</option><option value="overhead">Dari atas</option></select>
      <span className="tool-divider" />
      <button className="tool-button" disabled={!ready} onClick={() => viewer.current?.zoom(-1)} aria-label="Perkecil map" title="Perkecil (-)"><ZoomOut size={17} /></button>
      <button className="tool-button" disabled={!ready} onClick={() => viewer.current?.zoom(1)} aria-label="Perbesar map" title="Perbesar (+)"><ZoomIn size={17} /></button>
      <button className="tool-button" onClick={reset} aria-label="Ulangi dunia dari awal" title="Ulangi dari awal (0)"><RotateCcw size={17} /></button>
      <span className="tool-divider" />
      <button className="tool-button world-train-tool" disabled={!ready} onClick={showTrain} aria-label="Lihat kereta dan ulangi siklus palang" title="Fokus perlintasan kereta"><TrainFront size={17} /></button>
      <button className={`tool-button ${live ? 'selected' : ''}`} onClick={() => setLive(value => !value)} aria-label={live ? 'Jeda simulasi warga dan kereta' : 'Jalankan simulasi warga dan kereta'} aria-pressed={live} title={live ? 'Simulasi hidup: aktif' : 'Simulasi dijeda'}><Users size={16} /></button>
      <button className="tool-button" onClick={() => { setRunning(false); setSettingsOpen(true); }} aria-label="Pengaturan susunan dunia"><Layers size={17} /></button>
    </div>

    <footer className="world-route">
      <div className="world-route-label"><span>RUTE DUNIA</span><InfinityIcon size={17} /></div>
      <div className="world-districts" aria-label="Pindah ke zona dunia">
        {DISTRICTS.map((item, index) => <button key={item.id} className={`world-district ${progress.district === index ? 'active' : ''}`} onClick={() => jumpDistrict(index)} disabled={!ready} aria-pressed={progress.district === index}>
          <span className="world-route-stop" /><span className="world-district-copy"><small>{String(index + 1).padStart(2, '0')} /</small><strong>{item.name}</strong></span>
        </button>)}
      </div>
      <div className="world-distance" aria-live="off"><strong>{String(Math.floor(distance)).padStart(4, '0')} <small>m</small></strong><span>{Math.ceil(remaining)} m ke perempatan berikutnya</span></div>
      <div className="world-keyboard-hint"><span><kbd>W</kbd><kbd>S</kbd> Maju / mundur</span><span>Drag putar, scroll zoom</span></div>
    </footer>
    <AnimatePresence>{settingsOpen && <Settings layers={layers} onToggle={key => setLayers(value => ({ ...value, [key]: !value[key] }))} live={live} onLive={() => setLive(value => !value)} onClose={closeSettings} district={district} onInspect={inspectDecorations} />}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast world-toast" role="status" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{toast.startsWith('Unduhan gagal') ? <X size={16} /> : <Check size={16} />}<span>{toast}</span><button onClick={() => setToast(null)} aria-label="Tutup notifikasi"><X size={14} /></button></motion.div>}</AnimatePresence>
  </main>;
}