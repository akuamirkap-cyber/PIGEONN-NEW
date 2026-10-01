import { useUI } from "../game/store";
import { INPUT_LABEL, TRICKS, type TrickDef } from "../game/tricks";
import { sfx } from "../game/audio";
import { TrickIcon } from "./TrickIcon";

function Toggle({ on }: { on: boolean }) {
  return (
    <div className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-[#2ec4b6]" : "bg-[#cfd4db]"}`}>
      <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </div>
  );
}

function TrickRow({ t, order }: { t: TrickDef; order: number }) {
  const on = useUI((s) => s.tricksOn[t.kind]);
  const toggle = useUI((s) => s.toggleTrick);
  return (
    <button
      type="button"
      onClick={() => {
        sfx.click();
        toggle(t.kind);
      }}
      className={`flex w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left shadow-[0_3px_0_rgba(0,0,0,0.08)] active:translate-y-[1px] active:shadow-none ${on ? "bg-white" : "bg-white/60"}`}
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: on ? t.color : "#e5e7eb" }}>
        <TrickIcon kind={t.kind} size={24} color={on ? "#1f2430" : "#9aa1ad"} />
        {on && order > 0 && (
          <div className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f2430] font-display text-[2.4cqw] leading-none text-white">{order}</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`font-display text-[3.4cqw] leading-none ${on ? "text-[#1f2430]" : "text-[#9aa1ad]"}`}>{t.name}</span>
          <span className="rounded-full bg-[#fff4d6] px-1.5 py-0.5 font-display text-[2.3cqw] leading-none text-[#8a5a12]">+{t.pts}</span>
          {t.bigAirOnly && <span className="rounded-full bg-[#ffe3ec] px-1.5 py-0.5 font-display text-[2.1cqw] leading-none text-[#c9184a]">RAMP</span>}
        </div>
        <div className="mt-1 truncate font-body text-[2.7cqw] font-bold text-[#8a8f99]">
          <span className="text-[#1f2430]/80">{INPUT_LABEL[t.input]}</span> · {t.desc}
        </div>
      </div>
      <Toggle on={on} />
    </button>
  );
}

export function TricksPanel() {
  const setMenuView = useUI((s) => s.setMenuView);
  const tricksOn = useUI((s) => s.tricksOn);
  const setAll = useUI((s) => s.setAllTricks);
  const onCount = TRICKS.filter((t) => tricksOn[t.kind]).length;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      <div className="absolute left-1/2 top-[3.5%] flex h-10 -translate-x-1/2 items-center rounded-full bg-black/25 px-3 font-body text-[2.8cqw] font-extrabold tracking-[0.25em] text-white backdrop-blur-[2px]">
        FREESTYLE SETUP
      </div>

      <div className="card-in pointer-events-auto absolute bottom-0 left-0 right-0 flex h-[74%] flex-col rounded-t-[28px] bg-[#fff8ea] shadow-[0_-8px_0_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
          <div>
            <div className="font-display text-[5.6cqw] leading-none text-[#1f2430]">TRICKS</div>
            <div className="mt-1 font-body text-[2.8cqw] font-bold text-[#8a8f99]">
              {onCount}/{TRICKS.length} enabled · the S button plays them in this order, one per press
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setAll(true);
              }}
              className="rounded-full bg-[#2ec4b6] px-2.5 py-1.5 font-display text-[2.6cqw] leading-none text-white shadow-[0_3px_0_#1f9a8f] active:translate-y-[1px] active:shadow-none"
            >
              ALL ON
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setAll(false);
              }}
              className="rounded-full bg-[#eef0f3] px-2.5 py-1.5 font-display text-[2.6cqw] leading-none text-[#1f2430] shadow-[0_3px_0_#cfd4db] active:translate-y-[1px] active:shadow-none"
            >
              ALL OFF
            </button>
            <button
              type="button"
              onClick={() => {
                sfx.click();
                setMenuView("main");
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f2430] font-display text-[4.6cqw] text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-[2px] active:shadow-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4" style={{ touchAction: "pan-y" }}>
          {(() => {
            let n = 0;
            return TRICKS.map((t) => <TrickRow key={t.kind} t={t} order={tricksOn[t.kind] ? ++n : 0} />);
          })()}
          <div className="mt-1 rounded-2xl bg-[#1f2430]/85 px-3 py-2 font-body text-[2.7cqw] font-bold leading-snug text-white/85">
            Tip: press the purple S button (or the S key) to run through every enabled trick in order — on the ground it ollies first, in the air it fires the next trick, so you can chain 2–3 per jump. Gestures still work too. Land before the animation ends and it's SKETCHY!
          </div>
        </div>
      </div>
    </div>
  );
}
