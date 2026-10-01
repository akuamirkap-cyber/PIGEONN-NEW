import { useEffect, type RefObject } from "react";
import { engine, type InputAction } from "./engine";
import { unlockAudio } from "./audio";
import { useUI } from "./store";

const SWIPE_PX = 22;

/** Swipe / tap / keyboard → engine actions. Menu buttons are handled by the UI layer. */
export function useInput(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    let active = false;
    let swiped = false;
    let pointerId = -1;
    let lastTap = 0;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let holding = false;

    const fire = (a: InputAction) => {
      unlockAudio();
      engine.input(a);
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (useUI.getState().phase === "menu") return;
      active = true;
      swiped = false;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      // press-and-hold → grab (only matters while airborne)
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = setTimeout(() => {
        if (active && !swiped) {
          holding = true;
          fire("holdStart");
        }
      }, 160);
    };
    const onMove = (e: PointerEvent) => {
      if (!active || swiped || e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) < SWIPE_PX) return;
      swiped = true;
      if (holdTimer) clearTimeout(holdTimer);
      if (holding) {
        holding = false;
        fire("holdEnd");
      }
      if (Math.abs(dy) > Math.abs(dx)) fire(dy < 0 ? "up" : "down");
      else fire(dx > 0 ? "right" : "left");
    };
    const onUp = (e: PointerEvent) => {
      if (!active || e.pointerId !== pointerId) return;
      active = false;
      if (holdTimer) clearTimeout(holdTimer);
      if (holding) {
        holding = false;
        fire("holdEnd");
        return;
      }
      if (!swiped) {
        const now = performance.now();
        if (now - lastTap < 260) {
          lastTap = 0;
          fire("double");
        } else {
          lastTap = now;
          fire("tap");
        }
      }
    };
    const onCancel = () => {
      active = false;
      if (holdTimer) clearTimeout(holdTimer);
      if (holding) {
        holding = false;
        fire("holdEnd");
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const ui = useUI.getState();
      if (ui.phase === "menu") {
        if (ui.menuView === "main") {
          if (e.code === "Space" || e.code === "Enter") {
            e.preventDefault();
            unlockAudio();
            if (!ui.unlocked.includes(ui.preview)) ui.setPreview(ui.skin);
            engine.startRun();
          } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
            ui.cycleSkin(-1);
            engine.skinPop();
          } else if (e.code === "ArrowRight" || e.code === "KeyD") {
            ui.cycleSkin(1);
            engine.skinPop();
          }
        } else if (e.code === "Escape") ui.setMenuView("main");
        return;
      }
      const map: Record<string, InputAction> = {
        ArrowUp: "up",
        KeyW: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        KeyA: "left",
        ArrowRight: "right",
        KeyD: "right",
        Space: "tap",
        Enter: "tap",
        KeyF: "double",
        KeyS: "cycle",
        KeyN: "nos",
        ShiftLeft: "boost",
        ShiftRight: "boost",
        KeyG: "holdStart",
      };
      const a = map[e.code];
      if (!a) return;
      e.preventDefault();
      fire(a);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyG") fire("holdEnd");
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
    };
  }, [ref]);
}
