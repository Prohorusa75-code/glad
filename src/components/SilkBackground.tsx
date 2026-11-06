"use client";

import { useEffect, useRef } from "react";

/* Живой фон «шёлк».
   — Ткань всё время медленно течёт: несколько волн складываются в складки.
   — Под курсором ткань «продавливается», а от движения мыши расходится рябь.
   — Свет скользит по сгибам вслед за курсором; если мышь не двигается
     (или это телефон), свет сам плавно гуляет по ткани.
   Рисуем в пониженном разрешении и только пока фон виден на экране. */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;   // курсор в координатах холста, 0..1
uniform float uPress;  // насколько ткань продавлена под курсором
uniform float uRipple; // сила ряби от движения мыши
uniform vec2 uLight;   // откуда падает свет, 0..1

const float SCALE = 3.4;

float folds(vec2 p, float t){
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float a = 0.55 + fi * 0.42;
    vec2 d = vec2(cos(a), sin(a));
    float w = dot(p, d) * (1.35 + fi * 0.6)
            + sin(dot(p, d.yx) * 1.3 + t * (0.42 + fi * 0.09)) * 0.9
            + t * (0.26 + fi * 0.07);
    h += sin(w) / (1.0 + fi * 0.75);
  }
  return h;
}

float surface(vec2 p, vec2 m, float t){
  float h = folds(p, t);
  float d = length(p - m);
  h -= uPress * 1.25 * exp(-d * d * 1.6);                          // вмятина под курсором
  h += uRipple * 0.55 * sin(d * 7.0 - t * 6.0) * exp(-d * 1.1);  // круги от движения
  return h;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (uv - 0.5) * aspect * SCALE;
  vec2 m = (uMouse - 0.5) * aspect * SCALE;
  float t = uTime;

  // ткань чуть покачивается целиком, как от сквозняка
  float sway = sin(t * 0.21) * 0.12;
  p = mat2(cos(sway), -sin(sway), sin(sway), cos(sway)) * p;

  float e = 0.008;
  float h  = surface(p, m, t);
  float hx = surface(p + vec2(e, 0.0), m, t);
  float hy = surface(p + vec2(0.0, e), m, t);
  vec3 n = normalize(vec3((h - hx) / e, (h - hy) / e, 2.2));

  vec3 light = normalize(vec3(uLight.x * 1.0 - 0.35, uLight.y * 0.9 - 0.15, 1.0));
  float diff = clamp(dot(n, light), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 26.0);
  float crease = smoothstep(0.55, 1.0, 1.0 - abs(n.z));

  vec3 deep  = vec3(0.012, 0.018, 0.045);
  vec3 cloth = vec3(0.10, 0.20, 0.48);
  vec3 sheen = vec3(0.62, 0.78, 1.0);
  vec3 col = mix(deep, cloth, pow(diff, 2.2));
  col += sheen * spec * 0.9;
  col += vec3(0.45, 0.62, 1.0) * crease * 0.18;

  // мягкое свечение там, где курсор касается ткани
  col += vec3(0.18, 0.32, 0.75) * uPress * 0.35 * exp(-length((uv - uMouse) * aspect) * 5.0);

  // виньетка и затемнение снизу, чтобы текст всегда читался
  float vig = smoothstep(1.35, 0.2, length((uv - vec2(0.55, 0.6)) * vec2(1.0, 1.25)));
  col *= mix(0.35, 1.0, vig);
  col *= mix(0.45, 1.0, smoothstep(0.0, 0.55, uv.y));

  gl_FragColor = vec4(col, 1.0);
}`;

const FALLBACK = "radial-gradient(120% 90% at 60% 30%, #1b3a7a, #050608 70%)";

export function SilkBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      canvas.style.background = FALLBACK;
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.background = FALLBACK;
      return;
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse");
    const uPress = u("uPress"), uRipple = u("uRipple"), uLight = u("uLight");

    // Если в системе включено «меньше движения» — не замираем, а двигаемся спокойнее.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = calm ? 0.55 : 1;

    const state = {
      mouse: { x: 0.62, y: 0.6 }, target: { x: 0.62, y: 0.6 },
      light: { x: 0.6, y: 0.65 },
      press: 0, pressTarget: 0, ripple: 0,
      lastMove: -1e9, time: 8, last: performance.now(),
    };
    let raf = 0;
    let visible = true;

    const resize = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * k));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * k));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;
      state.time += dt * speed;
      const idle = now - state.lastMove > 2500;

      // мышь не двигается — свет и «палец» сами плавно гуляют по ткани
      if (idle) {
        const t = state.time;
        state.target.x = 0.58 + Math.sin(t * 0.33) * 0.22;
        state.target.y = 0.6 + Math.sin(t * 0.47 + 1.3) * 0.16;
        state.pressTarget = 0;
      }
      const ease = 1 - Math.pow(0.001, dt); // одинаково плавно при любой частоте кадров
      state.mouse.x += (state.target.x - state.mouse.x) * ease * 0.9;
      state.mouse.y += (state.target.y - state.mouse.y) * ease * 0.9;
      state.light.x += (state.mouse.x - state.light.x) * ease * 0.5;
      state.light.y += (state.mouse.y - state.light.y) * ease * 0.5;
      state.press += (state.pressTarget - state.press) * ease * 0.6;
      state.ripple *= Math.pow(0.25, dt); // рябь затухает

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, state.time);
      gl.uniform2f(uMouse, state.mouse.x, state.mouse.y);
      gl.uniform1f(uPress, state.press);
      gl.uniform1f(uRipple, Math.min(1, state.ripple));
      gl.uniform2f(uLight, state.light.x, state.light.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      step(now);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      if (inside) {
        const dx = x - state.target.x, dy = y - state.target.y;
        state.ripple = Math.min(1.2, state.ripple + Math.hypot(dx, dy) * 6);
        state.pressTarget = 1;
      } else {
        state.pressTarget = 0;
      }
      state.target.x = Math.min(1.1, Math.max(-0.1, x));
      state.target.y = Math.min(1.1, Math.max(-0.1, y));
      state.lastMove = performance.now();
    };
    const onLeave = () => (state.pressTarget = 0);
    const onResize = () => {
      resize();
      if (!raf) step(performance.now());
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        state.last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });

    resize();
    step(state.last); // первый кадр сразу, не дожидаясь анимации
    io.observe(canvas);
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
