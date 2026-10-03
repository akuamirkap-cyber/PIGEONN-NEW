import { useEffect, useState } from "react";
import { useUI, WHEEL_COLORS, type WheelColor } from "../game/store";
import { getSkin, SKINS, DECKS, type Skin, type DeckOption } from "../game/skins";
import { sfx } from "../game/audio";
import { engine } from "../game/engine";
import { ensureThumbs, getThumb, onThumbsReady } from "../game/thumbs";
import { BreadIcon } from "./BreadIcon";
import { PigeonIcon } from "./PigeonIcon";
import { LockIcon } from "./LockIcon";

function useThumbs() {
  const [, force] = useState(0);
  useEffect(() => {
    const off = onThumbsReady(() => force((n) => n + 1));
    if (ensureThumbs()) force((n) => n + 1);
    return off;
  }, []);
}

function Thumb({ skin, locked, size }: { skin: Skin; locked: boolean; size: number }) {
  const url = getThumb(skin.id);
  const style = locked ? { filter: "grayscale(0.85) brightness(0.8)" } : undefined;
  if (url) return <img src={url} width={size} height={size} draggable={false} alt={skin.name} style={style} className="select-none" />;
  return <PigeonIcon skin={skin} size={size} locked={locked} />;
}

function SkinCard({ skin }: { skin: Skin }) {
  const equipped = useUI((s) => s.skin) === skin.id;
  const previewing = useUI((s) => s.preview) === skin.id;
  const unlocked = useUI((s) => s.unlocked).includes(skin.id);
  const wallet = useUI((s) => s.wallet);
  const selectSkin = useUI((s) => s.selectSkin);
  const setPreview = useUI((s) => s.setPreview);
  const affordable = wallet >= skin.cost;

  const onClick = () => {
    sfx.click();
    if (unlocked) selectSkin(skin.id);
    else setPreview(skin.id);
    setPreview(skin.id);
    engine.skinPop();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full flex-col items-center rounded-[20px] px-2 pb-2 pt-2 shadow-[0_4px_0_rgba(0,0,0,0.12)] transition-transform hover:z-10 hover:scale-[1.015] active:translate-y-[2px] active:shadow-none ${
        previewing ? "bg-[#e6f7f5] ring-[3px] ring-[#2ec4b6]" : "bg-white ring-2 ring-black/5"
      }`}
    >
      <div className="relative flex h-[32cqw] w-full items-center justify-center overflow-hidden rounded-[16px] bg-gradient-to-b from-[#bfe6ff] to-[#e9f6ff]">
        <Thumb skin={skin} locked={!unlocked} size={136} />
        {!unlocked && (
          <div className="absolute right-1 top-1">
            <LockIcon size={15} />
          </div>
        )}
        {equipped && <div className="absolute left-1 top-1 rounded-full bg-[#2ec4b6] px-1.5 py-0.5 font-display text-[2.1cqw] leading-none text-white">ON</div>}
      </div>
      <div className="mt-1 w-full truncate text-center font-body text-[3.1cqw] font-extrabold text-[#1f2430]">{skin.name}</div>
      {unlocked ? (
        <div className="mt-0.5 font-display text-[2.3cqw] leading-none text-[#1f9a8f]">{equipped ? "EQUIPPED" : skin.cost === 0 ? "FREE" : "OWNED"}</div>
      ) : (
        <div className={`mt-0.5 flex items-center gap-1 font-display text-[2.5cqw] leading-none ${affordable ? "text-[#b58600]" : "text-[#9aa1ad]"}`}>
          <BreadIcon size={11} />
          {skin.cost}
        </div>
      )}
    </button>
  );
}

function DeckPreview3D({ baguette }: { baguette: boolean }) {
  return (
    <div className={`deck-preview-3d ${baguette ? "deck-preview-baguette" : "deck-preview-classic"}`} aria-hidden="true">
      <div className="deck-preview-board">
        <div className="deck-preview-grip" />
        <div className="deck-preview-truck deck-preview-truck-front" />
        <div className="deck-preview-truck deck-preview-truck-back" />
        <div className="deck-preview-wheel deck-preview-wheel-a" />
        <div className="deck-preview-wheel deck-preview-wheel-b" />
        <div className="deck-preview-wheel deck-preview-wheel-c" />
        <div className="deck-preview-wheel deck-preview-wheel-d" />
      </div>
    </div>
  );
}

function DeckCard({ deck, active, onSelect }: { deck: DeckOption; active: boolean; onSelect: () => void }) {
  const isBaguette = deck.id === "baguette";
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer relative flex flex-col justify-between rounded-2xl p-3 shadow-[0_4px_0_rgba(0,0,0,0.1)] transition-all ${
        active ? "bg-[#fff2db] ring-3 ring-[#ff9f1c]" : "bg-white ring-1 ring-black/5 hover:bg-white/95"
      }`}
    >
      {/* Top row: badge & state */}
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 font-display text-[2.4cqw] leading-none ${isBaguette ? "bg-[#ff9f1c] text-white" : "bg-[#2ec4b6] text-white"}`}>
          {deck.badge}
        </span>
        {active && (
          <span className="rounded-full bg-[#2ec4b6] px-2 py-0.5 font-display text-[2.3cqw] leading-none text-white">
            AKTIF ✓
          </span>
        )}
      </div>

      {/* Visual illustration of deck */}
      <div className="my-2 flex h-[26cqw] w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#f0f4f8] to-[#e1e9f0] p-2">
        <DeckPreview3D baguette={isBaguette} />
      </div>

      <div>
        <div className="font-display text-[3.8cqw] leading-snug text-[#1f2430] flex items-center gap-1">
          <span>{deck.emoji}</span> {deck.name}
        </div>
        <div className="mt-1 font-body text-[2.6cqw] font-bold text-[#6b7280] leading-snug">
          {deck.tagline}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={`mt-3 w-full rounded-xl py-2 font-display text-[3.2cqw] leading-none transition-all ${
          active
            ? "bg-[#2ec4b6] text-white shadow-[0_3px_0_#1f9a8f]"
            : "bg-[#ffd60a] text-[#1f2430] shadow-[0_3px_0_#c9a400] active:translate-y-[2px] active:shadow-none"
        }`}
      >
        {active ? "DIPAKAI ✓" : "PAKAI PAPAN INI"}
      </button>
    </div>
  );
}

export function SkinsPanel() {
  useThumbs();
  const [tab, setTab] = useState<"skins" | "decks">("skins");
  const wallet = useUI((s) => s.wallet);
  const setMenuView = useUI((s) => s.setMenuView);
  const previewId = useUI((s) => s.preview);
  const equippedId = useUI((s) => s.skin);
  const unlocked = useUI((s) => s.unlocked);
  const selectSkin = useUI((s) => s.selectSkin);
  const unlockSkin = useUI((s) => s.unlockSkin);
  const setPreview = useUI((s) => s.setPreview);
  const deckOverride = useUI((s) => s.deckOverride);
  const setDeckOverride = useUI((s) => s.setDeckOverride);
  const addPopup = useUI((s) => s.addPopup);

  const [shakeKey, setShakeKey] = useState(0);
  const current = getSkin(previewId);
  const isUnlocked = unlocked.includes(current.id);
  const isEquipped = equippedId === current.id;
  const affordable = wallet >= current.cost;

  const close = () => {
    sfx.click();
    if (!unlocked.includes(previewId)) setPreview(equippedId);
    setMenuView("main");
  };

  const action = () => {
    if (isUnlocked) {
      sfx.click();
      selectSkin(current.id);
      engine.skinPop();
      return;
    }
    if (unlockSkin(current.id)) {
      sfx.unlock();
      engine.skinPop();
    } else {
      sfx.deny();
      setShakeKey((k) => k + 1);
    }
  };

  const wheelColor = useUI((st) => st.wheelColor);
  const setWheelColor = useUI((st) => st.setWheelColor);
  const selectWheel = (c: WheelColor) => {
    if (c === wheelColor) return;
    sfx.click();
    setWheelColor(c);
    engine.skinPop();
    const label = WHEEL_COLORS.find((w) => w.id === c)?.label ?? "AUTO";
    addPopup(c === "auto" ? "BAN IKUT SKIN" : `BAN ${label}`, "#2ec4b6", "Warna roda skateboard");
  };

  const selectDeck = (d: "default" | "baguette") => {
    setDeckOverride(d);
    engine.skinPop();
    if (d === "baguette") {
      sfx.unlock();
      addPopup("PAPAN ROTI BAGUETTE!", "#ff9f1c", "Free Baguette Skateboard");
    } else {
      sfx.click();
      addPopup("PAPAN STANDAR! 🛹", "#2ec4b6", "Classic Pro Deck");
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* wallet */}
      <div className="absolute left-[4%] top-[3.5%] flex h-10 items-center gap-1.5 rounded-full bg-black/25 px-3 backdrop-blur-[2px]">
        <BreadIcon size={22} />
        <span className="font-display txt-outline-sm text-[4.6cqw] leading-none text-white">{wallet}</span>
      </div>
      <div className="absolute left-1/2 top-[3.5%] flex h-10 -translate-x-1/2 items-center rounded-full bg-black/25 px-3 font-body text-[2.8cqw] font-extrabold tracking-[0.25em] text-white backdrop-blur-[2px]">
        3D PREVIEW
      </div>

      {/* panel */}
      <div className="card-in pointer-events-auto absolute bottom-0 left-0 right-0 flex h-[68%] flex-col rounded-t-[26px] bg-[#fff8ea] shadow-[0_-6px_0_rgba(0,0,0,0.1)]">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setTab("skins");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2 font-display text-[3.6cqw] transition-all ${
              tab === "skins"
                ? "bg-[#2ec4b6] text-white shadow-[0_3px_0_#1f9a8f]"
                : "bg-white/70 text-[#1f2430]/70 hover:bg-white"
            }`}
          >
            <span>🕊️</span> KARAKTER ({unlocked.length}/{SKINS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              sfx.click();
              setTab("decks");
            }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2 font-display text-[3.6cqw] transition-all ${
              tab === "decks"
                ? "bg-[#ff9f1c] text-white shadow-[0_3px_0_#c9700a]"
                : "bg-white/70 text-[#1f2430]/70 hover:bg-white"
            }`}
          >
            PAPAN SKATE
            {deckOverride === "baguette" && (
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[2.2cqw] font-extrabold text-[#c9700a]">ROTI</span>
            )}
          </button>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f2430] font-display text-[4.6cqw] text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {tab === "skins" ? (
          <>
            {/* Large selected-character showcase: this is the focal point, not a top-down inventory grid. */}
            <div className="skin-showcase relative mx-4 mb-3 h-[38cqw] min-h-[9.2rem] overflow-hidden rounded-[26px] px-4 py-3 shadow-[0_5px_0_rgba(31,36,48,0.16)]">
              <div className="relative z-10 flex h-full w-[57%] flex-col items-start justify-center">
                <div className="rounded-full bg-white/75 px-2.5 py-1 font-body text-[2.2cqw] font-black tracking-[0.18em] text-[#1f9a8f]">
                  SHOWCASE
                </div>
                <div className="mt-1.5 flex max-w-full items-center gap-1.5 font-display text-[5.2cqw] leading-[0.95] text-[#1f2430]">
                  {!isUnlocked && <LockIcon size={15} />}
                  <span className="truncate">{current.name.toUpperCase()}</span>
                </div>
                <div className="mt-1 max-w-full truncate font-body text-[2.6cqw] font-bold text-[#536476]">{current.tagline}</div>
                <div key={shakeKey} className={`mt-2 ${shakeKey ? "shake" : ""}`}>
                  <button
                    type="button"
                    onClick={action}
                    disabled={isEquipped}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-[3.2cqw] leading-none ${
                      isEquipped
                        ? "bg-white/80 text-[#1f9a8f]"
                        : isUnlocked
                          ? "bg-[#2ec4b6] text-white shadow-[0_4px_0_#1f9a8f] active:translate-y-[2px] active:shadow-[0_2px_0_#1f9a8f]"
                          : affordable
                            ? "bg-[#ffd60a] text-[#1f2430] shadow-[0_4px_0_#c9a400] active:translate-y-[2px] active:shadow-[0_2px_0_#c9a400]"
                            : "bg-white/70 text-[#9aa1ad]"
                    }`}
                  >
                    {isEquipped ? "EQUIPPED ✓" : isUnlocked ? "EQUIP" : affordable ? "UNLOCK" : "NEED"}
                    {!isUnlocked && (
                      <span className="flex items-center gap-1">
                        <BreadIcon size={15} />
                        {current.cost}
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="absolute -right-2 bottom-[-1.2rem] z-10 flex h-[11.5rem] w-[49%] items-end justify-center">
                <Thumb skin={current} locked={!isUnlocked} size={184} />
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-4 pb-4" style={{ touchAction: "pan-y" }}>
              {SKINS.map((s) => (
                <SkinCard key={s.id} skin={s} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-4" style={{ touchAction: "pan-y" }}>
            <div className="mb-2 text-center font-body text-[2.8cqw] font-bold text-[#6b7280]">
              Pilih papan skateboard yang ingin kamu pakai untuk berseluncur di jalanan Tokyo!
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DECKS.map((d) => (
                <DeckCard
                  key={d.id}
                  deck={d}
                  active={deckOverride === d.id}
                  onSelect={() => selectDeck(d.id)}
                />
              ))}
            </div>

            {/* warna ban: default hitam, bisa merah / hijau / kuning / biru */}
            <div className="mt-3 rounded-2xl bg-white px-3 py-3 shadow-[0_3px_0_rgba(0,0,0,0.08)]">
              <div className="flex items-baseline justify-between">
                <div className="font-display text-[3.6cqw] leading-none text-[#1f2430]">WARNA BAN</div>
                <div className="font-body text-[2.5cqw] font-extrabold tracking-[0.15em] text-[#9aa1ad]">DEFAULT HITAM</div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {WHEEL_COLORS.map((c) => {
                  const active = c.id === wheelColor;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectWheel(c.id)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-display text-[2.9cqw] leading-none transition-all ${
                        active
                          ? "bg-[#1f2430] text-white shadow-[0_3px_0_rgba(0,0,0,0.25)]"
                          : "bg-[#eef0f3] text-[#1f2430]/80 active:translate-y-[1px]"
                      }`}
                    >
                      <span
                        className="h-[3.4cqw] w-[3.4cqw] shrink-0 rounded-full border border-black/20"
                        style={{ background: c.hex }}
                      />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
