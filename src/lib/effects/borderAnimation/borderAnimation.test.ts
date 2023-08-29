import { registerComponents } from "../../components/component/component";
import { CanvasUtils } from "../../utils/canvasUtils";
import { EffectType } from "../../utils/enums";
import { Effect, registerEffects } from "../effect/effect";
import * as utils from "../../utils/utils";
import { BorderAnimation } from "./borderAnimation";
import { initVideoTrackLib } from "../..";

describe("BorderAnimation", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("BorderAnimation.Builder", () => {
    const builder = new BorderAnimation.Builder();

    describe("withStartFrame", () => {
      it("should set the startFrame", () => {
        const borderAnimationBuilder = builder.withStartFrame(10);

        expect(builder.builderProperties.startFrame).toEqual(10);
      });
    });

    describe("withEndFrame", () => {
      it("should set the endFrame", () => {
        const borderAnimationBuilder = builder.withEndFrame(10);

        expect(builder.builderProperties.endFrame).toEqual(10);
      });
    });

    describe("withBorderDelay", () => {
      it("should set the borderDelay", () => {
        const borderAnimationBuilder = builder.withBorderDelay(10);

        expect(builder.builderProperties.borderDelay).toEqual(10);
      });
    });

    describe("withNbBorders", () => {
      it("should set the nbBorders", () => {
        const borderAnimationBuilder = builder.withNbBorders(10);

        expect(builder.builderProperties.nbBorders).toEqual(10);
      });
    });

    describe("build", () => {
      it("should call the super method buildEffect", () => {
        const spy = jest.spyOn(Effect.Builder.prototype as any, "buildEffect");

        builder.build();

        expect(spy).toHaveBeenCalledWith(EffectType.BorderAnimation);
      });
    });
  });

  describe("BorderAnimation", () => {
    describe("apply", () => {
      const borderAnimationBuilder = new BorderAnimation.Builder()
        .withStartFrame(10)
        .withEndFrame(30)
        .withNbBorders(2)
        .withBorderDelay(5);

      const componentProperties = {
        size: { width: 10, height: 20 },
        borderSettings: { width: 2, color: "red", corners: 3 },
        position: { x: 50, y: 50 },
      };

      it("should not draw if not in bounds", () => {
        const borderAnimation = borderAnimationBuilder.build();

        borderAnimation.apply({} as any, 0, {} as any);
        borderAnimation.apply({} as any, 50, {} as any);

        const getPropertyValueSy = jest.spyOn(utils, "getPropertyValue");

        expect(getPropertyValueSy).not.toHaveBeenCalled();
      });

      it("should call drawRoundedRectangleBorder with the correct parameters", () => {
        const borderAnimation = borderAnimationBuilder.build();

        const context = {
          save: jest.fn(),
          restore: jest.fn(),
          globalAlpha: 1,
        };

        const drawRoundedRectangleBorderSpy = jest
          .spyOn(CanvasUtils, "drawRoundedRectangleBorder")
          .mockImplementation(() => {});

        borderAnimation.apply(context as any, 18, componentProperties);

        expect(drawRoundedRectangleBorderSpy).toHaveBeenCalledWith(
          context,
          { x: 39, y: 39 },
          { height: 42, width: 32 },
          "red",
          3,
          1.5
        );

        expect(drawRoundedRectangleBorderSpy).toHaveBeenCalledWith(
          context,
          { x: 46.5, y: 46.5 },
          { height: 27, width: 17 },
          "red",
          3,
          1.5
        );
      });

      for (let i = 0; i < 35; i++) {
        it("should call drawRoundedRectangleBorder the correct number of times " + i, () => {
          const borderAnimation = borderAnimationBuilder.build();

          const context = {
            save: jest.fn(),
            restore: jest.fn(),
            globalAlpha: 1,
          };

          const drawRoundedRectangleBorderSpy = jest
            .spyOn(CanvasUtils, "drawRoundedRectangleBorder")
            .mockImplementation(() => {});

          borderAnimation.apply(context as any, i, componentProperties);

          if (i <= 10) {
            expect(drawRoundedRectangleBorderSpy).not.toHaveBeenCalled();
          } else if (i > 10 && i <= 15) {
            expect(drawRoundedRectangleBorderSpy).toBeCalledTimes(1);
          } else if (i > 15 && i < 25) {
            expect(drawRoundedRectangleBorderSpy).toBeCalledTimes(2);
          } else if (i >= 25 && i < 30) {
            expect(drawRoundedRectangleBorderSpy).toBeCalledTimes(1);
          } else {
            expect(drawRoundedRectangleBorderSpy).not.toHaveBeenCalled();
          }
        });
      }
    });
  });
});
