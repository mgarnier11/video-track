import { initVideoTrackLib } from "../..";
import { EffectType } from "../../utils/enums";
import { dumbDeepCopy } from "../../utils/utils";
import { Effect } from "../effect/effect";
import { Switch } from "./switch";

describe("Switch", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("Switch.Builder", () => {
    const builder = new Switch.Builder();

    describe("withProperty", () => {
      it("should set the property", () => {
        const switchBuilder = builder.withProperty("property");

        expect(builder.builderProperties.property).toEqual("property");
      });
    });

    describe("withFramesToSwitch", () => {
      it("should set the framesToSwitch", () => {
        const switchBuilder = builder.withFramesToSwitch([10]);

        expect(builder.builderProperties.framesToSwitch).toEqual([10]);
      });
    });

    describe("build", () => {
      it("should call the super method buildEffect", () => {
        const spy = jest.spyOn(Effect.Builder.prototype as any, "buildEffect");

        builder.build();

        expect(spy).toHaveBeenCalledWith(EffectType.Switch);
      });
    });
  });

  describe("Switch", () => {
    const switchBuilder = new Switch.Builder().withProperty("test").withFramesToSwitch([5, 10, 15, 20, 25]);

    describe("apply", () => {
      it("should switch the test value when a frame has passed", () => {
        const initialProperties = { test: false };
        const switchEffect = switchBuilder.build();
        let updatedProperties;

        updatedProperties = switchEffect.apply(null as any, 6, dumbDeepCopy(initialProperties)) as any;
        expect(updatedProperties.test).toEqual(true);

        updatedProperties = switchEffect.apply(null as any, 11, dumbDeepCopy(initialProperties)) as any;
        expect(updatedProperties.test).toEqual(false);

        updatedProperties = switchEffect.apply(null as any, 16, dumbDeepCopy(initialProperties)) as any;
        expect(updatedProperties.test).toEqual(true);

        updatedProperties = switchEffect.apply(null as any, 21, dumbDeepCopy(initialProperties)) as any;
        expect(updatedProperties.test).toEqual(false);

        updatedProperties = switchEffect.apply(null as any, 26, dumbDeepCopy(initialProperties)) as any;
        expect(updatedProperties.test).toEqual(true);
      });
    });
  });
});
