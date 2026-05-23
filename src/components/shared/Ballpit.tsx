"use client";

import { useEffect, useRef } from "react";
import {
  Vector3 as a,
  MeshPhysicalMaterial as c,
  InstancedMesh as d,
  Clock as e,
  AmbientLight as f,
  SphereGeometry as g,
  ShaderChunk as h,
  Scene as i,
  Color as l,
  Object3D as m,
  SRGBColorSpace as n,
  MathUtils as o,
  PMREMGenerator as p,
  Vector2 as r,
  WebGLRenderer as s,
  PerspectiveCamera as t,
  PointLight as u,
  ACESFilmicToneMapping as v,
  Plane as w,
  Raycaster as y,
  WebGLRendererParameters,
} from "three";
import { RoomEnvironment as z } from "three/examples/jsm/environments/RoomEnvironment.js";

interface BallpitConfig {
  count: number;
  colors: (number | string)[];
  ambientColor: number;
  ambientIntensity: number;
  lightIntensity: number;
  materialParams: {
    metalness: number;
    roughness: number;
    clearcoat: number;
    clearcoatRoughness: number;
  };
  minSize: number;
  maxSize: number;
  size0: number;
  gravity: number;
  friction: number;
  wallBounce: number;
  maxVelocity: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  controlSphere0: boolean;
  followCursor: boolean;
}

type RenderTime = { elapsed: number; delta: number };
type EngineSize = {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
  pixelRatio: number;
};

type EngineOptions = {
  canvas?: HTMLCanvasElement;
  id?: string;
  size?: { width: number; height: number } | "parent";
  rendererOptions?: WebGLRendererParameters;
};

type InteractionState = {
  position: r;
  nPosition: r;
  hover: boolean;
  touching: boolean;
  onEnter: (state: InteractionState) => void;
  onMove: (state: InteractionState) => void;
  onClick: (state: InteractionState) => void;
  onLeave: (state: InteractionState) => void;
  dispose?: () => void;
};

type InteractionConfig = {
  domElement: HTMLElement;
  onEnter?: (state: InteractionState) => void;
  onMove?: (state: InteractionState) => void;
  onClick?: (state: InteractionState) => void;
  onLeave?: (state: InteractionState) => void;
};

type ShaderPayload = {
  uniforms: Record<string, unknown>;
  fragmentShader: string;
};

type PostProcessing = {
  render: () => void;
  setSize: (width: number, height: number) => void;
  dispose?: () => void;
};

type ThicknessUniforms = {
  thicknessDistortion: { value: number };
  thicknessAmbient: { value: number };
  thicknessAttenuation: { value: number };
  thicknessPower: { value: number };
  thicknessScale: { value: number };
};

const X: BallpitConfig = {
  count: 200,
  colors: [0, 0, 0],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

class x {
  #e: EngineOptions;
  canvas: HTMLCanvasElement | null = null;
  camera!: t;
  cameraMinAspect?: number;
  cameraMaxAspect?: number;
  cameraFov!: number;
  maxPixelRatio?: number;
  minPixelRatio?: number;
  scene!: i;
  renderer!: s;
  #t: PostProcessing | null = null;
  size: EngineSize = {
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    ratio: 0,
    pixelRatio: 0,
  };
  render = this.#i;
  onBeforeRender: (time: RenderTime) => void = () => {};
  onAfterRender: (time: RenderTime) => void = () => {};
  onAfterResize: (size: EngineSize) => void = () => {};
  #s = false;
  #n = false;
  isDisposed = false;
  #o?: IntersectionObserver;
  #r?: ResizeObserver;
  #a?: ReturnType<typeof setTimeout>;
  #c = new e();
  #h: RenderTime = { elapsed: 0, delta: 0 };
  #l?: number;
  constructor(e: EngineOptions) {
    this.#e = { ...e };
    this.#m();
    this.#d();
    this.#p();
    this.resize();
    this.#g();
  }
  #m() {
    this.camera = new t();
    this.cameraFov = this.camera.fov;
  }
  #d() {
    this.scene = new i();
  }
  #p() {
    if (this.#e.canvas) {
      this.canvas = this.#e.canvas;
    } else if (this.#e.id) {
      this.canvas = document.getElementById(this.#e.id) as HTMLCanvasElement;
    }
    if (this.canvas) {
      this.canvas.style.display = "block";
    }
    const e: WebGLRendererParameters = {
      canvas: this.canvas || undefined,
      powerPreference: "high-performance",
      ...(this.#e.rendererOptions ?? {}),
    };
    this.renderer = new s(e);
    this.renderer.outputColorSpace = n;
  }
  #g() {
    if (!(this.#e.size instanceof Object)) {
      window.addEventListener("resize", this.#f);
      if (this.#e.size === "parent" && this.canvas?.parentNode) {
        this.#r = new ResizeObserver(this.#f);
        this.#r.observe(this.canvas.parentNode as Element);
      }
    }
    if (this.canvas) {
      this.#o = new IntersectionObserver(this.#u, {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      });
      this.#o.observe(this.canvas);
    }
    document.addEventListener("visibilitychange", this.#v);
  }
  #y() {
    window.removeEventListener("resize", this.#f);
    this.#r?.disconnect();
    this.#o?.disconnect();
    document.removeEventListener("visibilitychange", this.#v);
  }
  #u = (entries: IntersectionObserverEntry[]) => {
    this.#s = entries[0]?.isIntersecting ?? false;
    if (this.#s) {
      this.#w();
    } else {
      this.#z();
    }
  }
  #v = () => {
    if (this.#s) {
      if (document.hidden) {
        this.#z();
      } else {
        this.#w();
      }
    }
  }
  #f = () => {
    if (this.#a) clearTimeout(this.#a);
    this.#a = setTimeout(this.resize.bind(this), 100);
  }
  resize() {
    let e: number;
    let t: number;
    if (this.#e.size instanceof Object) {
      e = this.#e.size.width;
      t = this.#e.size.height;
    } else if (this.#e.size === "parent" && this.canvas?.parentNode) {
      e = (this.canvas.parentNode as HTMLElement).offsetWidth;
      t = (this.canvas.parentNode as HTMLElement).offsetHeight;
    } else {
      e = window.innerWidth;
      t = window.innerHeight;
    }
    this.size.width = e;
    this.size.height = t;
    this.size.ratio = e / t;
    this.#x();
    this.#b();
    this.onAfterResize(this.size);
  }
  #x() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#A(this.cameraMinAspect);
      } else if (
        this.cameraMaxAspect &&
        this.camera.aspect > this.cameraMaxAspect
      ) {
        this.#A(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }
  #A(e: number) {
    const t =
      Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / e);
    this.camera.fov = 2 * o.radToDeg(Math.atan(t));
  }
  updateWorldSize() {
    const e = (this.camera.fov * Math.PI) / 180;
    this.size.wHeight = 2 * Math.tan(e / 2) * this.camera.position.length();
    this.size.wWidth = this.size.wHeight * this.camera.aspect;
  }
  #b() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#t?.setSize(this.size.width, this.size.height);
    let e = window.devicePixelRatio;
    if (this.maxPixelRatio && e > this.maxPixelRatio) {
      e = this.maxPixelRatio;
    } else if (this.minPixelRatio && e < this.minPixelRatio) {
      e = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(e);
    this.size.pixelRatio = e;
  }
  get postprocessing() {
    return this.#t;
  }
  set postprocessing(e: PostProcessing | null) {
    this.#t = e;
    if (e) {
      this.render = e.render.bind(e);
    } else {
      this.render = this.#i;
    }
  }
  #w() {
    if (this.#n) return;
    const animate = () => {
      this.#l = requestAnimationFrame(animate);
      this.#h.delta = this.#c.getDelta();
      this.#h.elapsed += this.#h.delta;
      this.onBeforeRender(this.#h);
      this.render();
      this.onAfterRender(this.#h);
    };
    this.#n = true;
    this.#c.start();
    animate();
  }
  #z() {
    if (this.#n) {
      if (this.#l !== undefined) cancelAnimationFrame(this.#l);
      this.#n = false;
      this.#c.stop();
    }
  }
  #i() {
    this.renderer.render(this.scene, this.camera);
  }
  clear() {
    this.scene.traverse((obj: m) => {
      const mesh = obj as m & {
        isMesh?: boolean;
        material?: Record<string, unknown> | { dispose?: () => void };
        geometry?: { dispose?: () => void };
      };
      if (mesh.isMesh && mesh.material && typeof mesh.material === "object") {
        Object.keys(mesh.material).forEach((key) => {
          const value = (mesh.material as Record<string, unknown>)[key];
          if (
            value &&
            typeof value === "object" &&
            "dispose" in value &&
            typeof (value as { dispose: () => void }).dispose === "function"
          ) {
            (value as { dispose: () => void }).dispose();
          }
        });
        if (
          "dispose" in mesh.material &&
          typeof (mesh.material as { dispose?: () => void }).dispose ===
            "function"
        ) {
          (mesh.material as { dispose: () => void }).dispose();
        }
        if (mesh.geometry?.dispose) {
          mesh.geometry.dispose();
        }
      }
    });
    this.scene.clear();
  }
  dispose() {
    this.#y();
    this.#z();
    this.clear();
    this.#t?.dispose?.();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.isDisposed = true;
  }
}

const b = new Map<HTMLElement, InteractionState>(),
  A = new r();
let R = false;
function S(config: InteractionConfig) {
  const { domElement, ...callbacks } = config;
  const t: InteractionState = {
    position: new r(),
    nPosition: new r(),
    hover: false,
    touching: false,
    onEnter() {},
    onMove() {},
    onClick() {},
    onLeave() {},
    ...callbacks,
  };
  (function (elem: HTMLElement, state: InteractionState) {
    if (!b.has(elem)) {
      b.set(elem, state);
      if (!R) {
        document.body.addEventListener("pointermove", M);
        document.body.addEventListener("pointerleave", L);
        document.body.addEventListener("click", C);

        document.body.addEventListener("touchstart", TouchStart, {
          passive: false,
        });
        document.body.addEventListener("touchmove", TouchMove, {
          passive: false,
        });
        document.body.addEventListener("touchend", TouchEnd, {
          passive: false,
        });
        document.body.addEventListener("touchcancel", TouchEnd, {
          passive: false,
        });

        R = true;
      }
    }
  })(domElement, t);
  t.dispose = () => {
    const elem = domElement;
    b.delete(elem);
    if (b.size === 0) {
      document.body.removeEventListener("pointermove", M);
      document.body.removeEventListener("pointerleave", L);
      document.body.removeEventListener("click", C);

      document.body.removeEventListener("touchstart", TouchStart);
      document.body.removeEventListener("touchmove", TouchMove);
      document.body.removeEventListener("touchend", TouchEnd);
      document.body.removeEventListener("touchcancel", TouchEnd);

      R = false;
    }
  };
  return t;
}

function M(e: PointerEvent) {
  A.x = e.clientX;
  A.y = e.clientY;
  processInteraction();
}

function processInteraction() {
  for (const [elem, t] of Array.from(b.entries())) {
    const i = elem.getBoundingClientRect();
    if (D(i)) {
      P(t, i);
      if (!t.hover) {
        t.hover = true;
        t.onEnter(t);
      }
      t.onMove(t);
    } else if (t.hover && !t.touching) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

function C(e: MouseEvent) {
  A.x = e.clientX;
  A.y = e.clientY;
  for (const [elem, t] of Array.from(b.entries())) {
    const i = elem.getBoundingClientRect();
    P(t, i);
    if (D(i)) t.onClick(t);
  }
}

function L() {
  for (const t of Array.from(b.values())) {
    if (t.hover) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

function TouchStart(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    const firstTouch = e.touches.item(0);
    if (!firstTouch) return;
    A.x = firstTouch.clientX;
    A.y = firstTouch.clientY;

    for (const [elem, t] of Array.from(b.entries())) {
      const rect = elem.getBoundingClientRect();
      if (D(rect)) {
        t.touching = true;
        P(t, rect);
        if (!t.hover) {
          t.hover = true;
          t.onEnter(t);
        }
        t.onMove(t);
      }
    }
  }
}

function TouchMove(e: TouchEvent) {
  if (e.touches.length > 0) {
    e.preventDefault();
    const firstTouch = e.touches.item(0);
    if (!firstTouch) return;
    A.x = firstTouch.clientX;
    A.y = firstTouch.clientY;

    for (const [elem, t] of Array.from(b.entries())) {
      const rect = elem.getBoundingClientRect();
      P(t, rect);

      if (D(rect)) {
        if (!t.hover) {
          t.hover = true;
          t.touching = true;
          t.onEnter(t);
        }
        t.onMove(t);
      } else if (t.hover && t.touching) {
        t.onMove(t);
      }
    }
  }
}

function TouchEnd() {
  for (const [, t] of Array.from(b.entries())) {
    if (t.touching) {
      t.touching = false;
      if (t.hover) {
        t.hover = false;
        t.onLeave(t);
      }
    }
  }
}

function P(state: InteractionState, t: DOMRect) {
  const { position: i, nPosition: s } = state;
  i.x = A.x - t.left;
  i.y = A.y - t.top;
  s.x = (i.x / t.width) * 2 - 1;
  s.y = (-i.y / t.height) * 2 + 1;
}
function D(e: DOMRect) {
  const { x: t, y: i } = A;
  const { left: s, top: n, width: o, height: r } = e;
  return t >= s && t <= s + o && i >= n && i <= n + r;
}

const { randFloat: k, randFloatSpread: E } = o;
const F = new a();
const I = new a();
const O = new a();
const V = new a();
const B = new a();
const N = new a();
const _ = new a();
const j = new a();
const H = new a();
const T = new a();

class W {
  config: BallpitConfig;
  positionData: Float32Array;
  velocityData: Float32Array;
  sizeData: Float32Array;
  center: a;
  constructor(e: BallpitConfig) {
    this.config = e;
    this.positionData = new Float32Array(3 * e.count).fill(0);
    this.velocityData = new Float32Array(3 * e.count).fill(0);
    this.sizeData = new Float32Array(e.count).fill(1);
    this.center = new a();
    this.#R();
    this.setSizes();
  }
  #R() {
    const { config: e, positionData: t } = this;
    this.center.toArray(t, 0);
    for (let i = 1; i < e.count; i++) {
      const s = 3 * i;
      t[s] = E(2 * e.maxX);
      t[s + 1] = E(2 * e.maxY);
      t[s + 2] = E(2 * e.maxZ);
    }
  }
  setSizes() {
    const { config: e, sizeData: t } = this;
    t[0] = e.size0;
    for (let i = 1; i < e.count; i++) {
      t[i] = k(e.minSize, e.maxSize);
    }
  }
  update(e: RenderTime) {
    const {
      config: t,
      center: i,
      positionData: s,
      sizeData: n,
      velocityData: o,
    } = this;
    let r = 0;
    if (t.controlSphere0) {
      r = 1;
      F.fromArray(s, 0);
      F.lerp(i, 0.1).toArray(s, 0);
      V.set(0, 0, 0).toArray(o, 0);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      B.y -= e.delta * t.gravity * n[idx]!;
      B.multiplyScalar(t.friction);
      B.clampLength(0, t.maxVelocity);
      I.add(B);
      I.toArray(s, base);
      B.toArray(o, base);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      const radius = n[idx]!;
      for (let jdx = idx + 1; jdx < t.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(s, otherBase);
        N.fromArray(o, otherBase);
        const otherRadius = n[jdx]!;
        _.copy(O).sub(I);
        const dist = _.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(_)
            .normalize()
            .multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j);
          B.sub(H);
          I.toArray(s, base);
          B.toArray(o, base);
          O.add(j);
          N.add(T);
          O.toArray(s, otherBase);
          N.toArray(o, otherBase);
        }
      }
      if (t.controlSphere0) {
        _.copy(F).sub(I);
        const dist = _.length();
        const sumRadius0 = radius + n[0]!;
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          j.copy(_.normalize()).multiplyScalar(diff);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j);
          B.sub(H);
        }
      }
      if (Math.abs(I.x) + radius > t.maxX) {
        I.x = Math.sign(I.x) * (t.maxX - radius);
        B.x = -B.x * t.wallBounce;
      }
      if (t.gravity === 0) {
        if (Math.abs(I.y) + radius > t.maxY) {
          I.y = Math.sign(I.y) * (t.maxY - radius);
          B.y = -B.y * t.wallBounce;
        }
      } else if (I.y - radius < -t.maxY) {
        I.y = -t.maxY + radius;
        B.y = -B.y * t.wallBounce;
      }
      const maxBoundary = Math.max(t.maxZ, t.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) {
        I.z = Math.sign(I.z) * (t.maxZ - radius);
        B.z = -B.z * t.wallBounce;
      }
      I.toArray(s, base);
      B.toArray(o, base);
    }
  }
}

class Y extends c {
  uniforms: ThicknessUniforms;
  onBeforeCompile2?: (e: ShaderPayload) => void;
  constructor(e: ConstructorParameters<typeof c>[0]) {
    super(e);
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };
    this.defines = { ...(this.defines ?? {}), USE_UV: "" };
    this.onBeforeCompile = (e: ShaderPayload) => {
      Object.assign(e.uniforms, this.uniforms);
      e.fragmentShader =
        "\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      " +
        e.fragmentShader;
      e.fragmentShader = e.fragmentShader.replace(
        "void main() {",
        "\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      "
      );
      const t = h.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        "\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        "
      );
      e.fragmentShader = e.fragmentShader.replace(
        "#include <lights_fragment_begin>",
        t
      );
      if (this.onBeforeCompile2) this.onBeforeCompile2(e);
    };
  }
}

const U = new m();

class Z extends d {
  config: BallpitConfig;
  physics: W;
  ambientLight!: f;
  light!: u;
  constructor(e: s, t: Partial<BallpitConfig> = {}) {
    const i = { ...X, ...t };
    const s = new z();
    const n = new p(e).fromScene(s).texture;
    const o = new g();
    const r = new Y({ envMap: n, ...i.materialParams });
    r.envMapRotation.x = -Math.PI / 2;
    super(o, r, i.count);
    this.config = i;
    this.physics = new W(i);
    this.#S();
    this.setColors(i.colors);
  }
  #S() {
    this.ambientLight = new f(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
    this.add(this.ambientLight);
    this.light = new u(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  setColors(e: BallpitConfig["colors"]) {
    if (Array.isArray(e) && e.length > 1) {
      const t = (() => {
        let palette: BallpitConfig["colors"] = [];
        let stops: l[] = [];
        function setColors(colors: BallpitConfig["colors"]) {
          palette = colors;
          stops = [];
          palette.forEach((col) => {
            stops.push(new l(col));
          });
        }
        setColors(e);
        return {
          setColors,
          getColorAt: function (ratio: number, out = new l()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (palette.length - 1);
            const idx = Math.floor(scaled);
            const start = stops[idx];
            if (!start) return out;
            if (idx >= palette.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = stops[idx + 1] ?? start;
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          },
        };
      })();
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, t.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(t.getColorAt(idx / this.count));
        }
      }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }
  update(e: RenderTime) {
    this.physics.update(e);
    for (let idx = 0; idx < this.count; idx++) {
      U.position.fromArray(this.physics.positionData, 3 * idx);
      if (idx === 0 && this.config.followCursor === false) {
        U.scale.setScalar(0);
      } else {
        U.scale.setScalar(this.physics.sizeData[idx]!);
      }
      U.updateMatrix();
      this.setMatrixAt(idx, U.matrix);
      if (idx === 0) this.light.position.copy(U.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(e: HTMLCanvasElement, t: Partial<BallpitConfig> = {}) {
  const i = new x({
    canvas: e,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });
  let s: Z;
  i.renderer.toneMapping = v;
  i.camera.position.set(0, 0, 20);
  i.camera.lookAt(0, 0, 0);
  i.cameraMaxAspect = 1.5;
  i.resize();
  initialize(t);
  const n = new y();
  const o = new w(new a(0, 0, 1), 0);
  const r = new a();
  let c = false;

  e.style.touchAction = "none";
  e.style.userSelect = "none";
  e.style.webkitUserSelect = "none";

  const h = S({
    domElement: e,
    onMove() {
      n.setFromCamera(h.nPosition, i.camera);
      i.camera.getWorldDirection(o.normal);
      n.ray.intersectPlane(o, r);
      s.physics.center.copy(r);
      s.config.controlSphere0 = true;
    },
    onLeave() {
      s.config.controlSphere0 = false;
    },
  });
  function initialize(e: Partial<BallpitConfig>) {
    if (s) {
      i.clear();
      i.scene.remove(s);
    }
    s = new Z(i.renderer, e);
    i.scene.add(s);
  }
  i.onBeforeRender = (e) => {
    if (!c) s.update(e);
  };
  i.onAfterResize = (e) => {
    s.config.maxX = e.wWidth / 2;
    s.config.maxY = e.wHeight / 2;
  };
  return {
    three: i,
    get spheres() {
      return s;
    },
    setCount(e: number) {
      initialize({ ...s.config, count: e });
    },
    togglePause() {
      c = !c;
    },
    dispose() {
      h.dispose?.();
      i.dispose();
    },
  };
}

interface BallpitProps extends Partial<BallpitConfig> {
  className?: string;
}

const Ballpit = ({
  className = "",
  followCursor = true,
  ...props
}: BallpitProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spheresInstanceRef = useRef<ReturnType<typeof createBallpit> | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spheresInstanceRef.current = createBallpit(canvas, {
      followCursor,
      ...props,
    });

    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default Ballpit;
