import { registerComponents } from "./components/component/component.js";
import { registerEffects } from "./effects/effect/effect.js";

export const initVideoTrackLib = async () => {
  await registerComponents();
  await registerEffects();
};

export * from "./components/index.js";
export * from "./effects/index.js";

export * from "./utils/enums.js";
