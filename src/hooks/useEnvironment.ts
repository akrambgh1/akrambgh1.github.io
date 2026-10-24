import { useEffect, useState } from "react";

const query = (q: string) => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(q) : null);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export interface Environment {
  reducedMotion: boolean;
  finePointer: boolean; // mouse or trackpad (hover effects only make sense here)
  webgl: boolean;
}

/** Device capabilities that decide how much motion and WebGL the page uses. */
export function useEnvironment(): Environment {
  const [env, setEnv] = useState<Environment>(() => ({
    reducedMotion: Boolean(query("(prefers-reduced-motion: reduce)")?.matches),
    finePointer: Boolean(query("(hover: hover) and (pointer: fine)")?.matches),
    webgl: supportsWebGL(),
  }));

  useEffect(() => {
    const rm = query("(prefers-reduced-motion: reduce)");
    const fp = query("(hover: hover) and (pointer: fine)");
    const update = () =>
      setEnv((e) => ({ ...e, reducedMotion: Boolean(rm?.matches), finePointer: Boolean(fp?.matches) }));
    rm?.addEventListener("change", update);
    fp?.addEventListener("change", update);
    return () => {
      rm?.removeEventListener("change", update);
      fp?.removeEventListener("change", update);
    };
  }, []);

  return env;
}
