import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDownToLine, ArrowUpRight, Box, Check, ChevronDown, ChevronLeft, ChevronRight, Download,
  Eye, Grid2X2, Image, Keyboard, Layers, LoaderCircle, Map as MapIcon, Moon, MousePointer2,
  Pause, Play, RotateCcw, RotateCw, Sun, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import AssetThumbnail from './components/AssetThumbnail';
import AssetViewer, { type CameraView, type ViewerHandle } from './voxel/AssetViewer';
import { downloadBlob, exportAssetGlb } from './voxel/exportAsset';
import { ASSET_IDS, ASSET_INFO, type AssetId } from './voxel/models';
import { getMember, isPackAsset, PACK_MEMBERS, VEHICLE_MEMBERS } from './voxel/packCatalog';
import BrandMark from './components/BrandMark';
import WorldMap from './world/WorldMap';
import './shibuya.css';

const PRIMARY_ANIMATION: Record<string, string> = { characters: 'Walk', vehicles: 'Ride', animals: 'Play' };
const ANIMATION_LABEL: Record<string, string> = { characters: 'Jalan', vehicles: 'Berkendara', animals: 'Bermain' };

function CollectionDialog({ asset, onChoose, onClose, onWorld }: { asset: AssetId; onChoose: (id: AssetId) => void; onClose: () => void; onWorld: () => void }) {
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog.current) return;
      const buttons = dialog.current.querySelectorAll<HTMLButtonElement>('button');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => { window.removeEventListener('keydown', handler); previous?.focus(); };
  }, [onClose]);

  return <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="collection-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title"
      initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}>
      <div className="dialog-top"><span className="eyebrow">KOLEKSI LENGKAP / {ASSET_IDS.length} ASET</span><button className="icon-button" onClick={onClose} aria-label="Tutup koleksi"><X size={19} /></button></div>
      <h2 id="dialog-title">Satu kota.<br />Banyak cerita kecil.</h2>
      <p>Bangunan lama tetap ada. Kini ada 10 karakter, {VEHICLE_MEMBERS.length} kendaraan termasuk rider, serta 8 hewan dan maskot. Di world map, warga juga belanja dan makan ramen.</p>
      <button className="library-world-link" onClick={onWorld}><MapIcon size={17} /><span>Lihat semua aset dalam World Map</span><ArrowUpRight size={15} /></button>
      <div className="library-grid" aria-label="Semua aset Shibuya Blocks">
        {ASSET_IDS.map(id => <button key={id} className={`library-option ${asset === id ? 'active' : ''}`}
          onClick={() => { onChoose(id); onClose(); }} aria-pressed={asset === id}>
          <div className="library-option-top"><span>{ASSET_INFO[id].number} / {ASSET_INFO[id].category}</span>{ASSET_INFO[id].isNew && <em>BARU</em>}</div>
          <AssetThumbnail asset={id} />
          <strong>{ASSET_INFO[id].name}</strong><span className="library-japanese">{ASSET_INFO[id].japanese}</span>
          {asset === id && <Check className="library-check" size={14} />}
        </button>)}
      </div>
      <div className="dialog-export"><Box size={20} /><div><strong>Siap dibawa ke duniamu.</strong><p>GLB berisi geometri, tekstur pixel, dan loop animasi untuk koleksi baru. Pilih satu anggota untuk unduhan terpisah; matikan diorama untuk aset tanpa alas. PNG mengambil pose dan sudut kamera saat ini.</p></div></div>
      <div className="shortcuts">
        <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Pilih aset</span>
        <span><kbd>R</kbd> Putar otomatis</span>
        <span><kbd>N</kbd> Siang / malam</span>
        <span><kbd>0</kbd> Reset kamera</span>
        <span><kbd>Shift</kbd> Drag untuk geser</span>
        <span><kbd>T</kbd> Tokyo Tower</span>
        <span><kbd>C</kbd> Karakter</span>
        <span><kbd>V</kbd> Kendaraan</span>
        <span><kbd>A</kbd> Hewan</span>
        <span><kbd>K</kbd> Play / pause animasi</span>
      </div>
      <button className="primary-button dialog-close" onClick={onClose}>Kembali ke aset <ArrowUpRight size={16} /></button>
    </motion.div>
  </motion.div>;
}

export default function ShibuyaApp({ onBackToPigeon }: { onBackToPigeon?: () => void } = {}) {
  const [mode, setMode] = useState<'world' | 'studio'>('world');
  const [asset, setAsset] = useState<AssetId>('characters');
  const [night, setNight] = useState(false);
  const [diorama, setDiorama] = useState(true);
  const [spin, setSpin] = useState(false);
  const [view, setView] = useState<CameraView>('iso');
  const [resetSignal, setResetSignal] = useState(0);
  const [ready, setReady] = useState(false);
  const [viewerError, setViewerError] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [animationName, setAnimationName] = useState('Walk');
  const [animationPlaying, setAnimationPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const viewer = useRef<ViewerHandle>(null);
  const downloadMenu = useRef<HTMLDivElement>(null);
  const viewMenu = useRef<HTMLDivElement>(null);
  const activeOption = useRef<HTMLButtonElement>(null);
  const worldDistance = useRef(0);
  const reduceMotion = useReducedMotion();
  const info = ASSET_INFO[asset];
  const pack = isPackAsset(asset);
  const members = isPackAsset(asset) ? PACK_MEMBERS[asset] : [];
  const memberInfo = getMember(asset, focus);
  const assetIndex = ASSET_IDS.indexOf(asset);
  const handleReady = useCallback(() => setReady(true), []);
  const handleInteract = useCallback(() => setSpin(false), []);
  const handleViewerError = useCallback(() => { setViewerError(true); setReady(false); }, []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);
  const saveWorldPosition = useCallback((next: number) => { worldDistance.current = next; }, []);
  const toggleNight = useCallback(() => setNight(value => !value), []);
  const openWorld = useCallback(() => { setAboutOpen(false); setDownloadOpen(false); setViewMenuOpen(false); setMode('world'); }, []);
  const openLibrary = useCallback(() => { setMode('studio'); setAboutOpen(true); }, []);

  const chooseAsset = useCallback((next: AssetId) => {
    if (!ASSET_INFO[next]) return;
    if (next !== asset) { setReady(false); setAsset(next); }
    if (focus) setReady(false);
    setFocus(null); setAnimationName(PRIMARY_ANIMATION[next] ?? 'Walk');
    setSpin(false); setView('iso'); setResetSignal(value => value + 1);
  }, [asset, focus]);

  const chooseMember = useCallback((next: string | null) => {
    if (!isPackAsset(asset) || (next && !PACK_MEMBERS[asset].some(item => item.id === next))) return;
    if (next === focus) return;
    setReady(false); setFocus(next); setSpin(false); setView('iso');
    setResetSignal(value => value + 1);
  }, [asset, focus]);

  const openStudio = useCallback((next?: AssetId, member?: string) => {
    setMode('studio'); setDownloadOpen(false); setViewMenuOpen(false);
    if (next) {
      chooseAsset(next);
      if (member && isPackAsset(next) && PACK_MEMBERS[next].some(item => item.id === member)) setFocus(member);
    }
  }, [chooseAsset]);

  const resetCamera = useCallback(() => {
    setView('iso'); setSpin(false); setResetSignal(value => value + 1);
  }, []);

  useEffect(() => {
    if (mode !== 'studio') return;
    activeOption.current?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'nearest', inline: 'nearest' });
  }, [asset, reduceMotion, mode]);

  useEffect(() => {
    const clickAway = (event: PointerEvent) => {
      if (!downloadMenu.current?.contains(event.target as Node)) setDownloadOpen(false);
      if (!viewMenu.current?.contains(event.target as Node)) setViewMenuOpen(false);
    };
    document.addEventListener('pointerdown', clickAway);
    return () => document.removeEventListener('pointerdown', clickAway);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (mode !== 'studio') return;
      if (event.key === 'Escape') { setDownloadOpen(false); setViewMenuOpen(false); }
      if (aboutOpen || downloadOpen || viewMenuOpen || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName)) return;
      if (/^[1-9]$/.test(event.key)) {
        const id = ASSET_IDS.find(id => Number(ASSET_INFO[id].number) === Number(event.key));
        if (id) chooseAsset(id);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const next = (assetIndex + (event.key === 'ArrowRight' ? 1 : -1) + ASSET_IDS.length) % ASSET_IDS.length;
        chooseAsset(ASSET_IDS[next]);
      }
      if (event.key.toLowerCase() === 'p') chooseAsset('pagoda');
      if (event.key.toLowerCase() === 's') chooseAsset('skyscraper');
      if (event.key.toLowerCase() === 't') chooseAsset('tokyotower');
      if (event.key.toLowerCase() === 'b') chooseAsset('sakura');
      if (event.key.toLowerCase() === 'c') chooseAsset('characters');
      if (event.key.toLowerCase() === 'v') chooseAsset('vehicles');
      if (event.key.toLowerCase() === 'a') chooseAsset('animals');
      if (event.key.toLowerCase() === 'k') setAnimationPlaying(value => !value);
      if (event.key.toLowerCase() === 'r') setSpin(value => !value);
      if (event.key.toLowerCase() === 'n') setNight(value => !value);
      if (event.key === '0') resetCamera();
      if (event.key === '+' || event.key === '=') viewer.current?.zoom(1);
      if (event.key === '-') viewer.current?.zoom(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [chooseAsset, resetCamera, aboutOpen, assetIndex, downloadOpen, viewMenuOpen, mode]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function download(extension: 'glb' | 'png') {
    setDownloadOpen(false); setExporting(true);
    try {
      const blob = extension === 'glb' ? await exportAssetGlb(asset, diorama, focus) : await viewer.current?.capture();
      if (!blob) throw new Error('Viewer is not ready.');
      downloadBlob(blob, asset, extension, focus);
      setToast(extension === 'glb' ? 'Model GLB berhasil diunduh.' : 'PNG transparan berhasil diunduh.');
    } catch (error) {
      console.error('Asset export failed:', error);
      setToast('Unduhan gagal. Silakan coba lagi.');
    } finally { setExporting(false); }
  }

  if (mode === 'world') {
    return (
      <div className="shibuya-root w-full h-[100dvh] overflow-hidden">
        <WorldMap
          initialDistance={worldDistance.current}
          night={night}
          onNightChange={toggleNight}
          onSavePosition={saveWorldPosition}
          onStudio={openStudio}
          onLibrary={openLibrary}
          onBackToPigeon={onBackToPigeon}
        />
      </div>
    );
  }

  return (
    <div className="shibuya-root w-full h-[100dvh] overflow-hidden">
      <main className={`studio ${night ? 'night' : ''} ${pack ? 'with-pack' : ''}`} style={{ '--asset-accent': info.accent } as CSSProperties}>
        <div className="studio-atmosphere" aria-hidden="true" />
        <div className="canvas-layer" role="img" aria-label={`Model voxel 3D ${info.name}. Drag untuk memutar, scroll untuk zoom, Shift dan drag untuk geser.`}>
          <AssetViewer ref={viewer} asset={asset} night={night} diorama={diorama} spin={spin}
            view={view} resetSignal={resetSignal} reducedMotion={!!reduceMotion} focus={focus} animationName={animationName}
            animationPlaying={animationPlaying} animationSpeed={animationSpeed} onSelectMember={chooseMember}
            onReady={handleReady} onInteract={handleInteract} onError={handleViewerError} />
        </div>

        <header className="studio-header">
          <a href="#" className="brand" onClick={event => { event.preventDefault(); chooseAsset('characters'); }} aria-label="Shibuya Blocks, kembali ke koleksi karakter">
            <BrandMark /><span>shibuya<span className="brand-second">blocks<span className="brand-dot">.</span></span></span>
          </a>
          <nav className="main-nav" aria-label="Navigasi utama">
            <button className="nav-link studio-world-link" onClick={openWorld}><MapIcon size={13} />World Map</button>
            <button className={`nav-link ${asset === 'characters' ? 'active' : ''}`} onClick={() => chooseAsset('characters')}>Karakter</button>
            <button className={`nav-link ${asset === 'vehicles' ? 'active' : ''}`} onClick={() => chooseAsset('vehicles')}>Kendaraan</button>
            <button className={`nav-link ${asset === 'animals' ? 'active' : ''}`} onClick={() => chooseAsset('animals')}>Hewan</button>
            <button className="nav-link" onClick={() => setAboutOpen(true)}>Koleksi <span>{ASSET_IDS.length}</span><ArrowUpRight size={12} /></button>
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
            <button className="theme-button" onClick={() => setNight(value => !value)} aria-label={night ? 'Ganti ke pencahayaan siang' : 'Ganti ke pencahayaan malam'} title="Siang / malam (N)">
              {night ? <Moon size={17} /> : <Sun size={18} />}<span>{night ? 'Malam' : 'Siang'}</span>
            </button>
        <div className="download-wrap" ref={downloadMenu}>
          <button className="primary-button download-button" onClick={() => setDownloadOpen(value => !value)} disabled={exporting}
            aria-expanded={downloadOpen} aria-haspopup="menu" aria-label={exporting ? 'Menyiapkan unduhan' : 'Unduh aset'}>
            {exporting ? <LoaderCircle className="spinning" size={16} /> : <Download size={16} />}<span>{exporting ? 'Menyiapkan...' : 'Unduh aset'}</span><ChevronDown size={13} />
          </button>
          <AnimatePresence>{downloadOpen && <motion.div className="download-menu" role="menu" initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -5, opacity: 0 }}>
            <span className="menu-label">BAWA PULANG {(memberInfo?.name ?? info.name).toUpperCase()}</span>
            <button role="menuitem" onClick={() => download('glb')}><Box size={19} /><span><strong>{pack ? 'Model + animasi' : 'Model 3D'} <small>.glb</small></strong><em>{pack ? focus ? 'Satu aset, rig, dan dua loop animasi' : 'Seluruh barisan dengan animasinya' : asset === 'skyscraper' || asset === 'tokyotower' ? diorama ? 'Menara beserta seluruh lingkungan' : 'Hanya menara dan bangunan dasar' : 'Geometri dan tekstur pixel'}</em></span><ArrowDownToLine size={14} /></button>
            <button role="menuitem" onClick={() => download('png')} disabled={!ready || viewerError}><Image size={19} /><span><strong>Gambar transparan <small>.png</small></strong><em>Sudut kamera saat ini</em></span><ArrowDownToLine size={14} /></button>
          </motion.div>}</AnimatePresence>
        </div>
      </div>
    </header>

    <section className="studio-intro" aria-labelledby="studio-title">
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
        <div className="eyebrow intro-eyebrow"><span className="tiny-square" /> VOXEL ASSET STUDIO</div>
        <h1 id="studio-title">Shibuya{' '}<br />Blocks<span>.</span></h1>
        <div className="intro-rule" />
      </motion.div>
      <AnimatePresence mode="wait"><motion.div key={`${asset}-${focus ?? 'all'}`} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.22 }}>
        <div className="current-asset-label"><span>{memberInfo ? String(members.findIndex(item => item.id === focus) + 1).padStart(2, '0') : info.number}</span><span>/</span><span>{(memberInfo?.name ?? info.name).toUpperCase()}</span></div>
        <p className="asset-description">{memberInfo?.detail ?? info.description}</p>
      </motion.div></AnimatePresence>
      {pack ? <div className="pack-selector">
        <label htmlFor="pack-member">LIHAT ASET</label>
        <div className="member-select-wrap"><select id="pack-member" value={focus ?? ''} onChange={event => chooseMember(event.target.value || null)}>
          <option value="">{asset === 'characters' ? 'Barisan 10 karakter' : asset === 'vehicles' ? `Semua ${VEHICLE_MEMBERS.length} kendaraan` : 'Semua 8 teman kecil'}</option>
          {members.map((item, i) => <option key={item.id} value={item.id}>{String(i + 1).padStart(2, '0')} / {item.name}</option>)}
        </select><ChevronDown size={14} /></div>
        {memberInfo ? <><p className="member-motion">{memberInfo.motion}</p><div className="member-navigation">
          <button onClick={() => chooseMember(null)}>Kembali ke barisan <ArrowUpRight size={12} /></button>
          <div><button aria-label="Anggota sebelumnya" onClick={() => chooseMember(members[(members.findIndex(item => item.id === focus) - 1 + members.length) % members.length].id)}><ChevronLeft size={15} /></button><button aria-label="Anggota berikutnya" onClick={() => chooseMember(members[(members.findIndex(item => item.id === focus) + 1) % members.length].id)}><ChevronRight size={15} /></button></div>
        </div></> : <p className="member-hint">Klik model atau pilih nama untuk melihat detailnya.</p>}
      </div> : <><button className="text-link" onClick={() => setAboutOpen(true)}>Kenali detailnya <ArrowUpRight size={15} /></button>
        <div className="intro-location"><span className="location-line" /><span>SHIBUYA, TOKYO</span><span className="location-jp">{'\u6e0b\u8c37'}</span></div></>}
    </section>

    <div className="scene-corner" aria-hidden="true"><span>{pack ? 'VOXEL CHARACTERS & LITTLE FRIENDS' : 'JAPAN IN LITTLE BLOCKS'}</span><span className="corner-japanese">{memberInfo?.japanese ?? info.japanese}</span></div>
    <AnimatePresence>{!ready && !viewerError && <motion.div className="viewer-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><LoaderCircle className="spinning" size={19} /><span>Menyusun blok...</span></motion.div>}</AnimatePresence>

    {pack && <div className="animation-controls" aria-label="Kontrol animasi aset">
      <button className="animation-play" onClick={() => setAnimationPlaying(value => !value)} aria-label={animationPlaying ? 'Jeda animasi' : 'Jalankan animasi'} title="Play / pause (K)">{animationPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
      <div className="animation-modes"><button className={animationName === PRIMARY_ANIMATION[asset] ? 'active' : ''} onClick={() => setAnimationName(PRIMARY_ANIMATION[asset])} aria-pressed={animationName === PRIMARY_ANIMATION[asset]}>{ANIMATION_LABEL[asset]}</button><button className={animationName === 'Iconic' ? 'active' : ''} onClick={() => setAnimationName('Iconic')} aria-pressed={animationName === 'Iconic'}>Pose khas</button></div>
      <span className="tool-divider" /><select aria-label="Kecepatan animasi" value={animationSpeed} onChange={event => setAnimationSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="1.5">1.5x</option><option value="2">2x</option></select>
    </div>}
    <div className="viewer-tools" aria-label="Kontrol model 3D">
      <div className="view-menu-wrap" ref={viewMenu}>
        <button className="view-button" onClick={() => setViewMenuOpen(value => !value)} aria-expanded={viewMenuOpen} aria-haspopup="menu">
          {view === 'iso' ? <Box size={17} /> : <Eye size={17} />}<span>{view === 'iso' ? 'Isometrik' : 'Tampak depan'}</span><ChevronDown size={12} />
        </button>
        <AnimatePresence>{viewMenuOpen && <motion.div className="camera-menu" role="menu" initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 5, opacity: 0 }}>
          {(['iso', 'front'] as CameraView[]).map(option => <button key={option} role="menuitemradio" aria-checked={view === option} onClick={() => { setView(option); setSpin(false); setViewMenuOpen(false); }}>
            {option === 'iso' ? <Box size={16} /> : <Eye size={16} />}<span>{option === 'iso' ? 'Isometrik' : 'Tampak depan'}</span>{view === option && <Check size={14} />}
          </button>)}
        </motion.div>}</AnimatePresence>
      </div>
      <span className="tool-divider" />
      <button className="tool-button" onClick={() => viewer.current?.zoom(-1)} disabled={!ready} title="Perkecil (-)" aria-label="Perkecil model"><ZoomOut size={17} /></button>
      <button className="tool-button" onClick={() => viewer.current?.zoom(1)} disabled={!ready} title="Perbesar (+)" aria-label="Perbesar model"><ZoomIn size={17} /></button>
      <span className="tool-divider" />
      <button className={`tool-button ${spin ? 'selected' : ''}`} onClick={() => setSpin(value => !value)} title="Putar otomatis (R)" aria-label={spin ? 'Hentikan putaran' : 'Putar model otomatis'} aria-pressed={spin}>
        {spin ? <Pause size={16} /> : <RotateCw size={17} />}
      </button>
      <button className="tool-button" onClick={resetCamera} title="Reset kamera (0)" aria-label="Reset kamera"><RotateCcw size={17} /></button>
      <span className="tool-divider" />
      <button className={`tool-button diorama-button ${diorama ? 'selected' : ''}`} onClick={() => setDiorama(value => !value)} title={diorama ? 'Sembunyikan alas dan lingkungan' : 'Tampilkan alas dan lingkungan'} aria-label={pack ? 'Tampilkan alas aset' : 'Tampilkan diorama'} aria-pressed={diorama}><Layers size={15} /><span>{pack ? 'Alas' : 'Diorama'}</span></button>
    </div>

    <footer className="asset-shelf">
      <div className="asset-picker">
        <button className="shelf-label" onClick={() => setAboutOpen(true)} title="Lihat seluruh koleksi">PILIH<br />ASET <Grid2X2 size={11} /><span>{String(assetIndex + 1).padStart(2, '0')} / {ASSET_IDS.length}</span></button>
        <div className="asset-options" aria-label="Pilihan aset">
          {ASSET_IDS.map(id => <motion.button key={id} ref={asset === id ? activeOption : undefined}
            className={`asset-option ${asset === id ? 'active' : ''}`} onClick={() => chooseAsset(id)} aria-pressed={asset === id}
            whileHover={reduceMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.985 }}>
            {asset === id && <motion.div className="option-highlight" layoutId="asset-highlight" transition={{ type: 'spring', stiffness: 360, damping: 32 }} />}
            <AssetThumbnail asset={id} />
            <span className="option-copy"><span className="option-number">{ASSET_INFO[id].number} <span>/</span>{ASSET_INFO[id].isNew && <em>BARU</em>}</span><strong>{ASSET_INFO[id].name}</strong><span className="option-japanese">{ASSET_INFO[id].japanese}</span></span>
            {asset === id && <span className="option-indicator" aria-hidden="true" />}
          </motion.button>)}
        </div>
      </div>
      <div className="shelf-help"><div className="shelf-arrows"><button onClick={() => chooseAsset(ASSET_IDS[assetIndex - 1])} disabled={assetIndex === 0} aria-label="Aset sebelumnya"><ChevronLeft size={17} /></button><button onClick={() => chooseAsset(ASSET_IDS[assetIndex + 1])} disabled={assetIndex === ASSET_IDS.length - 1} aria-label="Aset berikutnya"><ChevronRight size={17} /></button></div><div className="drag-hint"><MousePointer2 size={14} /><span>Drag putar / scroll zoom<br /><em>Shift + drag untuk geser</em></span></div><button className="shortcuts-button" onClick={() => setAboutOpen(true)} title="Koleksi dan pintasan keyboard" aria-label="Lihat semua aset dan pintasan"><Keyboard size={20} /></button></div>
    </footer>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>{toast.startsWith('Unduhan gagal') ? <X size={16} /> : <Check size={16} />}<span>{toast}</span><button onClick={() => setToast(null)} aria-label="Tutup notifikasi"><X size={14} /></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{aboutOpen && <CollectionDialog asset={asset} onChoose={chooseAsset} onClose={closeAbout} onWorld={openWorld} />}</AnimatePresence>
      </main>
    </div>
  );
}