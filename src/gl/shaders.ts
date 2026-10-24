// Shared GLSL helpers
export const NOISE = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // object-fit: cover, with object-position given as a focal point (0..1, measured from the top-left like CSS)
  vec2 coverUv(vec2 uv, vec2 box, vec2 img, vec2 focus) {
    float rBox = box.x / box.y;
    float rImg = img.x / img.y;
    vec2 scale = rBox > rImg ? vec2(1.0, rImg / rBox) : vec2(rBox / rImg, 1.0);
    return uv * scale + (1.0 - scale) * vec2(focus.x, 1.0 - focus.y);
  }
  vec2 coverUv(vec2 uv, vec2 box, vec2 img) { return coverUv(uv, box, img, vec2(0.5)); }
`;

export const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A 2×2 plane drawn straight into clip space, so it always fills the canvas
export const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Hero: slow liquid cross-dissolve between project screenshots, toned to warm charcoal
export const HERO_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform vec2 uSizeA;
  uniform vec2 uSizeB;
  uniform vec2 uRes;
  uniform float uMix;
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  ${NOISE}

  vec3 tone(vec3 c) {
    // Warm duotone with compressed contrast, so the screenshot reads as texture rather than text
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    vec3 dark = vec3(0.105, 0.098, 0.090);
    vec3 light = vec3(0.74, 0.69, 0.62);
    vec3 duo = mix(dark, light, smoothstep(0.0, 1.0, l));
    return mix(duo, c * 0.75, 0.2);
  }

  // A soft 9-tap blur: enough to lose small UI text, cheap enough for every frame
  vec3 soft(sampler2D tex, vec2 uv) {
    vec2 o = vec2(0.0024, 0.0036);
    vec3 s = texture2D(tex, uv).rgb * 0.2;
    s += texture2D(tex, uv + vec2(o.x, 0.0)).rgb * 0.1;
    s += texture2D(tex, uv - vec2(o.x, 0.0)).rgb * 0.1;
    s += texture2D(tex, uv + vec2(0.0, o.y)).rgb * 0.1;
    s += texture2D(tex, uv - vec2(0.0, o.y)).rgb * 0.1;
    s += texture2D(tex, uv + o).rgb * 0.1;
    s += texture2D(tex, uv - o).rgb * 0.1;
    s += texture2D(tex, uv + vec2(o.x, -o.y)).rgb * 0.1;
    s += texture2D(tex, uv + vec2(-o.x, o.y)).rgb * 0.1;
    return s;
  }

  void main() {
    vec2 uv = vUv;
    // Zoomed in toward the upper right of each screenshot, drifting slowly like a camera breathing
    float t = uTime * 0.04;
    uv = (uv - 0.5) * (0.72 + 0.02 * sin(t)) + vec2(0.56, 0.5) + vec2(sin(t * 0.7), cos(t * 0.5)) * 0.01;
    uv += (uPointer - 0.5) * 0.012;

    float n = snoise(vUv * 2.2 + t) * 0.5 + 0.5;
    float m = smoothstep(n - 0.22, n + 0.22, uMix * 1.44 - 0.22);
    float wave = sin(3.14159 * uMix);
    vec2 push = vec2(snoise(vUv * 3.0 - t), snoise(vUv * 3.0 + 7.0 + t)) * 0.045 * wave;

    vec3 a = soft(uTexA, coverUv(uv + push * m, uRes, uSizeA));
    vec3 b = soft(uTexB, coverUv(uv - push * (1.0 - m), uRes, uSizeB));
    vec3 col = tone(mix(a, b, m));

    // Light pools at the upper right; the headline side (left, bottom) stays deep
    float vig = smoothstep(1.15, 0.1, length((vUv - vec2(0.78, 0.7)) * vec2(0.9, 1.3)));
    col *= mix(0.5, 1.12, vig);
    col += (fract(sin(dot(gl_FragCoord.xy + uTime, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`;

// Thumbnail hover: a soft lens that follows the pointer, with a hint of chromatic shift
export const HOVER_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uSize;
  uniform vec2 uBox;
  uniform vec2 uMouse;
  uniform vec2 uFocus;
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  ${NOISE}

  void main() {
    vec2 uv = vUv;
    vec2 d = uv - uMouse;
    d.x *= uBox.x / uBox.y;
    float dist = length(d);
    float lens = smoothstep(0.42, 0.0, dist) * uHover;
    uv -= (uv - uMouse) * lens * 0.11;
    uv.y += snoise(vec2(uv.x * 3.0, uTime * 0.25)) * 0.004 * uHover;

    vec2 c = coverUv(uv, uBox, uSize, uFocus);
    float shift = 0.0028 * lens;
    vec3 col = vec3(
      texture2D(uTex, c + vec2(shift, 0.0)).r,
      texture2D(uTex, c).g,
      texture2D(uTex, c - vec2(shift, 0.0)).b
    );
    gl_FragColor = vec4(col, uHover);
  }
`;
