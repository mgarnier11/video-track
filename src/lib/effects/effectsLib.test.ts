import { initVideoTrackLib } from "..";
import { EffectsLib } from "./effectsLib";
import { Set } from "./set/set";
import { Transition } from "./transition/transition";

describe("EffectsLib", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("Fade", () => {
    it("should return a transition effect and a set effect with direction in", () => {
      const effects = EffectsLib.Fade(10, 20, "in");

      expect(effects.length).toBe(2);
      expect(effects[0]).toBeInstanceOf(Transition);
      expect(effects[0].getProperties()).toEqual({
        property: "opacity",
        endValue: 1,
        startFrame: 10,
        endFrame: 20,
        transitionType: "linear",
      });
      expect(effects[1]).toBeInstanceOf(Set);
      expect(effects[1].getProperties()).toEqual({
        property: "display",
        frameToSet: 10,
        value: true,
      });
    });

    it("should return a transition effect and a set effect with direction out", () => {
      const effects = EffectsLib.Fade(10, 20, "out");

      expect(effects.length).toBe(2);
      expect(effects[0]).toBeInstanceOf(Transition);
      expect(effects[0].getProperties()).toEqual({
        property: "opacity",
        endValue: 0,
        startFrame: 10,
        endFrame: 20,
        transitionType: "linear",
      });
      expect(effects[1]).toBeInstanceOf(Set);
      expect(effects[1].getProperties()).toEqual({
        property: "display",
        frameToSet: 20,
        value: false,
      });
    });
  });
});
