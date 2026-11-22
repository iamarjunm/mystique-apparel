"use client";

import { useEffect, useRef, useState } from "react";

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_motion;

mat2 rot2(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

// Smooth minimum for liquid obsidian-chrome sculptural blending
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Sculptural folded monolith + twisted knotted torus with subtle cloth-ripple displacement
float mapScene(vec3 p, out float matMix) {
  float t = u_time * 0.32 * u_motion;

  // Interactive camera/object orbit
  vec3 q = p;
  q.xz *= rot2(u_mouse.x * 0.72 + t * 0.55);
  q.yz *= rot2(u_mouse.y * 0.52 + sin(t * 0.7) * 0.22);

  // Subtle sculptural twist along Y axis
  vec3 twisted = q;
  twisted.xz *= rot2(twisted.y * 0.65 + sin(t * 0.6) * 0.35);

  // Primary knotted torus sculpture (trefoil-inspired harmonic fold)
  float ang = atan(twisted.z, twisted.x);
  vec2 ring = vec2(length(twisted.xz) - 0.86, twisted.y);
  ring *= rot2(ang * 1.5 + t * 0.65);

  // Architectural ribbon cross-section (beveled oval/blade profile)
  vec2 blade = abs(ring) - vec2(0.24, 0.095);
  float dKnot = length(max(blade, 0.0)) + min(max(blade.x, blade.y), 0.0) - 0.055;

  // Secondary counter-folded obsidian monolith ring
  vec3 q2 = q;
  q2.xy *= rot2(0.78 + cos(t * 0.5) * 0.25);
  q2.yz *= rot2(0.55 - t * 0.35);
  vec2 t2 = vec2(length(q2.xz) - 0.64, q2.y);
  float dRibbon = length(t2) - 0.145;

  // Central faceted obsidian core
  vec3 q3 = q;
  q3.xy *= rot2(-t * 0.45);
  q3.xz *= rot2(t * 0.35);
  vec3 b = abs(q3) - vec3(0.32, 0.56, 0.22);
  float dCore = length(max(b, 0.0)) + min(max(b.x, max(b.y, b.z)), 0.0) - 0.09;

  // Subtle tailored cloth-ripple displacement
  float ripple =
    sin(q.x * 5.2 + t * 1.35) *
    cos(q.y * 4.8 - t * 1.05) *
    sin(q.z * 5.0 + t * 0.9) * 0.018;

  // Micro architectural fluting on the monolith
  float flute = sin(ang * 12.0 + q.y * 6.0) * 0.0055;

  float dSculpt = smin(dKnot, dRibbon, 0.26);
  float dFinal = smin(dSculpt, dCore, 0.32) + ripple + flute;

  // Material blend factor: 0.0 = brushed obsidian, 1.0 = liquid chrome edge
  matMix = smoothstep(-0.18, 0.32, dCore - dKnot);
  return dFinal;
}

vec3 calcNormal(vec3 p) {
  float m;
  vec2 e = vec2(0.0022, -0.0022);
  return normalize(
    e.xyy * mapScene(p + e.xyy, m) +
    e.yyx * mapScene(p + e.yyx, m) +
    e.yxy * mapScene(p + e.yxy, m) +
    e.xxx * mapScene(p + e.xxx, m)
  );
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0;
  float sca = 1.0;
  float m;
  for (int i = 0; i < 4; i++) {
    float h = 0.04 + 0.14 * float(i);
    float d = mapScene(p + n * h, m);
    occ += (h - d) * sca;
    sca *= 0.65;
  }
  return clamp(1.0 - 2.1 * occ, 0.0, 1.0);
}

// Studio monochrome softbox environment reflection
vec3 studioEnv(vec3 r) {
  // Subtle zenith-to-floor monochrome gradient
  float y = clamp(r.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 env = mix(vec3(0.025, 0.025, 0.028), vec3(0.11, 0.108, 0.102), y);

  // Overhead primary bone softbox (#F4F2ED)
  float box1 = smoothstep(0.62, 0.94, dot(r, normalize(vec3(-0.35, 0.85, 0.38))));
  env += vec3(0.96, 0.95, 0.92) * box1 * 1.45;

  // Sharp vertical right architectural light strip (silver-bone)
  float strip = smoothstep(0.76, 0.97, dot(r, normalize(vec3(0.88, 0.18, 0.44))));
  env += vec3(0.88, 0.87, 0.84) * strip * 1.25;

  // Rim back-left cool ash kicker
  float rimBox = smoothstep(0.58, 0.92, dot(r, normalize(vec3(-0.78, -0.15, -0.60))));
  env += vec3(0.56, 0.55, 0.53) * rimBox * 0.85;

  // Subtle floor bounce strip
  float floorBounce = smoothstep(0.68, 0.95, dot(r, normalize(vec3(0.1, -0.92, 0.35))));
  env += vec3(0.28, 0.27, 0.25) * floorBounce * 0.45;

  return env;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

  // Camera framing
  vec3 ro = vec3(0.0, 0.0, 3.15);
  vec3 rd = normalize(vec3(uv, -1.55));

  // Raymarch
  float t = 0.0;
  float matMix = 0.0;
  bool hit = false;

  for (int i = 0; i < 68; i++) {
    vec3 p = ro + rd * t;
    float d = mapScene(p, matMix);
    if (d < 0.0018) {
      hit = true;
      break;
    }
    if (t > 6.5) break;
    t += d * 0.88;
  }

  if (!hit) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  vec3 pos = ro + rd * t;
  vec3 nor = calcNormal(pos);
  vec3 viewDir = normalize(-rd);

  // Brushed micro-anisotropy perturbation for tactile satin metal feel
  float brush = sin((pos.x * 42.0 + pos.y * 18.0 + pos.z * 32.0)) * 0.015;
  vec3 n = normalize(nor + vec3(brush, brush * 0.4, -brush));

  float ao = calcAO(pos, n);
  float ndv = clamp(dot(n, viewDir), 0.0, 1.0);

  // Schlick Fresnel (obsidian base vs liquid-chrome edge)
  float f0 = mix(0.14, 0.78, matMix);
  float fresnel = f0 + (1.0 - f0) * pow(1.0 - ndv, 4.2);

  // Key & Rim softbox lights in pure monochrome bone/silver
  vec3 keyDir = normalize(vec3(-0.55, 0.78, 0.65));
  vec3 rimDir = normalize(vec3(0.75, 0.35, -0.58));
  vec3 fillDir = normalize(vec3(0.25, -0.82, 0.45));

  float diffKey = max(dot(n, keyDir), 0.0);
  float diffFill = max(dot(n, fillDir), 0.0);

  vec3 halfKey = normalize(keyDir + viewDir);
  vec3 halfRim = normalize(rimDir + viewDir);

  float specSharp = pow(max(dot(n, halfKey), 0.0), mix(44.0, 96.0, matMix));
  float specBroad = pow(max(dot(n, halfKey), 0.0), 14.0);
  float specRim = pow(max(dot(n, halfRim), 0.0), 32.0);

  // Environment reflection
  vec3 reflDir = reflect(-viewDir, n);
  vec3 envCol = studioEnv(reflDir);

  // Base brushed obsidian albedo + liquid-chrome highlight blend
  vec3 obsidianBase = vec3(0.032, 0.032, 0.034);
  vec3 chromeTint = vec3(0.78, 0.77, 0.74);
  vec3 baseCol = mix(obsidianBase, vec3(0.14, 0.138, 0.132), matMix * 0.55);

  vec3 col = vec3(0.0);
  // Diffuse sculptural shading
  col += baseCol * (0.28 + 0.95 * diffKey + 0.25 * diffFill) * ao;
  // Studio environment reflections
  col += envCol * mix(0.28, 0.95, fresnel) * (0.45 + 0.55 * ao);
  // Softbox bone speculars
  col += vec3(0.96, 0.95, 0.92) * specSharp * mix(0.55, 1.35, matMix);
  col += vec3(0.58, 0.57, 0.54) * specBroad * 0.24;
  // Architectural chrome edge rim
  col += chromeTint * specRim * 0.75;
  col += vec3(0.95, 0.94, 0.91) * pow(1.0 - ndv, 3.4) * 0.48 * ao;

  // Filmic tone curve (keeps deep cinema blacks + luminous bone highlights)
  col = col / (col + vec3(0.82));
  col = pow(clamp(col, 0.0, 1.0), vec3(0.92));

  // Crisp anti-aliased edge silhouette alpha
  float edgeAlpha = smoothstep(0.0, 0.12, ndv + 0.06);
  float alpha = clamp(mix(0.88, 1.0, edgeAlpha), 0.0, 1.0);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function Hero3DCanvas({ className = "" }) {
  const canvasRef = useRef(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = null;
    try {
      gl =
        canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          powerPreference: "high-performance",
        }) ||
        canvas.getContext("experimental-webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        });
    } catch {
      gl = null;
    }

    if (!gl) {
      setSupported(false);
      return;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vertShader || !fragShader) {
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      setSupported(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      setSupported(false);
      return;
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      setSupported(false);
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const motionLoc = gl.getUniformLocation(program, "u_motion");

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const targetMouse = { x: 0.15, y: -0.08 };
    const currentMouse = { x: 0.15, y: -0.08 };
    let isVisible = true;
    let rafId = 0;
    const startTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2.0;
      const ny = (e.clientY / window.innerHeight - 0.5) * -2.0;
      targetMouse.x = nx;
      targetMouse.y = ny;
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    resizeObserver?.observe(canvas);
    resize();

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              isVisible = entries[0]?.isIntersecting ?? true;
            },
            { threshold: 0.02 }
          )
        : null;
    intersectionObserver?.observe(canvas);

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", resize, { passive: true });

    const render = (now) => {
      rafId = requestAnimationFrame(render);
      if (!isVisible || document.hidden) return;

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.055;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.055;

      const elapsed = (now - startTime) * 0.001;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, elapsed);
      gl.uniform2f(mouseLoc, currentMouse.x, currentMouse.y);
      gl.uniform1f(motionLoc, prefersReducedMotion ? 0.15 : 1.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", resize);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, []);

  if (!supported) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
