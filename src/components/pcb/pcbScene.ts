import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * three.js "PCB chip rack" scene — each project renders as a chip footprint
 * on a circuit board. Ported from the design handoff's pcb-scene.js, with
 * window-global callbacks replaced by an explicit handle/options API so it
 * composes with React state instead of mutating globals.
 *
 * Visual pass (v2): ACES Filmic tone mapping + a neutral PMREM studio
 * environment for physically plausible clearcoat/copper reflections, richer
 * per-component-type geometry (webcam module, BGA/heatsink SoC, SOIC-8 with
 * gull-wing leads, THT MCU cluster with a real 5mm LED assembly), a much
 * denser/dirtier board texture, and a cheap additive Sprite disc behind each
 * LED as a bloom substitute (no post-processing — that broke page-background
 * transparency).
 */

type PcbProject = {
  id: string;
  ref: string;
  color: number;
  pos: [number, number, number];
  status: "built" | "live" | "building" | "archived";
};

const PROJECTS: PcbProject[] = [
  { id: "rivalruns", ref: "U1", color: 0x4ee1ff, pos: [-1.55, 0, -0.9], status: "built" },
  { id: "sentiment-desk", ref: "U2", color: 0x39ff9c, pos: [-0.15, 0, -1.05], status: "live" },
  { id: "quant-options-pipeline", ref: "U3", color: 0xd946ef, pos: [1.55, 0, -0.9], status: "building" },
  { id: "cc-optimizer", ref: "U4", color: 0xffb454, pos: [1.55, 0, 0.9], status: "live" },
  { id: "reaction-game", ref: "U5", color: 0xff5fa2, pos: [-1.55, 0, 0.9], status: "archived" },
];

type Finish = { bg: string; bg2: string; trace: string; copper: string; pad: string; dot: string; silk: string; ambient: number; rim: number; edge: string };

const FINISHES: Record<string, Finish> = {
  silkscreen: { bg: "#0c2318", bg2: "#0f2c1d", trace: "rgba(230,240,235,0.55)", copper: "#e0b95a", pad: "#f0cd7a", dot: "rgba(57,255,156,0.55)", silk: "rgba(235,245,240,0.85)", ambient: 0x223344, rim: 0x4ee1ff, edge: "#e0b95a" },
};

const BOARD_W = 4;
const BOARD_D = 3;
function u(x: number) {
  return ((x + BOARD_W / 2) / BOARD_W) * 1024;
}
function v(z: number) {
  return ((z + BOARD_D / 2) / BOARD_D) * 768;
}

function orthRoute(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, width: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1, y2);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function makeBoardTexture(pal: Finish) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 768;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 1024, 768);
  grad.addColorStop(0, pal.bg);
  grad.addColorStop(1, pal.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  // woven fiberglass weave — fine crosshatch grain for a real FR4 sheen
  ctx.globalAlpha = 0.05;
  for (let gx = 0; gx < c.width; gx += 6) {
    ctx.strokeStyle = gx % 12 === 0 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, c.height);
    ctx.stroke();
  }
  for (let gy = 0; gy < c.height; gy += 6) {
    ctx.strokeStyle = gy % 12 === 0 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(c.width, gy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // diagonal specular sheen sweep
  const sheen = ctx.createLinearGradient(0, 0, c.width, c.height * 0.6);
  sheen.addColorStop(0, "rgba(255,255,255,0)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0.05)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0.09)");
  sheen.addColorStop(0.58, "rgba(255,255,255,0.05)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, c.width, c.height);

  // ground-plane hatch (denser fill routing, subtle)
  ctx.strokeStyle = pal.trace;
  ctx.globalAlpha = 0.06;
  ctx.lineWidth = 1;
  for (let i = -20; i < 40; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 40, 0);
    ctx.lineTo(i * 40 - 300, 768);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // copper pour zones — large filled ground-plane polygons in the corners, like a real 2-layer board
  ctx.fillStyle = pal.copper;
  ctx.globalAlpha = 0.05;
  ([[40, 40], [1024 - 260, 40], [40, 768 - 220], [1024 - 260, 768 - 220]] as [number, number][]).forEach(([px, py]) => {
    ctx.fillRect(px, py, 220, 180);
  });
  ctx.globalAlpha = 1;
  // thermal-relief crosshatch inside pours
  ctx.strokeStyle = pal.bg;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = 6;
  ([[40, 40], [1024 - 260, 40], [40, 768 - 220], [1024 - 260, 768 - 220]] as [number, number][]).forEach(([px, py]) => {
    for (let gx = px + 10; gx < px + 220; gx += 22) {
      ctx.beginPath();
      ctx.moveTo(gx, py);
      ctx.lineTo(gx, py + 180);
      ctx.stroke();
    }
  });
  ctx.globalAlpha = 1;

  // dense signal traces criss-crossing the whole board (background routing texture)
  ctx.strokeStyle = pal.trace;
  ctx.lineWidth = 2;
  ctx.lineCap = "square";
  for (let i = 0; i < 34; i++) {
    const x0 = Math.random() * c.width;
    const y0 = Math.random() * c.height;
    const x1b = x0 + (Math.random() - 0.5) * 260;
    const y1b = y0;
    const y2b = y1b + (Math.random() - 0.5) * 260;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1b, y1b);
    ctx.lineTo(x1b, y2b);
    ctx.stroke();
    ctx.fillStyle = pal.trace;
    ctx.beginPath();
    ctx.arc(x1b, y2b, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // main routed copper: each chip -> spine (z=0) -> chip
  const spineY = v(0);
  ctx.strokeStyle = pal.copper;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(u(-1.75), spineY);
  ctx.lineTo(u(1.75), spineY);
  ctx.stroke();

  PROJECTS.forEach((p) => {
    const cx = u(p.pos[0]);
    const cy = v(p.pos[2]);
    orthRoute(ctx, cx, cy, cx, spineY, 5, pal.copper);
    // secondary signal trace offset alongside
    orthRoute(ctx, cx + (p.pos[0] < 0 ? -14 : 14), cy, cx + (p.pos[0] < 0 ? -14 : 14), spineY + (p.pos[2] < 0 ? -18 : 18), 2.4, pal.trace);
    // via at junction
    ctx.fillStyle = pal.pad;
    ctx.beginPath();
    ctx.arc(cx, spineY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.bg;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, spineY, 3, 0, Math.PI * 2);
    ctx.stroke();
    // pad / solder footprint under chip
    ctx.fillStyle = pal.pad;
    ctx.globalAlpha = 1;
    ctx.fillRect(cx - 46, cy - 34, 92, 68);
    ctx.strokeStyle = pal.silk;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 52, cy - 40, 104, 80);
    // reference designator silkscreen
    ctx.fillStyle = pal.silk;
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.ref, cx, cy - 48);
    // baked ambient-occlusion halo under the footprint so the chip reads grounded, not floating
    const ao = ctx.createRadialGradient(cx, cy, 40, cx, cy, 78);
    ao.addColorStop(0, "rgba(0,0,0,0.32)");
    ao.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = ao;
    ctx.fillRect(cx - 90, cy - 90, 180, 180);
    // small decoupling cap pads flanking the chip — real boards always have these right next to the IC
    ctx.fillStyle = pal.pad;
    ctx.fillRect(cx - 68, cy - 10, 14, 20);
    ctx.fillRect(cx + 54, cy - 10, 14, 20);
  });

  // scattered passive components (silkscreen only — resistor/cap footprints, denser board feel)
  ctx.strokeStyle = pal.silk;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 30; i++) {
    const rx = 60 + Math.random() * (1024 - 120);
    const ry = 60 + Math.random() * (768 - 120);
    if (Math.hypot(rx - 512, ry - 384) < 90) continue;
    const w = 18 + Math.random() * 10;
    const rot = Math.random() > 0.5 ? 0 : Math.PI / 2;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(rot);
    ctx.strokeRect(-w / 2, -6, w, 12);
    ctx.fillStyle = pal.pad;
    ctx.fillRect(-w / 2 - 4, -6, 5, 12);
    ctx.fillRect(w / 2 - 1, -6, 5, 12);
    ctx.restore();
  }

  // mounting holes at corners (with copper annular ring, drilled black center + tiny highlight for depth)
  ([[-1.85, -1.35], [1.85, -1.35], [-1.85, 1.35], [1.85, 1.35]] as [number, number][]).forEach(([mx, mz]) => {
    const mxp = u(mx);
    const mzp = v(mz);
    ctx.fillStyle = pal.pad;
    ctx.beginPath();
    ctx.arc(mxp, mzp, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#05070a";
    ctx.beginPath();
    ctx.arc(mxp, mzp, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(mxp - 2, mzp - 2, 6, Math.PI, Math.PI * 1.5);
    ctx.stroke();
  });

  // edge connector fingers along -x edge, gold ENIG plating with subtle shimmer
  ctx.fillStyle = pal.pad;
  for (let i = 0; i < 14; i++) ctx.fillRect(4, 300 + i * 12, 18, 8);
  ctx.save();
  const fingerSheen = ctx.createLinearGradient(4, 300, 22, 468);
  fingerSheen.addColorStop(0, "rgba(255,255,255,0.5)");
  fingerSheen.addColorStop(0.5, "rgba(255,255,255,0.05)");
  fingerSheen.addColorStop(1, "rgba(255,255,255,0.35)");
  ctx.fillStyle = fingerSheen;
  for (let i = 0; i < 14; i++) ctx.fillRect(4, 300 + i * 12, 18, 3);
  ctx.restore();

  // drilled via holes dotted along the main copper spine + branch routes, ENIG-gold ring w/ dark drill
  const spineYv = v(0);
  for (let i = -16; i <= 16; i++) {
    const vx = 512 + i * 26;
    if (vx < 40 || vx > 984) continue;
    ctx.fillStyle = pal.pad;
    ctx.beginPath();
    ctx.arc(vx, spineYv, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#05070a";
    ctx.beginPath();
    ctx.arc(vx, spineYv, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // subtle fiberglass grain — fine speckled noise so the mask reads matte, not flat-vector
  const grain = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    grain.data[i] += n;
    grain.data[i + 1] += n;
    grain.data[i + 2] += n;
  }
  ctx.putImageData(grain, 0, 0);

  // handling smudges — faint oily fingerprint ghosts near the edges, like a board that's actually been picked up
  for (let i = 0; i < 4; i++) {
    const sx = 80 + Math.random() * (c.width - 160);
    const sy = 80 + Math.random() * (c.height - 160);
    const sm = ctx.createRadialGradient(sx, sy, 4, sx, sy, 46 + Math.random() * 30);
    sm.addColorStop(0, "rgba(180,190,180,0.05)");
    sm.addColorStop(0.6, "rgba(160,170,160,0.03)");
    sm.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sm;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 46 + Math.random() * 30, 30 + Math.random() * 20, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // copper-pour patina — uneven oxidation blotches so the ground fill doesn't read as a flat vector tint
  for (let i = 0; i < 10; i++) {
    const sx = Math.random() * c.width;
    const sy = Math.random() * c.height;
    const rad = 30 + Math.random() * 70;
    const pg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
    pg.addColorStop(0, "rgba(40,30,10,0.05)");
    pg.addColorStop(1, "rgba(40,30,10,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(sx - rad, sy - rad, rad * 2, rad * 2);
  }
  // fine solder-mask scuffs — a few short bright scratches catching the light unevenly
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 18; i++) {
    const sx = Math.random() * c.width;
    const sy = Math.random() * c.height;
    const len = 10 + Math.random() * 30;
    const ang = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
    ctx.stroke();
  }
  // soft vignette so the panel reads as lit unevenly, like real photographed FR4
  const vg = ctx.createRadialGradient(512, 384, 200, 512, 384, 700);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, c.width, c.height);

  // brand silkscreen wordmark + rev/spec marks near the edge, like a real fab panel
  ctx.save();
  ctx.fillStyle = pal.silk;
  ctx.font = "11px monospace";
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.75;
  ctx.fillText("EA-PORTFOLIO REV.C  ·  FR4 1.6mm  ·  2S2P", 30, 740);
  ctx.fillText("MADE IN BROWSER", 1024 - 190, 740);
  ctx.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// cheap normal map from the same layout: encodes copper/pad edges as raised so specular light catches trace edges
function makeBoardNormalMap(pal: Finish) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 768;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#a0a0ff";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  const spineYn = v(0);
  ctx.beginPath();
  ctx.moveTo(u(-1.75), spineYn);
  ctx.lineTo(u(1.75), spineYn);
  ctx.stroke();
  PROJECTS.forEach((p) => {
    const cx = u(p.pos[0]);
    const cy = v(p.pos[2]);
    orthRoute(ctx, cx, cy, cx, spineYn, 5, "#a0a0ff");
    ctx.fillStyle = "#9898ff";
    ctx.fillRect(cx - 46, cy - 34, 92, 68);
  });
  return new THREE.CanvasTexture(c);
}

// laser-etched part-marking texture for chip tops (SoC label, EEPROM label, MCU label)
function makeChipLabelTexture(line1: string, line2: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 128);
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "bold 30px monospace";
  ctx.fillText(line1, 128, 58);
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  ctx.font = "18px monospace";
  ctx.fillText(line2, 128, 86);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeEdgeTexture(pal: Finish) {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d")!;
  const layers: [number, number, string][] = [
    [0, 0.62, pal.bg2],
    [0.62, 0.7, pal.edge],
    [0.7, 0.82, "#1a1d22"],
    [0.82, 0.9, pal.edge],
    [0.9, 1, pal.bg2],
  ];
  layers.forEach(([a, b, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, a * 64, 64, (b - a) * 64);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  return tex;
}

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export type PcbHandle = {
  setSelected: (id: string | null) => void;
  triggerEject: (id: string) => void;
  destroy: () => void;
};

export function initPcbScene(
  mountEl: HTMLElement,
  opts: { onSelect: (id: string) => void; onHover: (id: string | null) => void }
): PcbHandle {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, mountEl.clientWidth / mountEl.clientHeight, 0.1, 50);
  camera.position.set(2.7, 4.3, 4.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mountEl.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minDistance = 5.4;
  controls.maxDistance = 8;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.minPolarAngle = 0.5;
  controls.target.set(0, 0, 0);

  // neutral PMREM studio environment — large soft rectangular highlights read as real
  // photographed reflections on clearcoat/copper, replacing the old colored-light rig.
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = null;
  let pmremDisposed = false;
  const pmremFrame = requestAnimationFrame(() => {
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x14181f);
    const softbox1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), new THREE.MeshBasicMaterial({ color: 0xf2f4f7, side: THREE.DoubleSide }));
    softbox1.position.set(2.5, 3, -1);
    softbox1.lookAt(0, 0, 0);
    envScene.add(softbox1);
    const softbox2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 4), new THREE.MeshBasicMaterial({ color: 0xd9dfe8, side: THREE.DoubleSide }));
    softbox2.position.set(-3, 1.5, 2);
    softbox2.lookAt(0, 0, 0);
    envScene.add(softbox2);
    const envLight1 = new THREE.Mesh(new THREE.SphereGeometry(3, 6, 6), new THREE.MeshBasicMaterial({ color: 0x3a4552 }));
    envLight1.position.set(3, 4, -2);
    envScene.add(envLight1);
    const envLight2 = new THREE.Mesh(new THREE.SphereGeometry(2, 6, 6), new THREE.MeshBasicMaterial({ color: 0x4a4238 }));
    envLight2.position.set(-3, 2, 3);
    envScene.add(envLight2);
    const envTex = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();
    pmremDisposed = true;
  });

  const ambient = new THREE.AmbientLight(0x445566, 1.05);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff4e0, 2.3);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -3;
  key.shadow.camera.right = 3;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 12;
  key.shadow.bias = -0.002;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x4ee1ff, 0.5);
  rim.position.set(-4, 2, -4);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffe8c2, 0.45);
  fill.position.set(-2, 3, 4);
  scene.add(fill);
  const glint = new THREE.PointLight(0xffffff, 0.3, 6);
  glint.position.set(0, 2.5, 2);
  scene.add(glint);
  const underGlow = new THREE.PointLight(0x39ff9c, 0.25, 5);
  underGlow.position.set(0, -0.6, 0);
  scene.add(underGlow);

  const finish = FINISHES.silkscreen;

  const boardTopMat = new THREE.MeshPhysicalMaterial({
    map: makeBoardTexture(finish),
    normalMap: makeBoardNormalMap(finish),
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.42,
    metalness: 0.08,
    clearcoat: 0.25,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1.4,
    transparent: true,
    opacity: 0,
  });
  const boardEdgeMat = new THREE.MeshStandardMaterial({ map: makeEdgeTexture(finish), roughness: 0.7, metalness: 0.15, transparent: true, opacity: 0 });
  const boardBottomMat = new THREE.MeshStandardMaterial({ color: 0x0a0e13, roughness: 0.8, metalness: 0.1 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W, 0.14, BOARD_D), [boardEdgeMat, boardEdgeMat, boardTopMat, boardBottomMat, boardEdgeMat, boardEdgeMat]);
  board.name = "board";
  board.receiveShadow = true;
  scene.add(board);

  const traceBaseY = 0.072;
  const traceGroup = new THREE.Group();
  scene.add(traceGroup);
  const COPPER = 0xc98a3f;
  function makeTraceMesh(x1: number, z1: number, x2: number, z2: number, width: number, tintHex: number) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.max(0.02, Math.hypot(dx, dz));
    const geo = new THREE.BoxGeometry(width, 0.01, len);
    // real copper foil at rest: metallic gold, no self-illumination. tintHex only lights up on hover/select.
    const mat = new THREE.MeshStandardMaterial({ color: COPPER, emissive: tintHex, emissiveIntensity: 0, roughness: 0.4, metalness: 0.85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((x1 + x2) / 2, traceBaseY, (z1 + z2) / 2);
    if (Math.abs(dx) > Math.abs(dz)) mesh.rotation.y = Math.PI / 2;
    traceGroup.add(mesh);
    return mesh;
  }
  const spine = makeTraceMesh(-1.75, 0, 1.75, 0, 0.05, 0x39ff9c);
  // secondary parallel data-line beside the main spine, offset so it doesn't overlap
  makeTraceMesh(-1.75, 0.055, 1.75, 0.055, 0.025, 0x4ee1ff);

  const viaMat = new THREE.MeshStandardMaterial({ color: COPPER, metalness: 0.85, roughness: 0.3 });
  const drillMat = new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.6 });
  for (let i = -6; i <= 6; i++) {
    const vx = i * 0.26;
    if (Math.abs(vx) > 1.7) continue;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.012, 8), viaMat);
    ring.position.set(vx, traceBaseY + 0.006, 0);
    traceGroup.add(ring);
    const drill = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.014, 8), drillMat);
    drill.position.set(vx, traceBaseY + 0.007, 0);
    traceGroup.add(drill);
  }
  const chipTraces: Record<string, { seg: THREE.Mesh; via: THREE.Mesh }> = {};
  PROJECTS.forEach((p) => {
    const seg = makeTraceMesh(p.pos[0], p.pos[2], p.pos[0], 0, 0.025, p.color);
    const via = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.015, 10),
      new THREE.MeshStandardMaterial({ color: COPPER, emissive: p.color, emissiveIntensity: 0, metalness: 0.85, roughness: 0.3 })
    );
    via.position.set(p.pos[0], traceBaseY, 0);
    traceGroup.add(via);
    chipTraces[p.id] = { seg, via };
  });

  // scattered 3D passives (resistors vs MLCC caps) for tactile realism beyond the silkscreen footprints
  const passiveGeo = new THREE.BoxGeometry(0.12, 0.045, 0.055);
  const resistorBodyMat = new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.35, metalness: 0.1 });
  const capBodyMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2e, roughness: 0.3, metalness: 0.05 });
  const smdTermMat = new THREE.MeshStandardMaterial({ color: 0xc7ccd1, metalness: 0.85, roughness: 0.35 });
  const electroBodyMat = new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.35, metalness: 0.4 });
  const electroTopMat = new THREE.MeshStandardMaterial({ color: 0xd8dde3, roughness: 0.5, metalness: 0.2 });
  const chipZones = PROJECTS.map((p) => ({ x: p.pos[0], z: p.pos[2] }));
  let placed = 0;
  let attempts = 0;
  while (placed < 16 && attempts < 200) {
    attempts++;
    const x = (Math.random() - 0.5) * (BOARD_W - 0.5);
    const z = (Math.random() - 0.5) * (BOARD_D - 0.5);
    if (chipZones.some((cz) => Math.hypot(x - cz.x, z - cz.z) < 0.75)) continue;
    const pg = new THREE.Group();
    const isResistor = Math.random() > 0.5;
    const body = new THREE.Mesh(passiveGeo, isResistor ? resistorBodyMat : capBodyMat);
    body.castShadow = true;
    pg.add(body);
    const capL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.06), smdTermMat);
    capL.position.x = -0.055;
    pg.add(capL);
    const capR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.06), smdTermMat);
    capR.position.x = 0.055;
    pg.add(capR);
    if (isResistor) {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.047, 0.057),
        new THREE.MeshStandardMaterial({ color: [0x8a5a2e, 0xb0242a, 0xd8a53a, 0x2a6b3a][Math.floor(Math.random() * 4)], roughness: 0.4 })
      );
      band.position.x = -0.015;
      pg.add(band);
    } else {
      const capSheen = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 0.045), new THREE.MeshStandardMaterial({ color: 0xc9a878, roughness: 0.2, transparent: true, opacity: 0.35 }));
      capSheen.position.y = 0.02;
      pg.add(capSheen);
    }
    pg.rotation.y = Math.random() > 0.5 ? 0 : Math.PI / 2;
    pg.position.set(x, 0.0925, z);
    scene.add(pg);
    placed++;
  }

  // a handful of cylindrical electrolytic capacitors, taller components for visual variety
  let ecPlaced = 0;
  let ecAttempts = 0;
  while (ecPlaced < 5 && ecAttempts < 100) {
    ecAttempts++;
    const x = (Math.random() - 0.5) * (BOARD_W - 0.6);
    const z = (Math.random() - 0.5) * (BOARD_D - 0.6);
    if (chipZones.some((cz) => Math.hypot(x - cz.x, z - cz.z) < 0.85)) continue;
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 14), electroBodyMat);
    can.castShadow = true;
    can.position.set(x, 0.16, z);
    scene.add(can);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 14), electroTopMat);
    top.position.set(x, 0.255, z);
    scene.add(top);
    const domeBump = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), electroTopMat);
    domeBump.scale.y = 0.35;
    domeBump.position.set(x, 0.258, z);
    scene.add(domeBump);
    // K-vent score cut into the top disc, standard on real electrolytic caps
    const vent = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.004, 0.006), new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.6 }));
    vent.position.set(x, 0.256, z);
    scene.add(vent);
    const vent2 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.11), new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.6 }));
    vent2.position.set(x, 0.256, z);
    scene.add(vent2);
    // printed polarity stripe wrapping the sleeve, standard blue/gray print with a (-) rail down one side
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.17), new THREE.MeshStandardMaterial({ color: 0xdde3ea, roughness: 0.6, side: THREE.DoubleSide }));
    stripe.position.set(x + 0.071, 0.16, z);
    stripe.rotation.y = Math.PI / 2;
    scene.add(stripe);
    ecPlaced++;
  }

  // physical mounting screws at the corners, matching the drilled holes in the texture
  const screwMat = new THREE.MeshStandardMaterial({ color: 0x8a9099, metalness: 0.85, roughness: 0.35 });
  const standoffMat = new THREE.MeshStandardMaterial({ color: 0x6b7178, metalness: 0.7, roughness: 0.4 });
  ([[-1.85, -1.35], [1.85, -1.35], [-1.85, 1.35], [1.85, 1.35]] as [number, number][]).forEach(([sx, sz]) => {
    const standoff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), standoffMat);
    standoff.position.set(sx, 0.0, sz);
    standoff.castShadow = true;
    scene.add(standoff);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12), screwMat);
    screw.position.set(sx, 0.078, sz);
    screw.castShadow = true;
    scene.add(screw);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.008, 0.01), new THREE.MeshStandardMaterial({ color: 0x2a2d33, metalness: 0.5, roughness: 0.6 }));
    slot.position.set(sx, 0.089, sz);
    scene.add(slot);
  });

  const pickables: THREE.Object3D[] = [];
  type ChipState = {
    group: THREE.Group;
    led: THREE.MeshStandardMaterial;
    body: THREE.MeshPhysicalMaterial;
    tintColor: number;
    status: string;
    restY: number;
    id: string;
    curY: number;
    phase: number;
    bootIn: number | null;
    bootDone: boolean;
    eject: number | null;
    glow: THREE.Sprite;
  };
  const chips: ChipState[] = [];

  PROJECTS.forEach((p) => {
    const g = new THREE.Group();
    g.name = "chip_" + p.id;
    g.userData.projectId = p.id;
    g.userData.status = p.status;
    const archived = p.status === "archived";
    const bodyColor = archived ? 0x2a2e33 : 0x11151b;
    const metalColor = archived ? 0x6b6f75 : 0xb7c2cc;
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: bodyColor,
      roughness: archived ? 0.9 : 0.28,
      metalness: archived ? 0.1 : 0.55,
      clearcoat: archived ? 0 : 0.85,
      clearcoatRoughness: 0.18,
      ior: 1.5,
      reflectivity: 0.6,
    });
    const pinMat = new THREE.MeshPhysicalMaterial({ color: metalColor, metalness: 0.9, roughness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.1 });
    const solderBallMat = new THREE.MeshStandardMaterial({ color: 0x9a9d9f, metalness: 0.55, roughness: 0.45 });
    let body: THREE.Mesh;
    let ledPos: [number, number, number] = [0, 0.3, 0];
    let footprint: [number, number] = [0.9, 0.7];
    let realLedMesh: THREE.Mesh | null = null;

    if (p.id === "rivalruns") {
      // webcam/sensor module: small PCB + lens barrel + ribbon cable — this project reads hands via webcam
      body = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.62), bodyMat);
      body.position.y = 0.12;
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.2, metalness: 0.6 }));
      lens.position.set(0, 0.28, 0);
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0x0c2733, roughness: 0.05, metalness: 0.9, emissive: 0x0c2733, emissiveIntensity: 0.3 })
      );
      glass.position.set(0, 0.39, 0);
      // IR illumination LEDs ringing the lens — standard on real hand-tracking webcam modules
      for (let ii = 0; ii < 6; ii++) {
        const ang = (ii / 6) * Math.PI * 2;
        const irLed = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), new THREE.MeshStandardMaterial({ color: 0x2a1010, roughness: 0.3, metalness: 0.2 }));
        irLed.position.set(Math.cos(ang) * 0.22, 0.3, Math.sin(ang) * 0.22);
        g.add(irLed);
      }
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.012, 0.5), new THREE.MeshStandardMaterial({ color: 0xc9973a, roughness: 0.4, metalness: 0.1 }));
      ribbon.position.set(0.46, 0.1, 0.12);
      ribbon.rotation.y = 0.15;
      const zif = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.4, metalness: 0.3 }));
      zif.position.set(0.34, 0.1, -0.02);
      zif.rotation.y = 0.15;
      lens.castShadow = ribbon.castShadow = zif.castShadow = true;
      g.add(lens, glass, ribbon, zif);
      ledPos = [0, 0.4, 0.13];
      footprint = [0.7, 0.8];
    } else if (p.id === "sentiment-desk") {
      // large SoC with heat-spreader lid + BGA hint — the "brain" chip that reads and reasons
      body = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.16, 0.85), bodyMat);
      body.position.y = 0.15;
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.05, 0.62), new THREE.MeshStandardMaterial({ color: 0xc7ccd2, metalness: 0.9, roughness: 0.25 }));
      lid.position.set(0, 0.245, 0);
      lid.castShadow = true;
      g.add(lid);
      const socLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.4),
        new THREE.MeshBasicMaterial({ map: makeChipLabelTexture("EA-SOC v2", "SENTIMENT-DESK"), transparent: true })
      );
      socLabel.rotation.x = -Math.PI / 2;
      socLabel.position.set(0, 0.271, 0);
      g.add(socLabel);
      // thermal paste squeeze-out at the lid seam — a thin gray line peeking from under a real heatsink
      const paste = new THREE.Mesh(new THREE.BoxGeometry(0.83, 0.008, 0.005), new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.7, metalness: 0.1 }));
      paste.position.set(0, 0.219, 0.315);
      g.add(paste);
      const paste2 = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.008, 0.63), new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.7, metalness: 0.1 }));
      paste2.position.set(0.415, 0.219, 0);
      g.add(paste2);
      // heat-spreader fins on top — reads as a real thermal solution for the biggest/hottest chip
      for (let fi = -3; fi <= 3; fi++) {
        const fin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0xaab0b8, metalness: 0.85, roughness: 0.3 }));
        fin.position.set(0, 0.29, fi * 0.075);
        fin.castShadow = true;
        g.add(fin);
      }
      for (let i = -2; i <= 2; i++) {
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), solderBallMat);
        ball.position.set(i * 0.18, 0.06, 0.44);
        g.add(ball);
        const ballB = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), solderBallMat);
        ballB.position.set(i * 0.18, 0.06, -0.44);
        g.add(ballB);
        const ballL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), solderBallMat);
        ballL.position.set(-0.53, 0.06, i * 0.16);
        g.add(ballL);
        const ballR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), solderBallMat);
        ballR.position.set(0.53, 0.06, i * 0.16);
        g.add(ballR);
      }
      ledPos = [0, 0.3, -0.44];
      footprint = [1.1, 0.9];
    } else if (p.id === "cc-optimizer") {
      // small SOIC EEPROM/flash chip w/ pin-1 dimple — a data/storage part for a numbers tool
      body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.32), bodyMat);
      body.position.y = 0.14;
      // pin-1 dimple — a small round indent near one corner, not a groove across the whole body
      const dimple = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12), new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: 0.6 }));
      dimple.rotation.x = -Math.PI / 2;
      dimple.position.set(-0.19, 0.201, -0.12);
      g.add(dimple);
      // laser-etched part marking on the package top
      const ccLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.24), new THREE.MeshBasicMaterial({ map: makeChipLabelTexture("24LC256", "ATMEL"), transparent: true }));
      ccLabel.rotation.x = -Math.PI / 2;
      ccLabel.position.set(0, 0.202, 0);
      g.add(ccLabel);
      // true gull-wing SOIC leads: short vertical shoulder off the body, foot bent flat to meet the pad
      for (let side = -1; side <= 1; side += 2)
        for (let i = -2; i <= 2; i++) {
          const leadZ = i * 0.06;
          const shoulder = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.032), pinMat);
          shoulder.position.set(side * 0.265, 0.1, leadZ);
          g.add(shoulder);
          const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.032), pinMat);
          foot.position.set(side * 0.335, 0.062, leadZ);
          g.add(foot);
          // tiny solder fillet where each gull-wing foot meets the pad
          const leadFillet = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 0.6, roughness: 0.5 }));
          leadFillet.position.set(side * 0.365, 0.058, leadZ);
          leadFillet.scale.set(1, 0.5, 1);
          g.add(leadFillet);
        }
      ledPos = [0, 0.24, 0];
      footprint = [0.7, 0.5];
      // 0402 decoupling caps tucked right against the package — standard practice next to any real IC
      ([[-0.18, 0.24], [0.18, 0.24]] as [number, number][]).forEach(([dx, dz]) => {
        const dc = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.022), new THREE.MeshStandardMaterial({ color: 0x8a5a2e, roughness: 0.3 }));
        dc.position.set(dx, 0.075, dz);
        g.add(dc);
      });
    } else {
      // through-hole microcontroller + LED + pushbutton cluster — used for reaction-game and
      // quant-options-pipeline (both are "the actual Arduino/dev-board parts" treatment)
      body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.32), bodyMat);
      body.position.y = 0.22;
      for (let side = -1; side <= 1; side += 2)
        for (let i = -3; i <= 3; i++) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.02), pinMat);
          leg.position.set(side * 0.28, 0.09, i * 0.045);
          g.add(leg);
          const solderBlob = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), new THREE.MeshStandardMaterial({ color: 0xcfd4d8, metalness: 0.6, roughness: 0.5 }));
          solderBlob.position.set(side * 0.28, 0.008, i * 0.045);
          solderBlob.scale.set(1, 0.6, 1);
          g.add(solderBlob);
        }
      // laser-etched part marking on the DIP package top
      const mcuLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.42, 0.24),
        new THREE.MeshBasicMaterial({ map: makeChipLabelTexture("ATMEGA328P", "MICROCHIP"), transparent: true })
      );
      mcuLabel.rotation.x = -Math.PI / 2;
      mcuLabel.position.set(-0.05, 0.311, 0.02);
      g.add(mcuLabel);
      // real 5mm THT LED: cylindrical clear/tinted base + hemispherical lens + two legs — the dome mesh
      // IS the animated emissive part, not a separate box floating behind it
      const ledBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.058, 0.07, 16),
        new THREE.MeshPhysicalMaterial({ color: 0x555b62, transparent: true, opacity: 0.72, roughness: 0.15, transmission: 0.35, emissive: 0x555b62, emissiveIntensity: 0.06 })
      );
      ledBase.position.set(0.42, 0.1, 0.18);
      ledBase.name = p.id + "_dome";
      g.add(ledBase);
      const ledLens = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), ledBase.material);
      ledLens.position.set(0.42, 0.135, 0.18);
      g.add(ledLens);
      realLedMesh = ledLens;
      const ledLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.09, 6), pinMat);
      ledLegL.position.set(0.395, 0.02, 0.18);
      g.add(ledLegL);
      const ledLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.11, 6), pinMat);
      ledLegR.position.set(0.445, 0.015, 0.18);
      g.add(ledLegR);
      // tactile switch: metal shell can with a small colored actuator button, not a solid plastic cylinder
      const btnShell = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.055, 0.16), new THREE.MeshStandardMaterial({ color: 0xb0b6bc, metalness: 0.85, roughness: 0.3 }));
      btnShell.position.set(0.42, 0.1, -0.18);
      g.add(btnShell);
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.025, 16), new THREE.MeshStandardMaterial({ color: 0x8a2f2f, roughness: 0.5 }));
      btn.position.set(0.42, 0.14, -0.18);
      g.add(btn);
      for (let lx = -1; lx <= 1; lx += 2)
        for (let lz = -1; lz <= 1; lz += 2) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.03, 0.012), pinMat);
          leg.position.set(0.42 + lx * 0.075, 0.075, -0.18 + lz * 0.075);
          g.add(leg);
        }
      ledPos = [-0.2, 0.32, 0];
      footprint = [0.9, 0.8];
      // crystal resonator can — real dev-board MCUs always sit beside one for their clock
      const xtal = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.05), new THREE.MeshStandardMaterial({ color: 0xc7ccd2, metalness: 0.85, roughness: 0.3 }));
      xtal.position.set(-0.34, 0.11, -0.24);
      xtal.castShadow = true;
      g.add(xtal);
      for (const dz of [-0.015, 0.015]) {
        const xleg = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.05, 0.008), pinMat);
        xleg.position.set(-0.34, 0.06, -0.24 + dz);
        g.add(xleg);
      }
    }
    body.name = p.id + "_body";
    body.castShadow = true;
    g.add(body);

    // contact shadow decal — soft dark ellipse directly under the footprint, grounds the chip against the board
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(Math.max(footprint[0], footprint[1]) * 0.62, 24),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.002;
    g.add(contactShadow);

    // solder fillet — subtle bright ring at the base where the chip meets the board
    const fillet = new THREE.Mesh(
      new THREE.RingGeometry(Math.max(footprint[0], footprint[1]) * 0.36, Math.max(footprint[0], footprint[1]) * 0.44, 24),
      new THREE.MeshStandardMaterial({ color: 0xd8b25a, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    fillet.rotation.x = -Math.PI / 2;
    fillet.position.y = 0.005;
    g.add(fillet);

    const ledColor = archived ? 0x555b62 : p.color;
    let ledMat: THREE.MeshStandardMaterial;
    let led: THREE.Mesh;
    if (realLedMesh) {
      ledMat = realLedMesh.material as THREE.MeshStandardMaterial;
      ledMat.emissive.setHex(ledColor);
      (ledMat as THREE.MeshPhysicalMaterial).color.setHex(archived ? 0x3a3d42 : 0x555b62);
      ledMat.emissiveIntensity = archived ? 0.08 : 0.7;
      led = realLedMesh;
    } else {
      ledMat = new THREE.MeshStandardMaterial({ color: ledColor, emissive: ledColor, emissiveIntensity: archived ? 0.08 : 0.7, roughness: 0.3 });
      led = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.1), ledMat);
      led.position.set(ledPos[0], ledPos[1], ledPos[2]);
      led.name = p.id + "_led";
      g.add(led);
    }
    // additive glow sprite behind the LED — cheap bloom substitute so active LEDs read as genuinely lit,
    // without a full-screen post-process pass (which breaks page-background transparency)
    const glowSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: ledColor, transparent: true, opacity: archived ? 0.08 : 0.5, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    glowSprite.scale.set(0.32, 0.32, 1);
    glowSprite.position.set(ledPos[0], ledPos[1] + 0.01, ledPos[2]);
    g.add(glowSprite);

    if (archived) {
      const dust = new THREE.Mesh(new THREE.PlaneGeometry(footprint[0], footprint[1]), new THREE.MeshBasicMaterial({ color: 0x9aa6b2, transparent: true, opacity: 0.18 }));
      dust.rotation.x = -Math.PI / 2;
      dust.position.y = 0.4;
      g.add(dust);
    }
    g.position.set(p.pos[0], 0.07, p.pos[2]);
    g.scale.set(0.001, 0.001, 0.001);
    scene.add(g);
    pickables.push(body, led);
    chips.push({
      group: g,
      led: ledMat,
      body: bodyMat,
      tintColor: p.color,
      status: p.status,
      restY: 0.07,
      id: p.id,
      curY: 0.07,
      phase: Math.random() * 6.28,
      bootIn: null,
      bootDone: false,
      eject: null,
      glow: glowSprite,
    });
  });

  const bootDelay = 550;
  function runBootSequence() {
    boardTopMat.opacity = boardEdgeMat.opacity = boardBottomMat.opacity = 0;
    chips.forEach((c) => {
      c.group.scale.set(0.001, 0.001, 0.001);
      c.bootIn = null;
      c.bootDone = false;
    });
    setTimeout(() => {
      boardTopMat.opacity = boardEdgeMat.opacity = boardBottomMat.opacity = 1;
    }, bootDelay * 0.3);
    chips.forEach((c, i) => setTimeout(() => { c.bootIn = performance.now(); }, bootDelay + i * 160));
  }
  let wasVisible = true;
  runBootSequence();
  const bootObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !wasVisible) runBootSequence();
      wasVisible = entry.isIntersecting;
    });
  }, { threshold: 0.35 });
  bootObserver.observe(mountEl);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered: THREE.Object3D | null = null;
  const pulses: { mesh: THREE.Mesh; target: THREE.Object3D; t: number }[] = [];

  function spawnPulse(target: THREE.Object3D) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    m.position.set(0, 0.1, 0);
    scene.add(m);
    pulses.push({ mesh: m, target, t: 0 });
  }

  function pick(clientX: number, clientY: number) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    if (!hits.length) return null;
    let obj: THREE.Object3D | null = hits[0].object;
    while (obj && !obj.userData.projectId) obj = obj.parent;
    return obj;
  }

  const cursorProbe =
    'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27><g fill=%27none%27 stroke=%27%234ee1ff%27 stroke-width=%272%27><circle cx=%2712%27 cy=%2712%27 r=%277%27/><line x1=%2712%27 y1=%271%27 x2=%2712%27 y2=%277%27/><line x1=%2712%27 y1=%2717%27 x2=%2712%27 y2=%2723%27/><line x1=%271%27 y1=%2712%27 x2=%277%27 y2=%2712%27/><line x1=%2717%27 y1=%2712%27 x2=%2723%27 y2=%2712%27/></g></svg>") 12 12, crosshair';
  renderer.domElement.style.cursor = cursorProbe;

  let hoveredId: string | null = null;
  let selectedId: string | null = null;

  function onPointerMove(e: PointerEvent) {
    const chip = pick(e.clientX, e.clientY);
    if (hovered && hovered !== chip) {
      hovered.scale.set(1, 1, 1);
      hovered = null;
    }
    if (chip) {
      chip.scale.set(1.25, 1.55, 1.25);
      hovered = chip;
      hoveredId = chip.userData.projectId;
      const last = chip.userData.lastPulse as number | undefined;
      if (!last || performance.now() - last > 260) {
        spawnPulse(chip);
        chip.userData.lastPulse = performance.now();
      }
      opts.onHover(chip.userData.projectId);
    } else {
      hoveredId = null;
      opts.onHover(null);
    }
  }
  function onClick(e: MouseEvent) {
    const chip = pick(e.clientX, e.clientY);
    if (!chip) return;
    const c = chips.find((x) => x.group === chip);
    if (c) c.eject = performance.now();
    opts.onSelect(chip.userData.projectId);
  }
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("click", onClick);

  const resizeObserver = new ResizeObserver(() => {
    const w = mountEl.clientWidth;
    const h = mountEl.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  resizeObserver.observe(mountEl);

  function scrollTilt() {
    const range = window.innerHeight * 1.3;
    return Math.max(0, Math.min(1, window.scrollY / range));
  }

  let smoothTilt = 0;
  let destroyed = false;
  const clock = new THREE.Clock();

  function animate() {
    if (destroyed) return;
    const t = clock.getElapsedTime();
    const st = scrollTilt();
    smoothTilt += (st - smoothTilt) * 0.04;
    controls.target.x += (smoothTilt * 0.2 - controls.target.x) * 0.06;
    controls.target.y += (smoothTilt * 0.1 - controls.target.y) * 0.06;
    controls.update();

    // real copper at rest — near-zero self-illumination; only boot sweep / hover / select light it up
    (spine.material as THREE.MeshStandardMaterial).emissiveIntensity = Math.max(0, st - 0.85) * 0.9;
    spine.position.y = traceBaseY + st * 0.01;
    PROJECTS.forEach((p) => {
      const ct = chipTraces[p.id];
      const active = p.id === hoveredId || p.id === selectedId;
      const targetGlow = active ? 1.1 : Math.max(0, st - 0.85) * 0.6;
      const targetY = active ? traceBaseY + 0.045 : traceBaseY;
      const segMat = ct.seg.material as THREE.MeshStandardMaterial;
      segMat.emissiveIntensity += (targetGlow - segMat.emissiveIntensity) * 0.15;
      ct.seg.position.y += (targetY - ct.seg.position.y) * 0.15;
      const viaMat2 = ct.via.material as THREE.MeshStandardMaterial;
      viaMat2.emissiveIntensity = segMat.emissiveIntensity;
      ct.via.position.y = ct.seg.position.y;
    });

    chips.forEach((c) => {
      if (c.bootIn && !c.bootDone) {
        const p = Math.min(1, (performance.now() - c.bootIn) / 380);
        const s = 1 - Math.pow(1 - p, 3);
        c.group.scale.set(s, s, s);
        if (p >= 1) c.bootDone = true;
      } else if (c.bootDone && !c.eject && c.group !== hovered && c.id !== selectedId) {
        const breathe = 1 + Math.sin(t * 1.3 + c.phase) * 0.016;
        c.group.scale.set(breathe, breathe, breathe);
      }
      if (c.status === "building") c.led.emissiveIntensity = 0.45 + Math.sin(t * 4) * 0.35;
      if (c.status === "live" || c.status === "built") c.led.emissiveIntensity = 0.65 + Math.sin(t * 1.5) * 0.1;
      c.glow.material.opacity = c.led.emissiveIntensity * 0.55;
      if (c.eject) {
        const dur = 550;
        const p = Math.min(1, (performance.now() - c.eject) / dur);
        const landY = c.restY + (c.id === selectedId ? 0.42 : 0);
        c.group.position.y = c.restY + (landY - c.restY) * easeOutBack(p);
        c.group.rotation.y = Math.sin(p * Math.PI) * 0.3;
        if (p >= 1) {
          c.group.position.y = landY;
          c.curY = landY;
          c.group.rotation.y = 0;
          c.eject = null;
        }
      } else {
        const targetY = c.restY + (c.id === selectedId ? 0.42 : 0);
        c.curY += (targetY - c.curY) * 0.08;
        c.group.position.y = c.curY;
        if (c.id === selectedId) {
          const s = 1 + Math.sin(t * 1.6 + c.phase) * 0.02 + 0.22;
          c.group.scale.set(s, s, s);
        }
      }
      const activeChip = c.id === selectedId;
      const targetEmis = activeChip ? 0.55 : 0;
      c.body.emissive.setHex(c.tintColor);
      c.body.emissiveIntensity += (targetEmis - c.body.emissiveIntensity) * 0.12;
    });
    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i];
      pu.t += 0.045;
      if (pu.t >= 1) {
        scene.remove(pu.mesh);
        pulses.splice(i, 1);
        continue;
      }
      const tp = pu.target.position;
      pu.mesh.position.set(tp.x * pu.t, 0.1 + Math.sin(pu.t * Math.PI) * 0.15, tp.z * pu.t);
      (pu.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - pu.t;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  return {
    setSelected(id: string | null) {
      selectedId = id;
    },
    triggerEject(id: string) {
      const c = chips.find((x) => x.id === id);
      if (c) c.eject = performance.now();
    },
    destroy() {
      destroyed = true;
      if (!pmremDisposed) {
        cancelAnimationFrame(pmremFrame);
        pmrem.dispose();
      }
      bootObserver.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (renderer.domElement.parentElement === mountEl) mountEl.removeChild(renderer.domElement);
    },
  };
}
