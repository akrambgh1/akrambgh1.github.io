import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FULLSCREEN_VERTEX, HERO_FRAGMENT } from "./shaders";

interface Props {
  images: string[];
  active: boolean; // false when the hero is off-screen: stop rendering entirely
  still: boolean; // reduced motion: one frame, no cycling
  onChange: (index: number) => void;
}

const HOLD = 6.5; // seconds each image is shown
const BLEND = 2.4; // seconds of the dissolve

function Plate({ images, still, onChange }: Omit<Props, "active">) {
  const textures = useLoader(THREE.TextureLoader, images);
  const { size, invalidate } = useThree();
  const pointer = useRef(new THREE.Vector2(0.5, 0.5));
  const index = useRef(0);

  textures.forEach((t) => {
    t.colorSpace = THREE.NoColorSpace; // raw sRGB in, raw sRGB out: our shaders do no color conversion
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
  });

  const imgSize = (t: THREE.Texture) => {
    const img = t.image as HTMLImageElement | undefined;
    return new THREE.Vector2(img?.width || 1600, img?.height || 900);
  };

  const uniforms = useMemo(
    () => ({
      uTexA: { value: textures[0] },
      uTexB: { value: textures[1 % textures.length] },
      uSizeA: { value: imgSize(textures[0]) },
      uSizeB: { value: imgSize(textures[1 % textures.length]) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMix: { value: 0 },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [textures]
  );

  useEffect(() => {
    uniforms.uRes.value.set(size.width, size.height);
    invalidate();
  }, [size, uniforms, invalidate]);

  // Cycle: hold, dissolve to the next image, swap, repeat
  useEffect(() => {
    if (still || textures.length < 2) return;
    const tl = gsap.timeline({ repeat: -1, delay: HOLD });
    tl.to(uniforms.uMix, { value: 1, duration: BLEND, ease: "power2.inOut" })
      .add(() => {
        index.current = (index.current + 1) % textures.length;
        const next = (index.current + 1) % textures.length;
        uniforms.uTexA.value = textures[index.current];
        uniforms.uSizeA.value = imgSize(textures[index.current]);
        uniforms.uTexB.value = textures[next];
        uniforms.uSizeB.value = imgSize(textures[next]);
        uniforms.uMix.value = 0;
        onChange(index.current);
      })
      .to({}, { duration: HOLD });
    return () => {
      tl.kill();
    };
  }, [still, textures, uniforms, onChange]);

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => pointer.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((_, delta) => {
    if (still) return;
    uniforms.uTime.value += Math.min(delta, 0.05);
    uniforms.uPointer.value.lerp(pointer.current, 0.03);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={FULLSCREEN_VERTEX} fragmentShader={HERO_FRAGMENT} uniforms={uniforms} depthWrite={false} />
    </mesh>
  );
}

export default function HeroCanvas({ images, active, still, onChange }: Props) {
  return (
    <Canvas
      className="hero-canvas"
      aria-hidden
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      frameloop={still ? "demand" : active ? "always" : "never"}
      camera={{ position: [0, 0, 1] }}
    >
      <Plate images={images} still={still} onChange={onChange} />
    </Canvas>
  );
}
