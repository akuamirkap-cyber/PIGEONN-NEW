import { useUI } from "../game/store";
import { sfx } from "../game/audio";

/**
 * Tutorial pertama kali (sekali tampil, tersimpan) — wajib untuk rilis di HP & komputer:
 * pemain baru langsung paham kontrol dalam <10 detik sebelum main pertama.
 */
export function Tutorial() {
  const seen = useUI((s) => s.tutorialSeen);
  const setSeen = useUI((s) => s.setTutorialSeen);
  if (seen) return null;

  const Row = ({ icon, label, desc }: { icon: string; label: string; desc: string }) => (
    <div className="flex w-full items-center gap-3 rounded-xl bg-[#f3f6fb] px-3 py-2">
      <span className="flex h-9 min-w-11 items-center justify-center rounded-lg bg-white px-2 text-center font-display text-[2.2cqw] leading-tight text-[#1f2430] shadow-[0_2px_0_#dfe3e8]">
        {icon}
      </span>
      <div className="flex flex-col leading-tight text-left">
        <span className="font-display text-[3cqw] leading-none text-[#1f2430]">{label}</span>
        <span className="font-body text-[2.1cqw] font-bold text-[#667085]">{desc}</span>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-30 flex select-none items-center justify-center bg-black/45 p-4">
      <div className="card-in flex w-[90%] max-w-[400px] flex-col items-center gap-2 rounded-3xl bg-white px-5 py-5 shadow-[0_10px_0_rgba(0,0,0,0.22)]">
        <div className="font-display text-[6.5cqw] leading-none text-[#1f2430]">CARA MAIN</div>
        <div className="-mt-1 font-body text-[2.4cqw] font-extrabold tracking-wide text-[#667085]">🛹 merpati skate yang menghindari Tokyo</div>

        <Row icon="◀ ▶" label="GESER LAJUR" desc="Keyboard: panah kiri/kanan · HP: swipe kiri/kanan" />
        <Row icon="⤒" label="LONCAT" desc="Keyboard: panah atas / SPASI · HP: ketuk atas" />
        <Row icon="⇩" label="SHUV-IT" desc="Keyboard: panah bawah · kelakuan keren di trik" />
        <Row icon="🍞" label="KUMPULKAN ROTI" desc="hindari mobil, motor, kereta & orang — nabur = tamat!" />

        <button
          type="button"
          onClick={() => {
            sfx.click();
            setSeen();
          }}
          className="pointer-events-auto mt-2 w-full rounded-2xl bg-[#2ec4b6] py-3.5 font-display text-[5.2cqw] leading-none text-white shadow-[0_5px_0_#1f9a8f] active:translate-y-[3px] active:shadow-[0_2px_0_#1f9a8f]"
        >
          NGERTI, GAS MAIN!
        </button>
        <div className="font-body text-[1.9cqw] font-bold text-[#9aa4b2]">muncul sekali saja — pengaturan lengkap ada di menu ⚙️</div>
      </div>
    </div>
  );
}
