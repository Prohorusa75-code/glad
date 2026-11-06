"use client";

import { useEffect, useRef } from "react";

/* Живой фон «шёлк»: несколько волн складываются в мягкие складки ткани,
   по сгибам скользит свет. Свет чуть смещается за курсором.
   Рисуем в пониженном разрешении и только когда фон виден на экране. */

const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;

float folds(vec2 p, float t){
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float a = 0.55 + fi * 0.42;
    vec2 d = vec2(cos(a), sin(a));
    float w = dot(p, d) * (1.35 + fi * 0.6)
            + sin(dot(p, d.yx) * 1.3 + t * (0.22 + fi * 0.05)) * 0.9
            + t * (0.10 + fi * 0.035);
    h += sin(w) / (1.0 + fi * 0.75);
  }
  return h;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0) * 3.4;
  float t = uTime;

  float e = 0.008;
  float h  = folds(p, t);
  float hx = folds(p + vec2(e, 0.0), t);
  float hy = folds(p + vec2(0.0, e), t);
  vec3 n = normalize(vec3((h - hx) / e, (h - hy) / e, 2.2));

  vec3 light = normalize(vec3(uMouse.x * 1.4 - 0.5, uMouse.y * 1.2 - 0.2, 1.0));
  float diff = clamp(dot(n, light), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 36.0);
  float crease = smoothstep(0.55, 1.0, 1.0 - abs(n.z));

  vec3 deep  = vec3(0.012, 0.018, 0.045);
  vec3 cloth = vec3(0.10, 0.20, 0.48);
  vec3 sheen = vec3(0.62, 0.78, 1.0);
  vec3 col = mix(deep, cloth, pow(diff, 2.2));
  col += sheen * spec * 0.85;
  col += vec3(0.45, 0.62, 1.0) * crease * 0.18;

  // виньетка и затемнение снизу, чтобы текст всегда читался
  float vig = smoothstep(1.35, 0.2, length((uv - vec2(0.55, 0.6)) * vec2(1.0, 1.25)));
  col *= mix(0.35, 1.0, vig);
  col *= mix(0.45, 1.0, smoothstep(0.0, 0.55, uv.y));

  gl_FragColor = vec4(col, 1.0);
}`;

export function SilkBackground({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) {
      canvas.style.background = "radial-gradient(120% 90% at 60% 30%, #1b3a7a, #050608 70%)";
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
      canvas.style.background = "radial-gradient(120% 90% at 60% 30%, #1b3a7a, #050608 70%)";
      return;
    }
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = 0.6, my = 0.65, tx = mx, ty = my;
    let raf = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const k = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * k));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * k));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 8 + (now - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      raf = visible && !still ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    };
    const onResize = () => {
      resize();
      if (!raf) draw(performance.now());
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf && !still) raf = requestAnimationFrame(loop);
    });

    resize();
    draw(start); // первый кадр сразу, не дожидаясь анимации
    io.observe(canvas);
    if (!still) raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className={`block h-full w-full ${className}`} aria-hidden="true" />;
}
