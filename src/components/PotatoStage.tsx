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

const FRECKLES = [
  { x: -0.36, y: 0.14, r: 0.016 },
  { x: -0.28, y: 0.07, r: 0.011 },
  { x: -0.2, y: 0.2, r: 0.013 },
  { x: 0.34, y: 0.13, r: 0.015 },
  { x: 0.27, y: 0.21, r: 0.01 },
  { x: 0.41, y: 0.05, r: 0.011 },
  { x: -0.44, y: -0.22, r: 0.012 },
  { x: 0.12, y: 0.36, r: 0.011 },
];

const LITTLE_RADIUS = 22;
const MAX_PARTICLES = 80;
const MAX_DPR = 3;
const POKE_REACH = 70;

const MOOD_LABELS = ["Calm", "Wary", "Annoyed", "Furious", "Meltdown"] as const;
const MOOD_COLORS = [
  "bg-[#9ed37a]",
  "bg-[#9ed37a]",
  "bg-[#f0c96a]",
  "bg-[#e8896a]",
  "bg-[#e45c4c]",
];
const RAPID_POKE_MS = 1800;
const PATIENCE_SEGMENTS = 5;

const REACTIONS = [
  ["eep!", "hey!", "boing!"],
  ["hey!", "watch it!", "oh!"],
  ["ow!", "rude!", "hmph!"],
  ["stop it!", "grr!", "enough!"],
  ["MELTDOWN!", "I'm a potato!", "no more!"],
];

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
  gravity?: number;
};

type Mote = {
  x: number;
  y: number;
  r: number;
  drift: number;
  phase: number;
};

type Bubble = {
  x: number;
  y: number;
  life: number;
  text: string;
};

type BlinkTrack = {
  start: number;
  len: number;
  nextAt: number;
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
  bubbles: Bubble[];
  motes: Mote[];
  blink: BlinkTrack;
  littleBlink: BlinkTrack;
};

type PotatoStyle = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  anger: number,
  lookX: number,
  lookY: number,
  time: number,
  blink: number,
) => void;

function updateBlink(track: BlinkTrack, now: number) {
  if (now >= track.nextAt) {
    track.start = now;
    track.len = 120 + Math.random() * 90;
    track.nextAt = now + track.len + 2400 + Math.random() * 3600;
  }
  const progress = (now - track.start) / track.len;
  if (progress < 0 || progress > 1) return 0;
  return Math.sin(progress * Math.PI);
}

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

function potatoPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
) {
  const points = 44;
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const lump =
      1 +
      Math.sin(angle * 3 + seed) * 0.03 +
      Math.sin(angle * 5 - seed * 1.6) * 0.018 +
      Math.sin(angle * 2 + 0.7) * 0.02;
    const x = cx + Math.cos(angle) * radius * 0.96 * lump;
    const y = cy + Math.sin(angle) * radius * 1.02 * lump;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawSprout(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  variant: StyleId,
  time: number,
) {
  const sway = Math.sin(time * 0.0016) * 0.07;
  const stemHeight = radius * 0.32;
  const leafW = radius * 0.24;
  const leafH = radius * 0.125;

  const palette =
    variant === "ink"
      ? { leaf: "#d3e2ac", shade: "#aec48d", stem: "#4a5a36", line: "#2a2118" }
      : variant === "pixel"
        ? { leaf: "#7fb057", shade: "#5f8f42", stem: "#4d7a39", line: "#2f4a26" }
        : { leaf: "#8cc45f", shade: "#5f9444", stem: "#4d7a39", line: "#33502a" };

  ctx.save();
  ctx.translate(cx + radius * 0.12, cy - radius * 0.88);
  ctx.rotate(-0.16 + sway);

  ctx.lineCap = "round";
  ctx.strokeStyle = palette.stem;
  ctx.lineWidth = Math.max(2, radius * 0.032);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(radius * 0.05, -stemHeight * 0.55, radius * 0.02, -stemHeight);
  ctx.stroke();

  const drawLeaf = (side: number, scale: number) => {
    ctx.save();
    ctx.translate(radius * 0.02, -stemHeight);
    ctx.rotate(side * (0.55 + sway * 0.4));
    ctx.beginPath();
    ctx.ellipse(
      side * leafW * 0.62 * scale,
      -leafH * 0.35 * scale,
      leafW * scale,
      leafH * scale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = palette.leaf;
    ctx.fill();
    if (variant !== "soft") {
      ctx.strokeStyle = palette.line;
      ctx.lineWidth =
        variant === "sticker" ? Math.max(2.5, radius * 0.04) : Math.max(1.4, radius * 0.018);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(side * leafW * 0.2 * scale, -leafH * 0.35 * scale);
    ctx.quadraticCurveTo(
      side * leafW * 0.7 * scale,
      -leafH * 0.4 * scale,
      side * leafW * 1.12 * scale,
      -leafH * 0.32 * scale,
    );
    ctx.strokeStyle = palette.shade;
    ctx.lineWidth = Math.max(1, radius * 0.012);
    ctx.stroke();
    ctx.restore();
  };

  drawLeaf(-1, 1);
  drawLeaf(1, 0.82);
  ctx.restore();
}

const drawSoft: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY, time, blink) => {
  const top = mixRgb(CALM_COLORS[0], ANGRY_COLORS[0], anger);
  const middle = mixRgb(CALM_COLORS[1], ANGRY_COLORS[1], anger);
  const bottom = mixRgb(CALM_COLORS[2], ANGRY_COLORS[2], anger);

  ctx.save();
  potatoPath(ctx, cx, cy, radius, 0.7);
  ctx.shadowColor = "rgba(24, 12, 4, 0.4)";
  ctx.shadowBlur = radius * 0.24;
  ctx.shadowOffsetY = radius * 0.08;
  ctx.fillStyle = "rgba(28, 15, 7, 0.8)";
  ctx.fill();
  ctx.restore();

  ctx.save();
  potatoPath(ctx, cx, cy, radius, 0.7);
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
    shade.addColorStop(0, `rgba(120, 72, 36, ${spot.alpha * 0.5})`);
    shade.addColorStop(1, "rgba(120, 72, 36, 0)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.ellipse(0, 0, spot.rx * radius, spot.ry * radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const freckle of FRECKLES) {
    ctx.fillStyle = "rgba(92, 54, 26, 0.34)";
    fillEllipse(
      ctx,
      cx + freckle.x * radius,
      cy + freckle.y * radius,
      freckle.r * radius,
      freckle.r * radius * 0.86,
    );
  }

  const sheen = ctx.createRadialGradient(
    cx - radius * 0.44,
    cy - radius * 0.5,
    radius * 0.02,
    cx - radius * 0.3,
    cy - radius * 0.36,
    radius * 0.95,
  );
  sheen.addColorStop(0, "rgba(255, 246, 224, 0.3)");
  sheen.addColorStop(0.5, "rgba(255, 238, 205, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();

  potatoPath(ctx, cx, cy, radius, 0.7);
  ctx.strokeStyle = "rgba(62, 38, 22, 0.72)";
  ctx.lineWidth = Math.max(2, radius * 0.028);
  ctx.stroke();

  const eyeShiftX = lookX * radius * 0.045;
  const eyeShiftY = lookY * radius * 0.03;
  const eyeY = cy - radius * 0.06 + eyeShiftY;
  const eyeRadius = radius * 0.15;

  ctx.strokeStyle = "#4a2e1c";
  ctx.lineWidth = Math.max(2, radius * 0.03);
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * radius * 0.26 + eyeShiftX * 0.4, eyeY - radius * 0.27);
    ctx.rotate(-side * (0.12 + anger * 0.55));
    ctx.beginPath();
    ctx.moveTo(-radius * 0.13, radius * 0.03);
    ctx.quadraticCurveTo(0, -radius * 0.05, radius * 0.13, radius * 0.03);
    ctx.stroke();
    ctx.restore();
  }

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * radius * 0.26 + eyeShiftX, eyeY);

    if (blink > 0.55) {
      ctx.strokeStyle = "#4a2e1c";
      ctx.lineWidth = Math.max(2, radius * 0.03);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, -eyeRadius * 0.5, eyeRadius * 0.85, Math.PI * 0.25, Math.PI * 0.75);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    ctx.rotate(side * 0.04);

    ctx.fillStyle = "#fff8ee";
    fillEllipse(ctx, 0, 0, eyeRadius, eyeRadius * 1.08);

    const irisR = eyeRadius * (0.68 - anger * 0.14);
    const iris = ctx.createRadialGradient(
      -eyeRadius * 0.1,
      -eyeRadius * 0.14,
      eyeRadius * 0.04,
      0,
      0,
      irisR,
    );
    iris.addColorStop(0, "#946035");
    iris.addColorStop(1, "#382213");
    ctx.fillStyle = iris;
    fillEllipse(ctx, 0, eyeRadius * 0.05, irisR, irisR * 1.04);

    ctx.fillStyle = "#20120a";
    fillEllipse(ctx, 0, eyeRadius * 0.07, irisR * 0.5, irisR * 0.56);

    ctx.fillStyle = "#fff";
    fillEllipse(ctx, -eyeRadius * 0.28, -eyeRadius * 0.16, eyeRadius * 0.17, eyeRadius * 0.17);
    fillEllipse(ctx, eyeRadius * 0.26, eyeRadius * 0.24, eyeRadius * 0.085, eyeRadius * 0.085);

    ctx.strokeStyle = "rgba(74, 42, 24, 0.35)";
    ctx.lineWidth = Math.max(1.4, radius * 0.013);
    ctx.beginPath();
    ctx.arc(0, 0, eyeRadius * 1.07, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
    ctx.restore();
  }

  for (const side of [-1, 1]) {
    const blushX = cx + side * radius * 0.41;
    const blushY = cy + radius * 0.14;
    const blush = ctx.createRadialGradient(blushX, blushY, 0, blushX, blushY, radius * 0.16);
    blush.addColorStop(0, `rgba(226, 108, 88, ${0.3 + anger * 0.16})`);
    blush.addColorStop(1, "rgba(226, 108, 88, 0)");
    ctx.fillStyle = blush;
    fillEllipse(ctx, blushX, blushY, radius * 0.17, radius * 0.1);
  }

  ctx.strokeStyle = "#4a2a18";
  ctx.lineWidth = Math.max(2.5, radius * 0.036);
  ctx.lineCap = "round";
  if (anger < 0.4) {
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.16, cy + radius * 0.27);
    ctx.quadraticCurveTo(cx - radius * 0.08, cy + radius * 0.36, cx, cy + radius * 0.29);
    ctx.quadraticCurveTo(
      cx + radius * 0.08,
      cy + radius * 0.36,
      cx + radius * 0.16,
      cy + radius * 0.27,
    );
    ctx.stroke();
  } else {
    const openness = Math.min(1, (anger - 0.4) / 0.6);
    const cornerY = cy + radius * (0.27 + 0.02 * openness);
    const topY = cy + radius * (0.21 + 0.02 * openness);
    const bottomY = cy + radius * (0.35 + 0.05 * openness);
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.21, cornerY);
    ctx.quadraticCurveTo(cx, topY - radius * 0.03, cx + radius * 0.21, cornerY);
    ctx.quadraticCurveTo(cx + radius * 0.12, bottomY, cx, bottomY);
    ctx.quadraticCurveTo(cx - radius * 0.12, bottomY, cx - radius * 0.21, cornerY);
    ctx.closePath();
    ctx.fillStyle = "#4a1c14";
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = "#fff4e0";
    const toothW = radius * 0.085;
    const toothH = radius * (0.065 + 0.02 * openness);
    ctx.fillRect(cx - radius * 0.115, topY - radius * 0.02, toothW, toothH);
    ctx.fillRect(cx + radius * 0.03, topY - radius * 0.02, toothW, toothH);
    ctx.restore();
  }

  drawSprout(ctx, cx, cy, radius, "soft", time);
};

const drawPixel: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY, time, blink) => {
  const block = Math.max(3, Math.round(radius / 11));

  ctx.fillStyle = anger > 0.4 ? "#e07a4a" : "#d4a05a";
  for (let y = -radius; y <= radius; y += block) {
    for (let x = -radius; x <= radius; x += block) {
      if (x * x + y * y <= (radius - block * 0.2) * (radius - block * 0.2)) {
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), block, block);
      }
    }
  }

  ctx.fillStyle = "#a56b32";
  for (const [x, y] of [
    [-0.68, 0.28],
    [0.64, -0.3],
    [-0.58, -0.38],
    [0.52, 0.47],
  ]) {
    ctx.fillRect(Math.round(cx + x * radius), Math.round(cy + y * radius), block * 2, block * 2);
  }

  const b = block;
  const gx = Math.round(cx / b) * b;
  const gy = Math.round(cy / b) * b;
  const eyeShift = Math.round(lookX) * b;
  const eyeDrop = Math.round(lookY * 0.5) * b;
  const px = (units: number) => gx + units * b;
  const py = (units: number) => gy + units * b;

  ctx.fillStyle = anger > 0.4 ? "#c46a4c" : "#d28f66";
  ctx.fillRect(px(-4), py(2), b, b);
  ctx.fillRect(px(3), py(2), b, b);

  if (blink > 0.55) {
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(px(-4) + eyeShift, py(-1) + eyeDrop, 2 * b, b);
    ctx.fillRect(px(2) + eyeShift, py(-1) + eyeDrop, 2 * b, b);
  } else {
    ctx.fillStyle = "#1a120c";
    ctx.fillRect(px(-4) + eyeShift, py(-2) + eyeDrop, 2 * b, 2 * b);
    ctx.fillRect(px(2) + eyeShift, py(-2) + eyeDrop, 2 * b, 2 * b);
    ctx.fillStyle = "#fff6e6";
    ctx.fillRect(px(-4) + eyeShift, py(-2) + eyeDrop, b, b);
    ctx.fillRect(px(2) + eyeShift, py(-2) + eyeDrop, b, b);
  }

  if (anger < 0.4) {
    ctx.fillStyle = "#3a2414";
    ctx.fillRect(px(-4) + eyeShift, py(-4) + eyeDrop, 2 * b, b);
    ctx.fillRect(px(2) + eyeShift, py(-4) + eyeDrop, 2 * b, b);
    ctx.fillStyle = "#20120a";
    ctx.fillRect(px(-3), py(2), b, b);
    ctx.fillRect(px(2), py(2), b, b);
    ctx.fillRect(px(-2), py(3), b, b);
    ctx.fillRect(px(-1), py(3), b, b);
    ctx.fillRect(px(0), py(3), b, b);
    ctx.fillRect(px(1), py(3), b, b);
  } else {
    ctx.fillStyle = "#3a2414";
    ctx.fillRect(px(-4) + eyeShift, py(-4) + eyeDrop, 2 * b, b);
    ctx.fillRect(px(-3) + eyeShift, py(-3) + eyeDrop, b, b);
    ctx.fillRect(px(3) + eyeShift, py(-4) + eyeDrop, 2 * b, b);
    ctx.fillRect(px(2) + eyeShift, py(-3) + eyeDrop, b, b);
    ctx.fillRect(px(-2), py(2), 4 * b, 2 * b);
    ctx.fillStyle = "#fff6e6";
    ctx.fillRect(px(-2), py(2), b, b);
    ctx.fillRect(px(1), py(2), b, b);
  }

  drawSprout(ctx, cx, cy, radius, "pixel", time);
};

const drawSticker: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY, time, blink) => {
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
  ctx.arc(cx - radius * 0.52, cy + radius * 0.32, radius * 0.13, 0, Math.PI * 2);
  ctx.arc(cx + radius * 0.53, cy + radius * 0.3, radius * 0.1, 0, Math.PI * 2);
  ctx.fill();

  const shiftX = lookX * radius * 0.04;
  const shiftY = lookY * radius * 0.025;
  const eyeY = cy - radius * 0.06 + shiftY;

  ctx.strokeStyle = "#2b1a10";
  ctx.lineWidth = Math.max(3, radius * 0.045);
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * radius * 0.26 + shiftX * 0.4, eyeY - radius * 0.26);
    ctx.rotate(-side * (0.08 + anger * 0.6));
    ctx.beginPath();
    ctx.moveTo(-radius * 0.12, radius * 0.02);
    ctx.quadraticCurveTo(0, -radius * 0.04, radius * 0.12, radius * 0.02);
    ctx.stroke();
    ctx.restore();
  }

  for (const side of [-1, 1]) {
    const blushX = cx + side * radius * 0.42;
    const blushY = cy + radius * 0.19;
    const blush = ctx.createRadialGradient(blushX, blushY, 0, blushX, blushY, radius * 0.12);
    blush.addColorStop(0, `rgba(233, 112, 92, ${0.4 + anger * 0.2})`);
    blush.addColorStop(1, "rgba(233, 112, 92, 0)");
    ctx.fillStyle = blush;
    fillEllipse(ctx, blushX, blushY, radius * 0.12, radius * 0.08);
  }

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * radius * 0.24 + shiftX, eyeY);
    if (blink > 0.55) {
      ctx.strokeStyle = "#2b1a10";
      ctx.lineWidth = Math.max(3, radius * 0.045);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, -radius * 0.05, radius * 0.12, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    } else if (anger < 0.4) {
      ctx.fillStyle = "#fffdf6";
      fillEllipse(ctx, 0, 0, radius * 0.14, radius * 0.15);
      ctx.fillStyle = "#2b1a10";
      fillEllipse(ctx, side * radius * 0.01, radius * 0.01, radius * 0.085, radius * 0.095);
      ctx.fillStyle = "#fff";
      fillEllipse(ctx, -radius * 0.035, -radius * 0.045, radius * 0.032, radius * 0.032);
      ctx.strokeStyle = "#2b1a10";
      ctx.lineWidth = Math.max(1.5, radius * 0.02);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.14, radius * 0.15, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.rotate(side * 0.22);
      ctx.fillStyle = "#fffdf6";
      ctx.fillRect(-radius * 0.13, -radius * 0.05, radius * 0.26, radius * 0.1);
      ctx.fillStyle = "#2b1a10";
      ctx.fillRect(-radius * 0.025, -radius * 0.05, radius * 0.05, radius * 0.1);
    }
    ctx.restore();
  }

  ctx.lineCap = "round";
  ctx.strokeStyle = "#2b1a10";
  ctx.lineWidth = Math.max(3, radius * 0.05);
  if (anger < 0.4) {
    ctx.beginPath();
    ctx.arc(cx, cy + radius * 0.14, radius * 0.17, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#5c2418";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#e08078";
    ctx.beginPath();
    ctx.ellipse(cx, cy + radius * 0.3, radius * 0.075, radius * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.19, cy + radius * 0.29);
    ctx.quadraticCurveTo(cx, cy + radius * 0.43, cx + radius * 0.19, cy + radius * 0.29);
    ctx.quadraticCurveTo(cx, cy + radius * 0.23, cx - radius * 0.19, cy + radius * 0.29);
    ctx.closePath();
    ctx.fillStyle = "#4a1710";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fffdf6";
    ctx.fillRect(cx - radius * 0.11, cy + radius * 0.28, radius * 0.07, radius * 0.06);
    ctx.fillRect(cx + radius * 0.04, cy + radius * 0.28, radius * 0.07, radius * 0.06);
  }

  drawSprout(ctx, cx, cy, radius, "sticker", time);
};

function inkWobble(angle: number) {
  return Math.sin(angle * 12.3) * 0.012 + Math.sin(angle * 4.1) * 0.008;
}

const drawInk: PotatoStyle = (ctx, cx, cy, radius, anger, lookX, lookY, time, blink) => {
  ctx.save();
  ctx.beginPath();
  const points = 30;
  const at = (i: number) => {
    const angle = (i / points) * Math.PI * 2;
    const edge = radius * (1 + inkWobble(i + cx * 0.01) + Math.sin(i * 0.7 + cy * 0.01) * 0.006);
    return [cx + Math.cos(angle) * edge, cy + Math.sin(angle) * edge] as const;
  };
  for (let i = 0; i < points; i++) {
    const [ax, ay] = at(i);
    const [bx, by] = at(i + 1);
    if (i === 0) ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = anger > 0.4 ? "#f3d2b0" : "#f6e7cf";
  ctx.fill();
  ctx.strokeStyle = "#2a2118";
  ctx.lineWidth = Math.max(1.5, radius * 0.018);
  ctx.stroke();

  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.3,
    cy + radius * 0.22,
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

  const eyeShiftX = lookX * radius * 0.035;
  const eyeY = cy - radius * 0.05 + lookY * radius * 0.025;

  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = Math.max(1.6, radius * 0.02);
  ctx.lineCap = "round";

  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx + side * radius * 0.25 + eyeShiftX * 0.4, eyeY - radius * 0.21);
    ctx.rotate(-side * (0.05 + anger * 0.6));
    ctx.beginPath();
    ctx.moveTo(-radius * 0.11, radius * 0.02);
    ctx.quadraticCurveTo(0, -radius * 0.04, radius * 0.11, radius * 0.02);
    ctx.stroke();
    ctx.restore();
  }

  if (blink > 0.55) {
    for (const side of [-1, 1]) {
      const ex = cx + side * radius * 0.24 + eyeShiftX;
      ctx.beginPath();
      ctx.moveTo(ex - radius * 0.085, eyeY + radius * 0.005);
      ctx.quadraticCurveTo(ex, eyeY + radius * 0.055, ex + radius * 0.085, eyeY + radius * 0.005);
      ctx.stroke();
    }
  } else if (anger < 0.4) {
    for (const side of [-1, 1]) {
      const ex = cx + side * radius * 0.24 + eyeShiftX;
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, radius * 0.085, radius * 0.09, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#24180f";
      fillEllipse(ctx, ex, eyeY + radius * 0.01, radius * 0.03, radius * 0.032);
    }
  } else {
    for (const side of [-1, 1]) {
      const ex = cx + side * radius * 0.24 + eyeShiftX;
      ctx.save();
      ctx.translate(ex, eyeY);
      ctx.rotate(-side * 0.28);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.105, radius * 0.055, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#24180f";
      ctx.beginPath();
      ctx.ellipse(
        -side * radius * 0.02,
        radius * 0.008,
        radius * 0.028,
        radius * 0.03,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.strokeStyle = "rgba(188, 108, 80, 0.5)";
  ctx.lineWidth = Math.max(1.2, radius * 0.013);
  for (const side of [-1, 1]) {
    for (let k = -1; k <= 1; k++) {
      const bx = cx + side * (radius * 0.4 + k * radius * 0.018);
      const by = cy + radius * 0.15 + k * radius * 0.028;
      ctx.beginPath();
      ctx.moveTo(bx - radius * 0.04, by);
      ctx.lineTo(bx + radius * 0.04, by - radius * 0.012);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "#24180f";
  ctx.lineWidth = Math.max(1.7, radius * 0.021);
  if (anger < 0.4) {
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.16, cy + radius * 0.27);
    ctx.quadraticCurveTo(cx - radius * 0.08, cy + radius * 0.35, cx, cy + radius * 0.29);
    ctx.quadraticCurveTo(
      cx + radius * 0.08,
      cy + radius * 0.35,
      cx + radius * 0.16,
      cy + radius * 0.27,
    );
    ctx.stroke();
  } else {
    const mouthTop = cy + radius * 0.22;
    const mouthBottom = cy + radius * 0.36;
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.17, cy + radius * 0.29);
    ctx.quadraticCurveTo(cx, mouthTop, cx + radius * 0.17, cy + radius * 0.29);
    ctx.quadraticCurveTo(cx + radius * 0.09, mouthBottom, cx, mouthBottom);
    ctx.quadraticCurveTo(cx - radius * 0.09, mouthBottom, cx - radius * 0.17, cy + radius * 0.29);
    ctx.closePath();
    ctx.fillStyle = "#5c2418";
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f6e7cf";
    ctx.fillRect(cx - radius * 0.1, mouthTop + radius * 0.012, radius * 0.06, radius * 0.05);
    ctx.fillRect(cx + radius * 0.04, mouthTop + radius * 0.012, radius * 0.06, radius * 0.05);
  }

  drawSprout(ctx, cx, cy, radius, "ink", time);
  ctx.restore();
};

const POTATO_STYLES: Record<StyleId, PotatoStyle> = {
  soft: drawSoft,
  pixel: drawPixel,
  sticker: drawSticker,
  ink: drawInk,
};

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  alpha: number,
  variant: StyleId,
  stageWidth: number,
) {
  const paper = variant === "ink" || variant === "sticker";
  const fontSize = 15;
  const height = 30;
  const radius = 12;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const width = Math.ceil(ctx.measureText(text).width) + 22;
  const bx = Math.max(8, Math.min(x - width / 2, stageWidth - width - 8));
  const by = y - height;
  const tx = Math.max(bx + 16, Math.min(x, bx + width - 16));

  ctx.beginPath();
  ctx.moveTo(bx + radius, by);
  ctx.lineTo(bx + width - radius, by);
  ctx.quadraticCurveTo(bx + width, by, bx + width, by + radius);
  ctx.lineTo(bx + width, by + height - radius);
  ctx.quadraticCurveTo(bx + width, by + height, bx + width - radius, by + height);
  ctx.lineTo(tx + 7, by + height);
  ctx.lineTo(tx, by + height + 9);
  ctx.lineTo(tx - 7, by + height);
  ctx.lineTo(bx + radius, by + height);
  ctx.quadraticCurveTo(bx, by + height, bx, by + height - radius);
  ctx.lineTo(bx, by + radius);
  ctx.quadraticCurveTo(bx, by, bx + radius, by);
  ctx.closePath();

  ctx.fillStyle = paper ? "#fffdf6" : "#2b1a10";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = paper ? "rgba(43, 26, 16, 0.9)" : "rgba(255, 246, 230, 0.35)";
  ctx.stroke();

  ctx.fillStyle = paper ? "#2b1a10" : "#fff6e6";
  ctx.fillText(text, bx + width / 2, by + height / 2 + 0.5);
  ctx.restore();
}

function drawSteam(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  anger: number,
  time: number,
  variant: StyleId,
) {
  if (anger < 0.55) return;
  const strength = (anger - 0.55) / 0.45;

  for (const side of [-1, 1]) {
    for (let index = 0; index < 2; index++) {
      const phase = (time * 0.00022 + index * 0.5 + (side === 1 ? 0.25 : 0)) % 1;
      const puffX = cx + side * radius * (0.52 + phase * 0.2);
      const puffY = cy - radius * (0.75 + phase * 0.45);
      const puffR = radius * (0.05 + phase * 0.045);

      ctx.save();
      ctx.globalAlpha = strength * (1 - phase) * 0.85;
      if (variant === "pixel") {
        const block = Math.max(3, Math.round(radius / 18));
        ctx.fillStyle = "#fff6e6";
        ctx.fillRect(Math.round(puffX), Math.round(puffY), block * 2, block * 2);
      } else {
        ctx.beginPath();
        ctx.ellipse(puffX, puffY, puffR, puffR * 0.82, 0, 0, Math.PI * 2);
        ctx.fillStyle = variant === "ink" ? "rgba(255, 255, 255, 0.7)" : "#fffaf0";
        ctx.fill();
        if (variant === "ink") {
          ctx.strokeStyle = "rgba(42, 33, 24, 0.45)";
          ctx.lineWidth = Math.max(1.2, radius * 0.012);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }
}

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
  const [pokes, setPokes] = useState(0);
  const [heat, setHeat] = useState(0);
  const lastPokeRef = useRef(0);

  const chooseStyle = (next: StyleId) => {
    styleRef.current = next;
    setStyle(next);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (performance.now() - lastPokeRef.current < RAPID_POKE_MS) return;
      setHeat((current) => (current > 0 ? current - 1 : 0));
    }, 900);
    return () => window.clearInterval(timer);
  }, []);

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
      bubbles: [],
      motes: [],
      blink: { start: 0, len: 1, nextAt: 900 },
      littleBlink: { start: 0, len: 1, nextAt: 2400 },
    };

    let frame = 0;
    let streak = 0;

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

      if (state.motes.length === 0) {
        for (let i = 0; i < 16; i++) {
          state.motes.push({
            x: Math.random() * state.width,
            y: Math.random() * state.height,
            r: 1 + Math.random() * 2.2,
            drift: 0.08 + Math.random() * 0.22,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const poke = () => {
      const centerX = state.width / 2;
      const centerY = Math.min(state.height * 0.46, 340);
      const radius = Math.min(170, state.width * 0.22, state.height * 0.26);
      const dx = state.littleX - centerX;
      const dy = state.littleY - centerY;
      if (Math.hypot(dx, dy) > radius + POKE_REACH) return;

      const now = performance.now();
      const rapid = now - lastPokeRef.current < RAPID_POKE_MS;
      lastPokeRef.current = now;
      streak = rapid ? Math.min(MOOD_LABELS.length - 1, streak + 1) : 1;
      setPokes((count) => count + 1);
      setHeat(streak);

      const lines = REACTIONS[streak];
      const topBubble = state.bubbles.reduce(
        (lowest, bubble) => Math.min(lowest, bubble.y),
        Infinity,
      );
      state.bubbles.push({
        x: state.littleX,
        y: Number.isFinite(topBubble) ? topBubble - 34 : state.littleY - LITTLE_RADIUS - 10,
        life: 1,
        text: lines[Math.floor(Math.random() * lines.length)],
      });
      if (state.bubbles.length > 3) state.bubbles.shift();

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
      const now = performance.now();

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

      for (const mote of state.motes) {
        mote.y -= mote.drift;
        mote.x += Math.sin(now * 0.0004 + mote.phase) * 0.16;
        if (mote.y < -10) {
          mote.y = height + 10;
          mote.x = Math.random() * width;
        }
        ctx.globalAlpha = paper ? 0.28 : 0.24;
        ctx.fillStyle = paper ? "#8a6a44" : "#ffe9c2";
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

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

      const sway =
        Math.sin(now * 0.0011) * 0.018 +
        Math.sin(now * 0.00063 + 1.7) * 0.01 +
        Math.sin(now * 0.045) * 0.03 * state.anger;
      const ropeWidth = currentStyle === "pixel" ? 16 : 22;

      ctx.save();
      ctx.translate(centerX, 0);
      ctx.rotate(sway);
      ctx.fillStyle = paper ? "#6b5344" : "#3a2618";
      ctx.fillRect(-ropeWidth / 2, 0, ropeWidth, centerY - radius + 2);

      const blink = updateBlink(state.blink, now);
      drawPotato(ctx, 0, centerY, radius, state.anger, state.lookX, state.lookY, now, blink);

      if (state.flash > 0.05) {
        ctx.beginPath();
        ctx.arc(0, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash * 0.28})`;
        ctx.fill();
      }
      ctx.restore();

      drawSteam(ctx, centerX, centerY, radius, state.anger, now, currentStyle);

      for (let i = state.particles.length - 1; i >= 0; i--) {
        const particle = state.particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity ?? 0.16;
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

      const miniDx = state.mouseX - state.littleX;
      const miniDy = state.mouseY - state.littleY;
      const miniLookX = Math.max(-1, Math.min(1, miniDx / 70));
      const miniLookY = Math.max(-1, Math.min(1, miniDy / 70));

      if (
        Math.hypot(miniDx, miniDy) > 55 &&
        state.particles.length < MAX_PARTICLES &&
        Math.random() < 0.35
      ) {
        state.particles.push({
          x: state.littleX + (Math.random() - 0.5) * 18,
          y: state.littleY + (Math.random() - 0.5) * 18,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.3 - Math.random() * 0.5,
          life: 0.75,
          size: 1.5 + Math.random() * 1.8,
          color: Math.random() > 0.5 ? "#ffe8b4" : "#fffaf0",
          gravity: 0.015,
        });
      }

      const littleBlink = updateBlink(state.littleBlink, now);
      drawPotato(
        ctx,
        state.littleX,
        state.littleY,
        LITTLE_RADIUS,
        0,
        miniLookX,
        miniLookY,
        now,
        littleBlink,
      );

      for (let i = state.bubbles.length - 1; i >= 0; i--) {
        const bubble = state.bubbles[i];
        bubble.y -= 0.32;
        bubble.life -= 0.012;
        if (bubble.life <= 0) {
          state.bubbles.splice(i, 1);
          continue;
        }
        drawSpeechBubble(
          ctx,
          bubble.text,
          bubble.x,
          bubble.y,
          Math.min(1, bubble.life * 3),
          currentStyle,
          width,
        );
      }

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
  const patience = PATIENCE_SEGMENTS - heat;

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none"
        aria-label="A big potato hanging from a string. Move the little potato near it and poke it. Pokes make it cross."
        role="img"
      />

      <div
        data-ui
        className="absolute left-3 z-10 select-none rounded-2xl bg-black/35 px-3 py-2 text-white shadow-sm backdrop-blur-sm"
        style={{ top: "calc(5rem + env(safe-area-inset-top))" }}
      >
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg leading-none font-semibold tabular-nums">{pokes}</span>
          <span className="text-[10px] tracking-[0.16em] text-white/65 uppercase">pokes</span>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: PATIENCE_SEGMENTS }, (_, index) => (
            <span
              key={index}
              className={`h-1.5 w-3.5 rounded-full transition-colors ${
                index < patience ? MOOD_COLORS[heat] : "bg-white/20"
              }`}
            />
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] tracking-[0.16em] text-white/70 uppercase">
          <span className={`h-1.5 w-1.5 rounded-full ${MOOD_COLORS[heat]}`} />
          <span aria-live="polite">{MOOD_LABELS[heat]}</span>
        </div>
      </div>

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
