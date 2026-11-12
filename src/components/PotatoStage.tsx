import { useEffect, useRef, useState } from "react";

type StyleId = "soft" | "pixel" | "sticker" | "ink";

const STYLES: { id: StyleId; label: string }[] = [
  { id: "soft", label: "Soft" },
  { id: "pixel", label: "Pixel" },
  { id: "sticker", label: "Sticker" },
  { id: "ink", label: "Ink" },
];

type Spot = { x: number; y: number; rx: number; ry: number; rot: number; a: number };

const SPOTS: Spot[] = [
  { x: -0.42, y: -0.08, rx: 0.11, ry: 0.22, rot: 0.55, a: 0.55 },
  { x: 0.34, y: -0.22, rx: 0.1, ry: 0.18, rot: -0.35, a: 0.5 },
  { x: -0.28, y: 0.32, rx: 0.16, ry: 0.22, rot: 0.15, a: 0.48 },
  { x: 0.32, y: 0.22, rx: 0.14, ry: 0.2, rot: -0.45, a: 0.42 },
  { x: -0.52, y: 0.08, rx: 0.07, ry: 0.12, rot: 0.4, a: 0.45 },
  { x: 0.48, y: 0.02, rx: 0.08, ry: 0.13, rot: -0.2, a: 0.4 },
  { x: 0.08, y: -0.46, rx: 0.08, ry: 0.1, rot: 0.1, a: 0.38 },
  { x: -0.06, y: 0.52, rx: 0.09, ry: 0.07, rot: 0.05, a: 0.4 },
  { x: 0.18, y: 0.48, rx: 0.06, ry: 0.09, rot: 0.3, a: 0.35 },
  { x: -0.22, y: -0.38, rx: 0.06, ry: 0.1, rot: -0.4, a: 0.32 },
  { x: 0.42, y: 0.42, rx: 0.05, ry: 0.08, rot: 0.2, a: 0.34 },
  { x: -0.38, y: 0.48, rx: 0.07, ry: 0.05, rot: -0.2, a: 0.3 },
];

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function roundEye(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawSoft(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  anger: number,
  lookX: number,
  lookY: number,
) {
  const skinHi = [mix(232, 210, anger), mix(196, 140, anger), mix(140, 96, anger)];
  const skinMid = [mix(196, 176, anger), mix(148, 104, anger), mix(92, 68, anger)];
  const skinLo = [mix(168, 150, anger), mix(118, 78, anger), mix(68, 48, anger)];

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  const g = ctx.createRadialGradient(cx - r * 0.18, cy - r * 0.28, r * 0.05, cx, cy, r * 1.05);
  g.addColorStop(0, `rgb(${skinHi.map(Math.round).join(",")})`);
  g.addColorStop(0.55, `rgb(${skinMid.map(Math.round).join(",")})`);
  g.addColorStop(1, `rgb(${skinLo.map(Math.round).join(",")})`);
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  for (const s of SPOTS) {
    ctx.save();
    ctx.translate(cx + s.x * r, cy + s.y * r);
    ctx.rotate(s.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, s.rx * r, s.ry * r, 0, 0, Math.PI * 2);
    const spot = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(s.rx, s.ry) * r);
    spot.addColorStop(0, `rgba(120, 72, 36, ${s.a})`);
    spot.addColorStop(1, "rgba(120, 72, 36, 0)");
    ctx.fillStyle = spot;
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(62, 38, 22, 0.72)";
  ctx.lineWidth = Math.max(2, r * 0.028);
  ctx.stroke();

  const ex = lookX * r * 0.05;
  const ey = lookY * r * 0.035;
  const eyeY = cy - r * 0.08 + ey;
  if (anger < 0.4) {
    ctx.fillStyle = "#fff8f0";
    roundEye(ctx, cx - r * 0.26 + ex, eyeY, r * 0.16, r * 0.17);
    roundEye(ctx, cx + r * 0.26 + ex, eyeY, r * 0.16, r * 0.17);
    ctx.fillStyle = "#3a2416";
    ctx.beginPath();
    ctx.arc(cx - r * 0.24 + ex * 1.4, eyeY + r * 0.02, r * 0.075, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.28 + ex * 1.4, eyeY + r * 0.02, r * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - r * 0.215 + ex * 1.4, eyeY - r * 0.01, r * 0.028, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.305 + ex * 1.4, eyeY - r * 0.01, r * 0.028, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (const side of [-1, 1] as const) {
      ctx.save();
      ctx.translate(cx + side * r * 0.26 + ex * 0.5, eyeY);
      ctx.rotate(side * 0.22);
      ctx.fillStyle = "#fff8f0";
      roundEye(ctx, 0, 0, r * 0.15, r * 0.13);
      ctx.fillStyle = "#3a2416";
      ctx.beginPath();
      ctx.ellipse(side * r * 0.02, r * 0.015, r * 0.07, r * 0.055, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.fillStyle = `rgba(232, 120, 96, ${0.28 - anger * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.42, cy + r * 0.12, r * 0.1, r * 0.055, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.42, cy + r * 0.12, r * 0.1, r * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#4a2e1c";
  ctx.lineWidth = Math.max(3, r * 0.04);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy + r * 0.32);
  ctx.quadraticCurveTo(cx, cy + r * (0.39 + anger * 0.05), cx + r * 0.2, cy + r * 0.32);
  ctx.stroke();
}

function drawPixel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  anger: number,
  lookX: number,
  lookY: number,
) {
  const u = Math.max(3, Math.round(r / 11));
  const skin = anger > 0.4 ? "#e07a4a" : "#d4a05a";
  const spot = "#a56b32";
  ctx.fillStyle = skin;
  for (let y = -r; y <= r; y += u) {
    for (let x = -r; x <= r; x += u) {
      if (x * x + y * y <= (r - u * 0.2) * (r - u * 0.2)) ctx.fillRect(cx + x, cy + y, u, u);
    }
  }
  ctx.fillStyle = spot;
  const blobs = [
    [-0.35, 0.1],
    [0.4, -0.15],
    [-0.15, 0.42],
    [0.25, 0.35],
  ];
  for (const [bx, by] of blobs) {
    ctx.fillRect(cx + bx * r, cy + by * r, u * 2, u * 2);
  }
  const ox = Math.round(lookX) * u;
  const oy = Math.round(lookY * 0.4) * u;
  ctx.fillStyle = "#1a120c";
  if (anger < 0.4) {
    ctx.fillRect(cx - r * 0.38 + ox, cy - r * 0.12 + oy, u * 2, u * 2);
    ctx.fillRect(cx + r * 0.12 + ox, cy - r * 0.12 + oy, u * 2, u * 2);
  } else {
    ctx.fillRect(cx - r * 0.42, cy - r * 0.22, u * 3, u);
    ctx.fillRect(cx + r * 0.08, cy - r * 0.22, u * 3, u);
    ctx.fillRect(cx - r * 0.32, cy - r * 0.08, u * 2, u);
    ctx.fillRect(cx + r * 0.14, cy - r * 0.08, u * 2, u);
  }
  ctx.fillRect(cx - r * 0.28, cy + r * 0.28 + (anger > 0.4 ? u : 0), u * 5, u);
  ctx.fillRect(cx - r * 0.32, cy + r * 0.18, u, u);
  ctx.fillRect(cx + r * 0.22, cy + r * 0.18, u, u);
}

function drawSticker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  anger: number,
  lookX: number,
  lookY: number,
) {
  ctx.save();
  ctx.translate(4, 6);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(40, 24, 12, 0.18)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = anger > 0.4 ? "#f08a62" : "#f2c27a";
  ctx.fill();
  ctx.lineWidth = Math.max(4, r * 0.07);
  ctx.strokeStyle = "#2b1a10";
  ctx.stroke();

  ctx.fillStyle = anger > 0.4 ? "#d56a48" : "#e0a45a";
  ctx.beginPath();
  ctx.arc(cx - r * 0.35, cy + r * 0.15, r * 0.16, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.38, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  const ex = lookX * r * 0.04;
  const eyeY = cy - r * 0.06;
  ctx.fillStyle = "#2b1a10";
  if (anger < 0.4) {
    ctx.beginPath();
    ctx.arc(cx - r * 0.24 + ex, eyeY, r * 0.09, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.24 + ex, eyeY, r * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - r * 0.21 + ex, eyeY - r * 0.03, r * 0.03, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.27 + ex, eyeY - r * 0.03, r * 0.03, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = Math.max(3, r * 0.06);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.38, eyeY - r * 0.06);
    ctx.lineTo(cx - r * 0.1, eyeY + r * 0.02);
    ctx.moveTo(cx + r * 0.38, eyeY - r * 0.06);
    ctx.lineTo(cx + r * 0.1, eyeY + r * 0.02);
    ctx.stroke();
  }

  ctx.strokeStyle = "#2b1a10";
  ctx.lineWidth = Math.max(3, r * 0.055);
  ctx.lineCap = "round";
  ctx.beginPath();
  if (anger < 0.4) {
    ctx.arc(cx, cy + r * 0.08, r * 0.22, 0.25 * Math.PI, 0.75 * Math.PI);
  } else {
    ctx.moveTo(cx - r * 0.22, cy + r * 0.28);
    ctx.quadraticCurveTo(cx, cy + r * 0.42, cx + r * 0.22, cy + r * 0.28);
  }
  ctx.stroke();
}

function wobble(seed: number) {
  return Math.sin(seed * 12.3) * 0.012 + Math.sin(seed * 4.1) * 0.008;
}

function drawInk(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  anger: number,
  lookX: number,
  lookY: number,
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const rr = r * (1 + wobble(i + cx * 0.01));
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = anger > 0.4 ? "#f3d2b0" : "#f6e7cf";
  ctx.fill();
  ctx.strokeStyle = "#2a2118";
  ctx.lineWidth = Math.max(1.5, r * 0.018);
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.3, cy + r * 0.2, r * 0.16, r * 0.22, 0.4, 0, Math.PI * 2);
  ctx.ellipse(cx + r * 0.32, cy - r * 0.05, r * 0.12, r * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#c4a070";
  ctx.fill();
  ctx.globalAlpha = 1;

  const eyeY = cy - r * 0.05 + lookY * r * 0.02;
  const ex = lookX * r * 0.03;
  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = Math.max(1.6, r * 0.02);
  ctx.lineCap = "round";
  if (anger < 0.4) {
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.24 + ex, eyeY, r * 0.09, r * 0.07, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + r * 0.24 + ex, eyeY, r * 0.09, r * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#24180f";
    ctx.beginPath();
    ctx.arc(cx - r * 0.22 + ex, eyeY, r * 0.03, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.26 + ex, eyeY, r * 0.03, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.36, eyeY - r * 0.04);
    ctx.quadraticCurveTo(cx - r * 0.22, eyeY + r * 0.06, cx - r * 0.08, eyeY - r * 0.02);
    ctx.moveTo(cx + r * 0.36, eyeY - r * 0.04);
    ctx.quadraticCurveTo(cx + r * 0.22, eyeY + r * 0.06, cx + r * 0.08, eyeY - r * 0.02);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx - r * 0.2, cy + r * 0.28);
  ctx.quadraticCurveTo(cx, cy + r * (0.34 + anger * 0.08), cx + r * 0.2, cy + r * 0.28);
  ctx.stroke();
  ctx.restore();
}

const DRAW: Record<StyleId, typeof drawSoft> = {
  soft: drawSoft,
  pixel: drawPixel,
  sticker: drawSticker,
  ink: drawInk,
};

const BACKGROUNDS: Record<StyleId, [string, string]> = {
  soft: ["#5a3a28", "#2a1a12"],
  pixel: ["#3d6b4f", "#1e3a2a"],
  sticker: ["#fff6e8", "#f0dcc0"],
  ink: ["#f7f1e6", "#e7dcc8"],
};

export function PotatoStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const styleRef = useRef<StyleId>("soft");
  const [style, setStyle] = useState<StyleId>("soft");
  const state = useRef({
    w: 0,
    h: 0,
    mouseX: 0,
    mouseY: 0,
    littleX: 0,
    littleY: 0,
    anger: 0,
    flash: 0,
    lookX: 0,
    lookY: 0,
    ready: false,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; s: number; c: string }[],
  });

  const pick = (id: StyleId) => {
    styleRef.current = id;
    setStyle(id);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const st = state.current;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      st.w = window.innerWidth;
      st.h = window.innerHeight;
      canvas.width = Math.floor(st.w * dpr);
      canvas.height = Math.floor(st.h * dpr);
      canvas.style.width = `${st.w}px`;
      canvas.style.height = `${st.h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!st.ready) {
        st.littleX = st.w * 0.28;
        st.littleY = st.h * 0.48;
        st.mouseX = st.littleX;
        st.mouseY = st.littleY;
        st.ready = true;
      }
    };

    const poke = () => {
      const faceX = st.w / 2;
      const faceY = Math.min(st.h * 0.46, 340);
      const r = Math.min(170, st.w * 0.22, st.h * 0.26);
      const dx = st.littleX - faceX;
      const dy = st.littleY - faceY;
      if (Math.hypot(dx, dy) > r + 70) return;
      st.anger = 1;
      st.flash = 1;
      const ang = Math.atan2(dy, dx) || 0;
      st.littleX += Math.cos(ang) * 22;
      st.littleY += Math.sin(ang) * 22;
      for (let i = 0; i < 22; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 6;
        st.particles.push({
          x: st.littleX,
          y: st.littleY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.5,
          life: 1,
          s: 3 + Math.random() * 5,
          c: Math.random() > 0.5 ? "#c48a4a" : "#efe0c4",
        });
      }
    };

    const fromUi = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("[data-ui]"));

    const mm = (e: MouseEvent) => {
      st.mouseX = e.clientX;
      st.mouseY = e.clientY;
    };
    const md = (e: MouseEvent) => {
      if (fromUi(e.target)) return;
      st.mouseX = e.clientX;
      st.mouseY = e.clientY;
      poke();
    };
    const ts = (e: TouchEvent) => {
      if (fromUi(e.target)) return;
      const t = e.touches[0];
      if (!t) return;
      st.mouseX = t.clientX;
      st.mouseY = t.clientY;
      poke();
    };
    const tm = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      e.preventDefault();
      st.mouseX = t.clientX;
      st.mouseY = t.clientY;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", mm);
    window.addEventListener("mousedown", md);
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchmove", tm, { passive: false });

    const loop = () => {
      const w = st.w;
      const h = st.h;
      const look = styleRef.current;
      const draw = DRAW[look];
      const [c0, c1] = BACKGROUNDS[look];
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(w / 2, h * 0.35, 40, w / 2, h * 0.45, Math.max(w, h) * 0.72);
      bg.addColorStop(0, c0);
      bg.addColorStop(1, c1);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      const faceX = w / 2;
      const faceY = Math.min(h * 0.46, 340);
      const r = Math.min(170, w * 0.22, h * 0.26);

      st.littleX += (st.mouseX - st.littleX) * 0.16;
      st.littleY += (st.mouseY - st.littleY) * 0.16;
      const dx = st.littleX - faceX;
      const dy = st.littleY - faceY;
      const dist = Math.hypot(dx, dy) || 1;
      st.lookX += (dx / dist - st.lookX) * 0.12;
      st.lookY += (dy / dist - st.lookY) * 0.12;
      st.anger *= 0.985;
      if (st.anger < 0.012) st.anger = 0;
      st.flash *= 0.9;

      const ink = look === "ink" || look === "sticker";
      ctx.fillStyle = ink ? "#6b5344" : "#3a2618";
      ctx.fillRect(faceX - (look === "pixel" ? 8 : 11), 0, look === "pixel" ? 16 : 22, faceY - r + 2);

      draw(ctx, faceX, faceY, r, st.anger, st.lookX, st.lookY);

      if (st.flash > 0.05) {
        ctx.beginPath();
        ctx.arc(faceX, faceY, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${st.flash * 0.28})`;
        ctx.fill();
      }

      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16;
        p.life -= 0.018;
        if (p.life <= 0) {
          st.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x, p.y, p.s, p.s);
        ctx.globalAlpha = 1;
      }

      draw(ctx, st.littleX, st.littleY, 22, 0, 0, 0);

      const hint = ink ? "rgba(60,40,24,0.55)" : "rgba(255,236,214,0.7)";
      ctx.fillStyle = hint;
      ctx.font = "14px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Move the little potato · click near him to poke", w / 2, h - 22);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("touchstart", ts);
      window.removeEventListener("touchmove", tm);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" aria-label="Hanging potato you can poke" />
      <div
        data-ui
        className="absolute top-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 p-1.5 backdrop-blur-sm"
      >
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            data-ui
            onClick={() => pick(s.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              style === s.id ? "bg-white text-[#2a1a12]" : "text-white/90"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
