import { initVideoTrackLib } from "../..";
import { EffectType, TransitionType } from "../../utils/enums";
import { dumbDeepCopy } from "../../utils/utils";
import { Effect } from "../effect/effect";
import { Transition } from "./transition";

describe("Transition", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("Transition.Builder", () => {
    const builder = new Transition.Builder();

    describe("withProperty", () => {
      it("should set the property", () => {
        const transitionBuilder = builder.withProperty("property");

        expect(builder.builderProperties.property).toEqual("property");
      });
    });

    describe("withEndValue", () => {
      it("should set the endValue", () => {
        const transitionBuilder = builder.withEndValue(10);

        expect(builder.builderProperties.endValue).toEqual(10);
      });
    });

    describe("withStartFrame", () => {
      it("should set the startFrame", () => {
        const transitionBuilder = builder.withStartFrame(10);

        expect(builder.builderProperties.startFrame).toEqual(10);
      });
    });

    describe("withEndFrame", () => {
      it("should set the endFrame", () => {
        const transitionBuilder = builder.withEndFrame(10);

        expect(builder.builderProperties.endFrame).toEqual(10);
      });
    });

    describe("withTransitionType", () => {
      it("should set the transitionType", () => {
        const transitionBuilder = builder.withTransitionType(TransitionType.EASE_IN_OUT);

        expect(builder.builderProperties.transitionType).toEqual(TransitionType.EASE_IN_OUT);
      });
    });

    describe("build", () => {
      it("should call the super method buildEffect", () => {
        const spy = jest.spyOn(Effect.Builder.prototype as any, "buildEffect");

        builder.build();

        expect(spy).toHaveBeenCalledWith(EffectType.Transition);
      });
    });
  });

  describe("Transition", () => {
    const transitionBuilder = new Transition.Builder()
      .withProperty("test")
      .withEndValue(100)
      .withStartFrame(100)
      .withEndFrame(200);

    describe("updateEndValue", () => {
      it("should update the endValue", () => {
        const transition = transitionBuilder.build();

        transition.updateEndValue(200);

        expect((transition.getProperties() as any).endValue).toEqual(200);
      });
    });

    describe("updateStartFrame", () => {
      it("should update the startFrame", () => {
        const transition = transitionBuilder.build();

        transition.updateStartFrame(200);

        expect((transition.getProperties() as any).startFrame).toEqual(200);
      });
    });

    describe("updateEndFrame", () => {
      it("should update the endFrame", () => {
        const transition = transitionBuilder.build();

        transition.updateEndFrame(200);

        expect((transition.getProperties() as any).endFrame).toEqual(200);
      });
    });

    describe("apply", () => {
      it("should not apply the transition if the actualFrame is before the startFrame", () => {
        const transition = transitionBuilder.build();
        const properties = { test: 0 };

        transition.apply(null as any, 50, properties);
        expect(properties.test).toEqual(0);
      });

      it("should apply the endValue if the actualFrame is after the endFrame", () => {
        const transition = transitionBuilder.build();
        const properties = { test: 0 };

        transition.apply(null as any, 250, properties);
        expect(properties.test).toEqual(100);
      });

      it("should apply the transition with type LINEAR", () => {
        const transition = transitionBuilder.withTransitionType(TransitionType.LINEAR).build();
        const defaultProperties = { test: 0 };

        let returnedProperties: any;

        returnedProperties = transition.apply(null as any, 100, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(0);

        returnedProperties = transition.apply(null as any, 110, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(10);

        returnedProperties = transition.apply(null as any, 150, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(50);

        returnedProperties = transition.apply(null as any, 190, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(90);

        returnedProperties = transition.apply(null as any, 200, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(100);
      });

      it("should apply the transition with type EASE_IN", () => {
        const transition = transitionBuilder.withTransitionType(TransitionType.EASE_IN).build();
        const defaultProperties = { test: 0 };

        let returnedProperties: any;

        returnedProperties = transition.apply(null as any, 100, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(0);

        returnedProperties = transition.apply(null as any, 110, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(1.7);

        returnedProperties = transition.apply(null as any, 150, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(31.54);

        returnedProperties = transition.apply(null as any, 190, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(83.94);

        returnedProperties = transition.apply(null as any, 200, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(100);
      });

      it("should apply the transition with type EASE_OUT", () => {
        const transition = transitionBuilder.withTransitionType(TransitionType.EASE_OUT).build();
        const defaultProperties = { test: 0 };

        let returnedProperties: any;

        returnedProperties = transition.apply(null as any, 100, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(0);

        returnedProperties = transition.apply(null as any, 110, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(16.06);

        returnedProperties = transition.apply(null as any, 150, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(68.46);

        returnedProperties = transition.apply(null as any, 190, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(98.3);

        returnedProperties = transition.apply(null as any, 200, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(100);
      });

      it("should apply the transition with type EASE_IN_OUT", () => {
        const transition = transitionBuilder.withTransitionType(TransitionType.EASE_IN_OUT).build();
        const defaultProperties = { test: 0 };

        let returnedProperties: any;

        returnedProperties = transition.apply(null as any, 100, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(0);

        returnedProperties = transition.apply(null as any, 110, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(1.97);

        returnedProperties = transition.apply(null as any, 150, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(50);

        returnedProperties = transition.apply(null as any, 190, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(98.03);

        returnedProperties = transition.apply(null as any, 200, dumbDeepCopy(defaultProperties));
        expect(returnedProperties.test).toBeCloseTo(100);
      });
    });
  });
});
