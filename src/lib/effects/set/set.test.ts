import { registerComponents } from "../../components/component/component.js";
import { EffectType } from "../../utils/enums.js";
import { Effect, registerEffects } from "../effect/effect.js";
import { Set } from "./set.js";
import * as utils from "../../utils/utils.js";
import { initVideoTrackLib } from "../../index.js";

describe("Set", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("Set.Builder", () => {
    const builder = new Set.Builder();

    describe("withProperty", () => {
      it("should set the property", () => {
        const setBuilder = builder.withProperty("property");

        expect(builder.builderProperties.property).toEqual("property");
      });
    });

    describe("withFrameToSet", () => {
      it("should set the frameToSet", () => {
        const setBuilder = builder.withFrameToSet(10);

        expect(builder.builderProperties.frameToSet).toEqual(10);
      });
    });

    describe("withValue", () => {
      it("should set the value", () => {
        const setBuilder = builder.withValue(10);

        expect(builder.builderProperties.value).toEqual(10);
      });
    });

    describe("build", () => {
      it("should call the super method buildEffect", () => {
        const spy = jest.spyOn(Effect.Builder.prototype as any, "buildEffect");

        builder.build();

        expect(spy).toHaveBeenCalledWith(EffectType.Set);
      });
    });
  });

  describe("Set", () => {
    const setBuilder = new Set.Builder().withProperty("test").withValue(125).withFrameToSet(10);

    describe("apply", () => {
      it("should change the property if actualFrame >= frameToSet", () => {
        const set = setBuilder.build();
        const properties = { test: 0 };

        const updatedProperties = set.apply(null as any, 10, properties);

        expect(updatedProperties).toEqual({
          test: 125,
        });
      });

      it("should not change the property if actualFrame < frameToSet", () => {
        const set = setBuilder.build();
        const spy = jest.spyOn(utils, "setPropertyValue");
        const properties = { test: 0 };

        const updatedProperties = set.apply(null as any, 9, properties);

        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});
