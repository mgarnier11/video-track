import { EffectType } from "../../utils/enums";
import { Effect, registerEffects } from "./effect";
import * as utils from "../../utils/utils";
import { CanvasRenderingContext2D } from "canvas";

describe("Effect", () => {
  describe("Effect.Builder", () => {
    const builder: any = new Effect.Builder();

    describe("setProperty", () => {
      it("should set the property", () => {
        jest.spyOn(utils, "setPropertyValue").mockImplementation(() => {});

        const builderReturn = builder.setProperty("test", 10);

        expect(utils.setPropertyValue).toHaveBeenCalledWith(expect.any(Object), "test", 10);
        expect(builderReturn).toEqual(builder);
      });
    });

    describe("buildEffect", () => {
      it("should build an effect", () => {
        const setPropertiesMock = jest.fn();
        const testClassMock = jest.fn().mockImplementation(() => {
          return {
            setProperties: setPropertiesMock,
          };
        });

        Effect.typeToClass = {
          [EffectType.Unknown]: testClassMock,
        };

        const builder = new Effect.Builder() as any;

        const component = builder.buildEffect(EffectType.Unknown);

        expect(testClassMock).toHaveBeenCalled();
        expect(setPropertiesMock).toHaveBeenCalledWith((builder as any).builderProperties);
      });

      it("should throw an error if the type is unknown", () => {
        Effect.typeToClass = {};

        const builder = new Effect.Builder() as any;

        expect(() => builder.buildEffect(EffectType.Unknown)).toThrowError("Unknown effect type: unknown");
      });
    });
  });

  describe("Effect", () => {
    class EffectTest extends Effect {
      public static Builder = class extends Effect.Builder {
        public build(): EffectTest {
          return super.buildEffect(EffectType.Unknown);
        }
      };

      public apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any) {}
    }

    let effect: any;

    beforeEach(() => {
      Effect.typeToClass = {
        [EffectType.Unknown]: EffectTest,
      };

      effect = new EffectTest.Builder().build();
    });

    describe("toJSON", () => {
      it("should return the json", () => {
        effect.properties = { test: 10 };
        effect.type = EffectType.Unknown;
        effect.id = "testId";

        const json = effect.toJSON();

        expect(json).toEqual({
          properties: { test: 10 },
          type: EffectType.Unknown,
          id: "testId",
        });
      });
    });

    describe("fromJSON", () => {
      it("should return the effect", () => {
        const effect = Effect.fromJSON({
          properties: { test: 10 },
          type: EffectType.Unknown,
          id: "testId",
        }) as any;

        expect(effect).toBeInstanceOf(EffectTest);
        expect(effect.properties).toEqual({ test: 10 });
        expect(effect.type).toEqual(EffectType.Unknown);
        expect(effect.id).toEqual("testId");
      });

      it("should throw an error if the type is unknown", () => {
        expect(() =>
          Effect.fromJSON({
            properties: { test: 10 },
            type: "test",
            id: "testId",
          })
        ).toThrowError("Unknown effect type: test");
      });
    });

    describe("setProperties", () => {
      it("should set the properties", () => {
        jest.spyOn(utils, "dumbDeepCopy");

        effect.setProperties({ test: 10 } as any);

        expect(utils.dumbDeepCopy).toHaveBeenCalledWith({ test: 10 });
        expect(effect.properties).toEqual({ test: 10 });
      });
    });

    describe("getProperties", () => {
      it("should get the properties", () => {
        effect.properties = { test: 10 };

        const spy = jest.spyOn(utils, "dumbDeepCopy");

        expect(effect.getProperties()).toEqual({ test: 10 });
        expect(spy).toHaveBeenCalledWith({ test: 10 });
      });
    });
  });

  describe("registerEffects", () => {
    it("should register the effects", async () => {
      jest.mock("../borderAnimation/borderAnimation.js", () => ({ BorderAnimation: "borderAnimation" }));
      jest.mock("../switch/switch.js", () => ({ Switch: "switch" }));
      jest.mock("../transition/transition.js", () => ({ Transition: "transition" }));
      jest.mock("../set/set.js", () => ({ Set: "set" }));

      await registerEffects();

      expect(Effect.typeToClass).toEqual({
        [EffectType.BorderAnimation]: "borderAnimation",
        [EffectType.Switch]: "switch",
        [EffectType.Transition]: "transition",
        [EffectType.Set]: "set",
      });
    });
  });
});
