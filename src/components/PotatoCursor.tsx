import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, [role="button"], label, summary, input, select, textarea';

export function PotatoCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const ringVisualRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const dotVisualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const ring = ringRef.current;
    const ringVisual = ringVisualRef.current;
    const dot = dotRef.current;
    const dotVisual = dotVisualRef.current;
    if (!ring || !ringVisual || !dot || !dotVisual) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      ringVisual.style.transition = "none";
      dotVisual.style.transition = "none";
    }

    document.documentElement.classList.add("custom-cursor");

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let hover = false;
    let pressed = false;
    let visible = false;
    let frame = 0;

    const render = () => {
      const ringScale = pressed ? 0.82 : hover ? 1.45 : 1;
      const dotScale = pressed ? 1.5 : hover ? 1.15 : 1;
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.opacity = visible ? "1" : "0";
      ringVisual.style.transform = `translate(-50%, -50%) scale(${ringScale})`;
      ringVisual.style.borderColor = hover ? "#6f9a3f" : "#2b1e12";
      ringVisual.style.backgroundColor = hover
        ? "rgba(111, 154, 63, 0.14)"
        : "rgba(255, 250, 240, 0.08)";
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      dot.style.opacity = visible ? "1" : "0";
      dotVisual.style.transform = `translate(-50%, -50%) scale(${dotScale})`;
      dotVisual.style.backgroundColor = hover ? "#6f9a3f" : "#2b1e12";
    };

    const tick = () => {
      frame = 0;
      const dx = targetX - x;
      const dy = targetY - y;
      const ease = reduceMotion ? 1 : 0.32;
      x += dx * ease;
      y += dy * ease;
      render();
      if (visible && (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2)) {
        frame = requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!visible) {
        visible = true;
        x = targetX;
        y = targetY;
      }
      schedule();
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target;
      hover = target instanceof Element && target.closest(INTERACTIVE) !== null;
      schedule();
    };

    const onDown = () => {
      pressed = true;
      schedule();
    };

    const onUp = () => {
      pressed = false;
      schedule();
    };

    const hide = () => {
      visible = false;
      render();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[9999] hidden [@media(pointer:fine)]:block"
    >
      <div ref={ringRef} className="fixed left-0 top-0 opacity-0 transition-opacity duration-150">
        <div
          ref={ringVisualRef}
          className="absolute left-0 top-0 h-6 w-6 rounded-full border-2 border-[#2b1e12] bg-[#fffaf0]/8 shadow-[0_0_0_2px_rgba(255,250,240,0.45)] transition-[transform,border-color,background-color] duration-150 ease-out"
        />
      </div>
      <div ref={dotRef} className="fixed left-0 top-0 opacity-0 transition-opacity duration-150">
        <div
          ref={dotVisualRef}
          className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-[#2b1e12] shadow-[0_0_0_2px_rgba(255,250,240,0.7)] transition-transform duration-150 ease-out"
        />
      </div>
    </div>
  );
}
