import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { hoverState, subscribeHover, type HoverTarget } from "./hoverStore";
import { HOVER_FRAGMENT, VERTEX } from "./shaders";

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

function textureFor(src: string, onReady: () => void) {
  let tex = cache.get(src);
  if (!tex) {
    tex = loader.load(src, onReady);
    tex.colorSpace = THREE.NoColorSpace; // raw sRGB in, raw sRGB out, so it matches the DOM image exactly
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    cache.set(src, tex);
  }
  return tex;
}

/**
 * Draws the hovered card's image on a plane in screen pixels, exactly over the DOM image,
 * with a soft lens under the pointer. The renderer's scissor clips it to the card's frame,
 * so the parallax and clip-path reveal underneath stay in sync.
 */
function Lens() {
  const { gl, size, invalidate } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const hover = useRef(0);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const src = useRef<string | null>(null);
  const last = useRef<HoverTarget | null>(null);

  const uniforms = useMemo(
    () => ({
      uTex: { value: null as THREE.Texture | null },
      uSize: { value: new THREE.Vector2(1568, 765) },
      uBox: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uFocus: { value: new THREE.Vector2(0.5, 0) },
      uHover: { value: 0 },
      uAlpha: { value: 0 },
      uTime: { value: 0 },
    }),
    []
  );

  // Wake the render loop whenever the hovered card or the pointer changes
  useEffect(() => subscribeHover(() => invalidate()), [invalidate]);

  useFrame((state, delta) => {
    // While fading out, keep following (and clipping to) the card we just left,
    // otherwise the slightly larger parallax image would spill outside its frame
    if (hoverState.target) last.current = hoverState.target;
    const goal = hoverState.target ? 1 : 0;
    hover.current += (goal - hover.current) * Math.min(1, delta * 7);
    const target = hover.current > 0.002 ? last.current : null;
    const m = mesh.current;

    // Clear the whole canvas first, then draw only inside the hovered frame
    gl.setScissorTest(false);
    gl.setClearColor(0x000000, 0);
    gl.clear();

    if (target && m) {
      const nextSrc = target.img.currentSrc || target.img.src;
      if (nextSrc !== src.current) {
        src.current = nextSrc;
        uniforms.uTex.value = textureFor(nextSrc, invalidate);
        uniforms.uSize.value.set(target.img.naturalWidth || 1568, target.img.naturalHeight || 765);
        // Match the DOM image's object-position, so the lens lines up exactly
        const [fx, fy] = getComputedStyle(target.img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
        uniforms.uFocus.value.set(Number.isFinite(fx) ? fx : 0.5, Number.isFinite(fy) ? fy : 0);
      }
      // R3F's default orthographic camera uses CSS pixels with the origin at the canvas center
      const r = target.img.getBoundingClientRect();
      m.position.set(r.left + r.width / 2 - size.width / 2, size.height / 2 - (r.top + r.height / 2), 0);
      m.scale.set(r.width, r.height, 1);
      uniforms.uBox.value.set(r.width, r.height);

      // Clip to the visible frame (three.js applies the pixel ratio itself)
      const f = target.frame.getBoundingClientRect();
      gl.setScissorTest(true);
      gl.setScissor(f.left, size.height - f.bottom, f.width, f.height);
    }

    mouse.current.set(hoverState.mouse.x, hoverState.mouse.y);
    uniforms.uMouse.value.lerp(mouse.current, 0.18);
    // The distortion eases in and out; the layer stays opaque until the distortion is almost gone.
    // With no distortion it matches the DOM image pixel for pixel, so it can then vanish without a ghost.
    uniforms.uHover.value = hover.current;
    uniforms.uAlpha.value = Math.min(1, hover.current * 12);
    uniforms.uTime.value += delta;
    if (m) m.visible = Boolean(target) && Boolean(uniforms.uTex.value);

    if (m?.visible) {
      gl.autoClear = false;
      state.gl.render(state.scene, state.camera);
    }
    gl.setScissorTest(false);

    // Keep animating while hovered or easing out, then go idle (no frames when nothing is hovered)
    if (hoverState.target || target) invalidate();
    else {
      last.current = null;
      src.current = null;
    }
  }, 1);

  return (
    <mesh ref={mesh} visible={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial vertexShader={VERTEX} fragmentShader={HOVER_FRAGMENT} uniforms={uniforms} transparent depthTest={false} />
    </mesh>
  );
}

export default function HoverDistortion() {
  return (
    <Canvas
      className="hover-canvas"
      aria-hidden
      orthographic
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: false, premultipliedAlpha: false }}
      camera={{ position: [0, 0, 10], near: 0.1, far: 100 }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5 }}
    >
      <Lens />
    </Canvas>
  );
}
