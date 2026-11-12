import { useEffect, useRef, useState } from "react";

type StyleId = "soft" | "pixel" | "sticker" | "ink";

const STYLE_OPTIONS: Array<{ id: StyleId; label: string }> = [
  { id: "soft", label: "Soft" },
  { id: "pixel", label: "Pixel" },
  { id: "sticker", label: "Sticker" },
  { id: "ink", label: "Ink" },
];

const BACKGROUNDS: Record<StyleId, [string, string]> = {
  soft: ["#5a3a28", "#2a1a12"],
  pixel: ["#3d6b4f", "#1e3a2a"],
  sticker: ["#fff6e8", "#f0dcc0"],
  ink: ["#f7f1e6", "#e7dcc8"],
};

const SPOTS = [
  { x: -0.42, y: -0.08, rx: 0.11, ry: 0.22, rot: 0.55, alpha: 0.55 },
  { x: 0.34, y: -0.22, rx: 0.1, ry: 0.18, rot: -0.35, alpha: 0.5 },
  { x: -0.28, y: 0.32, rx: 0.16, ry: 0.22, rot: 0.15, alpha: 0.48 },
  { x: 0.32, y: 0.22, rx: 0.14, ry: 0.2, rot: -0.45, alpha: 0.42 },
  { x: -0.52, y: 0.08, rx: 0.07, ry: 0.12, rot: 0.4, alpha: 0.45 },
  { x: 0.48, y: 0.02, rx: 0.08, ry: 0.13, rot: -0.2, alpha: 0.4 },
  { x: 0.08, y: -0.46, rx: 0.08, ry: 0.1, rot: 0.1, alpha: 0.38 },
  { x: -0.06, y: 0.52, rx: 0.09, ry: 0.07, rot: 0.05, alpha: 0.4 },
  { x: 0.18, y: 0.48, rx: 0.06, ry: 0.09, rot: 0.3, alpha: 0.35 },
  { x: -0.22, y: -0.38, rx: 0.06, ry: 0.1, rot: -0.4, alpha: 0.32 },
  { x: 0.42, y: 0.42, rx: 0.05, ry: 0.08, rot: 0.2, alpha: 0.34 },
  { x: -0.38, y: 0.48, rx: 0.07, ry: 0.05, rot: -0.2, alpha: 0.3 },
];

const LITTLE_RADIUS = 22;
const MAX_PARTICLES = 80;
const MAX_DPR = 3;
const POKE_REACH = 70;

type Rgb = [number, number, number];

const CALM_COLORS: Rgb[] = [
  [232, 196, 140],
  [196, 148, 92],
  [168, 118, 68],
];
const ANGRY_COLORS: Rgb[] = [
  [210, 140, 96],
  [176, 104, 68],
  [150, 78, 48],
];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
};

type StageState = {
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  littleX: number;
  littleY: number;
  anger: number;
  flash: number;
  lookX: number;
  lookY: number;
  ready: boolean;
  particles: Particle[];
};

type PotatoStyle = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  anger: number,
  lookX: number,
  lookY: number,
) => void;

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function mixRgb(from: Rgb, to: Rgb, t: number): Rgb {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)];
}

function rgb(color: Rgb) {
  return `rgb(${color.map(Math.round).join(",")})`;
}

function fillEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

const drawSoft: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY) => {
  const top = mixRgb(CALM_COLORS[0], ANGRY_COLORS[0], anger);
  const middle = mixRgb(CALM_COLORS[1], ANGRY_COLORS[1], anger);
  const bottom = mixRgb(CALM_COLORS[2], ANGRY_COLORS[2], anger);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const skin = ctx.createRadialGradient(
    cx - radius * 0.18,
    cy - radius * 0.28,
    radius * 0.05,
    cx,
    cy,
    radius * 1.05,
  );
  skin.addColorStop(0, rgb(top));
  skin.addColorStop(0.55, rgb(middle));
  skin.addColorStop(1, rgb(bottom));
  ctx.fillStyle = skin;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  for (const spot of SPOTS) {
    ctx.save();
    ctx.translate(cx + spot.x * radius, cy + spot.y * radius);
    ctx.rotate(spot.rot);
    const shade = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(spot.rx, spot.ry) * radius);
    shade.addColorStop(0, `rgba(120, 72, 36, ${spot.alpha})`);
    shade.addColorStop(1, "rgba(120, 72, 36, 0)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(0, 0, spot.rx * radius, spot.ry * radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1.2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(62, 38, 22, 0.72)";
  ctx.lineWidth = Math.max(2, radius * 0.028);
  ctx.stroke();

  const eyeShiftX = lookX * radius * 0.05;
  const eyeShiftY = lookY * radius * 0.035;
  const eyeY = cy - radius * 0.08 + eyeShiftY;

  if (anger < 0.4) {
    ctx.fillStyle = "#fff8f0";
    fillEllipse(ctx, cx - radius * 0.26 + eyeShiftX, eyeY, radius * 0.16, radius * 0.17);
    fillEllipse(ctx, cx + radius * 0.26 + eyeShiftX, eyeY, radius * 0.16, radius * 0.17);

    ctx.fillStyle = "#3a2416";
    ctx.beginPath();
    ctx.arc(
      cx - radius * 0.24 + eyeShiftX * 1.4,
      eyeY + radius * 0.02,
      radius * 0.075,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      cx + radius * 0.28 + eyeShiftX * 1.4,
      eyeY + radius * 0.02,
      radius * 0.075,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(
      cx - radius * 0.215 + eyeShiftX * 1.4,
      eyeY - radius * 0.01,
      radius * 0.028,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      cx + radius * 0.305 + eyeShiftX * 1.4,
      eyeY - radius * 0.01,
      radius * 0.028,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  } else {
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(cx + side * radius * 0.26 + eyeShiftX * 0.5, eyeY);
      ctx.rotate(side * 0.22);
      ctx.fillStyle = "#fff8f0";
      fillEllipse(ctx, 0, 0, radius * 0.15, radius * 0.13);
      ctx.fillStyle = "#3a2416";
      ctx.beginPath();
      ctx.ellipse(
        side * radius * 0.02,
        radius * 0.015,
        radius * 0.07,
        radius * 0.055,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.fillStyle = `rgba(232, 120, 96, ${0.28 - anger * 0.08})`;
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.42,
    cy + radius * 0.12,
    radius * 0.1,
    radius * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    cx + radius * 0.42,
    cy + radius * 0.12,
    radius * 0.1,
    radius * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.strokeStyle = "#4a2e1c";
  ctx.lineWidth = Math.max(3, radius * 0.04);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.2, cy + radius * 0.32);
  ctx.quadraticCurveTo(
    cx,
    cy + radius * (0.39 + anger * 0.05),
    cx + radius * 0.2,
    cy + radius * 0.32,
  );
  ctx.stroke();
};

const drawPixel: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY) => {
  const block = Math.max(3, Math.round(radius / 11));

  ctx.fillStyle = anger > 0.4 ? "#e07a4a" : "#d4a05a";
  for (let y = -radius; y <= radius; y += block) {
    for (let x = -radius; x <= radius; x += block) {
      if (x * x + y * y <= (radius - block * 0.2) * (radius - block * 0.2)) {
        ctx.fillRect(cx + x, cy + y, block, block);
      }
    }
  }

  ctx.fillStyle = "#a56b32";
  for (const [x, y] of [
    [-0.35, 0.1],
    [0.4, -0.15],
    [-0.15, 0.42],
    [0.25, 0.35],
  ]) {
    ctx.fillRect(cx + x * radius, cy + y * radius, block * 2, block * 2);
  }

  const shiftX = Math.round(lookX) * block;
  const shiftY = Math.round(lookY * 0.4) * block;
  ctx.fillStyle = "#1a120c";

  if (anger < 0.4) {
    ctx.fillRect(cx - radius * 0.38 + shiftX, cy - radius * 0.12 + shiftY, block * 2, block * 2);
    ctx.fillRect(cx + radius * 0.12 + shiftX, cy - radius * 0.12 + shiftY, block * 2, block * 2);
  } else {
    ctx.fillRect(cx - radius * 0.42, cy - radius * 0.22, block * 3, block);
    ctx.fillRect(cx + radius * 0.08, cy - radius * 0.22, block * 3, block);
    ctx.fillRect(cx - radius * 0.32, cy - radius * 0.08, block * 2, block);
    ctx.fillRect(cx + radius * 0.14, cy - radius * 0.08, block * 2, block);
  }

  ctx.fillRect(
    cx - radius * 0.28,
    cy + radius * 0.28 + (anger > 0.4 ? block : 0),
    block * 5,
    block,
  );
  ctx.fillRect(cx - radius * 0.32, cy + radius * 0.18, block, block);
  ctx.fillRect(cx + radius * 0.22, cy + radius * 0.18, block, block);
};

const drawSticker: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, _lookY) => {
  ctx.save();
  ctx.translate(4, 6);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(40, 24, 12, 0.18)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = anger > 0.4 ? "#f08a62" : "#f2c27a";
  ctx.fill();
  ctx.lineWidth = Math.max(4, radius * 0.07);
  ctx.strokeStyle = "#2b1a10";
  ctx.stroke();

  ctx.fillStyle = anger > 0.4 ? "#d56a48" : "#e0a45a";
  ctx.beginPath();
  ctx.arc(cx - radius * 0.35, cy + radius * 0.15, radius * 0.16, 0, Math.PI * 2);
  ctx.arc(cx + radius * 0.38, cy - radius * 0.1, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();

  const shiftX = lookX * radius * 0.04;
  const eyeY = cy - radius * 0.06;

  if (anger < 0.4) {
    ctx.fillStyle = "#2b1a10";
    ctx.beginPath();
    ctx.arc(cx - radius * 0.24 + shiftX, eyeY, radius * 0.09, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.24 + shiftX, eyeY, radius * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - radius * 0.21 + shiftX, eyeY - radius * 0.03, radius * 0.03, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.27 + shiftX, eyeY - radius * 0.03, radius * 0.03, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.lineWidth = Math.max(3, radius * 0.06);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.38, eyeY - radius * 0.06);
    ctx.lineTo(cx - radius * 0.1, eyeY + radius * 0.02);
    ctx.moveTo(cx + radius * 0.38, eyeY - radius * 0.06);
    ctx.lineTo(cx + radius * 0.1, eyeY + radius * 0.02);
    ctx.stroke();
  }

  ctx.strokeStyle = "#2b1a10";
  ctx.lineWidth = Math.max(3, radius * 0.055);
  ctx.lineCap = "round";
  ctx.beginPath();
  if (anger < 0.4) {
    ctx.arc(cx, cy + radius * 0.08, radius * 0.22, Math.PI * 0.25, Math.PI * 0.75);
  } else {
    ctx.moveTo(cx - radius * 0.22, cy + radius * 0.28);
    ctx.quadraticCurveTo(cx, cy + radius * 0.42, cx + radius * 0.22, cy + radius * 0.28);
  }
  ctx.stroke();
};

function inkWobble(angle: number) {
  return Math.sin(angle * 12.3) * 0.012 + Math.sin(angle * 4.1) * 0.008;
}

const drawInk: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY) => {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const edge = radius * (1 + inkWobble(i + cx * 0.01));
    const x = cx + Math.cos(angle) * edge;
    const y = cy + Math.sin(angle) * edge;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = anger > 0.4 ? "#f3d2b0" : "#f6e7cf";
  ctx.fill();
  ctx.strokeStyle = "#2a2118";
  ctx.lineWidth = Math.max(1.5, radius * 0.018);
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.3,
    cy + radius * 0.2,
    radius * 0.16,
    radius * 0.22,
    0.4,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    cx + radius * 0.32,
    cy - radius * 0.05,
    radius * 0.12,
    radius * 0.18,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#c4a070";
  ctx.fill();
  ctx.globalAlpha = 1;

  const eyeShiftX = lookX * radius * 0.03;
  const eyeY = cy - radius * 0.05 + lookY * radius * 0.02;

  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = Math.max(1.6, radius * 0.02);
  ctx.lineCap = "round";

  if (anger < 0.4) {
    ctx.beginPath();
    ctx.ellipse(
      cx - radius * 0.24 + eyeShiftX,
      eyeY,
      radius * 0.09,
      radius * 0.07,
      0,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      cx + radius * 0.24 + eyeShiftX,
      eyeY,
      radius * 0.09,
      radius * 0.07,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    ctx.fillStyle = "#24180f";
    ctx.beginPath();
    ctx.arc(cx - radius * 0.22 + eyeShiftX, eyeY, radius * 0.03, 0, Math.PI * 2);
    ctx.arc(cx + radius * 0.26 + eyeShiftX, eyeY, radius * 0.03, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.36, eyeY - radius * 0.04);
    ctx.quadraticCurveTo(
      cx - radius * 0.22,
      eyeY + radius * 0.06,
      cx - radius * 0.08,
      eyeY - radius * 0.02,
    );
    ctx.moveTo(cx + radius * 0.36, eyeY - radius * 0.04);
    ctx.quadraticCurveTo(
      cx + radius * 0.22,
      eyeY + radius * 0.06,
      cx + radius * 0.08,
      eyeY - radius * 0.02,
    );
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.2, cy + radius * 0.28);
  ctx.quadraticCurveTo(
    cx,
    cy + radius * (0.34 + anger * 0.08),
    cx + radius * 0.2,
    cy + radius * 0.28,
  );
  ctx.stroke();
  ctx.restore();
};

const POTATO_STYLES: Record<StyleId, PotatoStyle> = {
  soft: drawSoft,
  pixel: drawPixel,
  sticker: drawSticker,
  ink: drawInk,
};

function isUiTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest("[data-ui]") !== null;
}

function clampLittle(state: StageState) {
  state.littleX = Math.min(
    Math.max(LITTLE_RADIUS, state.width - LITTLE_RADIUS),
    Math.max(LITTLE_RADIUS, state.littleX),
  );
  state.littleY = Math.min(
    Math.max(LITTLE_RADIUS, state.height - LITTLE_RADIUS),
    Math.max(LITTLE_RADIUS, state.littleY),
  );
}

function vibrate() {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(15);
  }
}

export function PotatoStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const styleRef = useRef<StyleId>("soft");
  const [style, setStyle] = useState<StyleId>("soft");

  const chooseStyle = (next: StyleId) => {
    styleRef.current = next;
    setStyle(next);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state: StageState = {
      width: 0,
      height: 0,
      mouseX: 0,
      mouseY: 0,
      littleX: 0,
      littleY: 0,
      anger: 0,
      flash: 0,
      lookX: 0,
      lookY: 0,
      ready: false,
      particles: [],
    };

    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      state.width = Math.max(1, Math.round(rect.width));
      state.height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.floor(state.width * dpr);
      canvas.height = Math.floor(state.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!state.ready) {
        state.littleX = state.width * 0.28;
        state.littleY = state.height * 0.48;
        state.mouseX = state.littleX;
        state.mouseY = state.littleY;
        state.ready = true;
      }
    };

    const poke = () => {
      const centerX = state.width / 2;
      const centerY = Math.min(state.height * 0.46, 340);
      const radius = Math.min(170, state.width * 0.22, state.height * 0.26);
      const dx = state.littleX - centerX;
      const dy = state.littleY - centerY;
      if (Math.hypot(dx, dy) > radius + POKE_REACH) return;

      state.anger = 1;
      state.flash = 1;
      vibrate();

      const angle = Math.atan2(dy, dx) || 0;
      state.littleX += Math.cos(angle) * 22;
      state.littleY += Math.sin(angle) * 22;
      clampLittle(state);

      const count = Math.min(22, MAX_PARTICLES - state.particles.length);
      for (let i = 0; i < count; i++) {
        const direction = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        state.particles.push({
          x: state.littleX,
          y: state.littleY,
          vx: Math.cos(direction) * speed,
          vy: Math.sin(direction) * speed - 1.5,
          life: 1,
          size: 3 + Math.random() * 5,
          color: Math.random() > 0.5 ? "#c48a4a" : "#efe0c4",
        });
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      state.mouseX = event.clientX;
      state.mouseY = event.clientY;
    };

    const onMouseDown = (event: MouseEvent) => {
      if (isUiTarget(event.target)) return;
      state.mouseX = event.clientX;
      state.mouseY = event.clientY;
      poke();
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isUiTarget(event.target)) return;
      const touch = event.touches[0];
      if (!touch) return;
      state.mouseX = touch.clientX;
      state.mouseY = touch.clientY;
      poke();
    };

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      event.preventDefault();
      state.mouseX = touch.clientX;
      state.mouseY = touch.clientY;
    };

    resize();

    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(canvas);
    window.addEventListener("resize", resize);
    window.visualViewport?.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    const render = () => {
      const { width, height } = state;
      const currentStyle = styleRef.current;
      const drawPotato = POTATO_STYLES[currentStyle];
      const [backgroundTop, backgroundBottom] = BACKGROUNDS[currentStyle];
      const paper = currentStyle === "ink" || currentStyle === "sticker";

      ctx.clearRect(0, 0, width, height);

      const backdrop = ctx.createRadialGradient(
        width / 2,
        height * 0.35,
        40,
        width / 2,
        height * 0.45,
        Math.max(width, height) * 0.72,
      );
      backdrop.addColorStop(0, backgroundTop);
      backdrop.addColorStop(1, backgroundBottom);
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = Math.min(height * 0.46, 340);
      const radius = Math.min(170, width * 0.22, height * 0.26);

      state.littleX += (state.mouseX - state.littleX) * 0.16;
      state.littleY += (state.mouseY - state.littleY) * 0.16;
      clampLittle(state);

      const dx = state.littleX - centerX;
      const dy = state.littleY - centerY;
      const distance = Math.hypot(dx, dy) || 1;
      state.lookX += (dx / distance - state.lookX) * 0.12;
      state.lookY += (dy / distance - state.lookY) * 0.12;

      state.anger *= 0.985;
      if (state.anger < 0.012) state.anger = 0;
      state.flash *= 0.9;

      const ropeWidth = currentStyle === "pixel" ? 16 : 22;
      ctx.fillStyle = paper ? "#6b5344" : "#3a2618";
      ctx.fillRect(centerX - ropeWidth / 2, 0, ropeWidth, centerY - radius + 2);

      drawPotato(ctx, centerX, centerY, radius, state.anger, state.lookX, state.lookY);

      if (state.flash > 0.05) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.28})`;
        ctx.fill();
      }

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const particle = state.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.16;
        particle.life -= 0.018;
        if (particle.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        ctx.globalAlpha = 1;
      }

      drawPotato(ctx, state.littleX, state.littleY, LITTLE_RADIUS, 0, 0, 0);

      frame = requestAnimationFrame(render);
    };

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      window.visualViewport?.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const hintColor =
    style === "ink" || style === "sticker" ? "rgba(60, 40, 24, 0.65)" : "rgba(255, 236, 214, 0.78)";

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none"
        aria-label="A big potato hanging from a string. Move the little potato near it and poke it."
        role="img"
      />

      <div
        data-ui
        className="absolute left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 p-1.5 backdrop-blur-sm"
        style={{ top: "calc(0.75rem + env(safe-area-inset-top))" }}
      >
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            data-ui
            onClick={() => chooseStyle(option.id)}
            aria-pressed={style === option.id}
            className={`min-h-11 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              style === option.id
                ? "bg-white text-[#2a1a12] shadow-sm"
                : "text-white/90 hover:bg-white/10"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-sm"
        style={{ color: hintColor }}
      >
        Move the little potato · <span className="inline pointer-coarse:hidden">click</span>
        <span className="hidden pointer-coarse:inline">tap</span> near him to poke
      </p>
    </div>
  );
}
