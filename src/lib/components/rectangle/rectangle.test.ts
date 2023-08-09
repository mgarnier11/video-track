import { registerEffects } from "../../effects/effect/effect";
import { ComponentType } from "../../utils/enums";
import { registerComponents } from "../component/component";
import { Rectangle } from "./rectangle";

describe("Rectangle", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();
  });

  describe("Rectangle.Builder", () => {
    const builder = new Rectangle.Builder();

    describe("withBorderColor", () => {
      it("sets the borderColor property", () => {
        const progressBarBuilder = builder.withBorderColor({ type: "rgba", r: 10, g: 20, b: 30 });

        expect(progressBarBuilder.builderProperties.borderColor).toEqual({ type: "rgba", r: 10, g: 20, b: 30 });
      });
    });

    describe("withBorderWidth", () => {
      it("sets the borderWidth property", () => {
        const progressBarBuilder = builder.withBorderWidth(10);

        expect(progressBarBuilder.builderProperties.borderWidth).toEqual(10);
      });
    });

    describe("withSize", () => {
      it("sets the size property", () => {
        const progressBarBuilder = builder.withSize({ width: 10, height: 20 });

        expect(progressBarBuilder.builderProperties.size).toEqual({ width: 10, height: 20 });
      });
    });

    describe("withCorners", () => {
      it("sets the corners property", () => {
        const progressBarBuilder = builder.withCorners({
          type: "corners4",
          topLeft: 10,
          topRight: 20,
          bottomRight: 30,
          bottomLeft: 40,
        });

        expect(progressBarBuilder.builderProperties.corners).toEqual({
          type: "corners4",
          topLeft: 10,
          topRight: 20,
          bottomRight: 30,
          bottomLeft: 40,
        });
      });
    });

    describe("fillOnly", () => {
      it("sets the fill property to true and the border property to false", () => {
        const progressBarBuilder = builder.fillOnly();

        expect(progressBarBuilder.builderProperties.fill).toEqual(true);
        expect(progressBarBuilder.builderProperties.border).toEqual(false);
      });
    });

    describe("borderOnly", () => {
      it("sets the fill property to false and the border property to true", () => {
        const progressBarBuilder = builder.borderOnly();

        expect(progressBarBuilder.builderProperties.fill).toEqual(false);
        expect(progressBarBuilder.builderProperties.border).toEqual(true);
      });
    });

    describe("fillAndBorder", () => {
      it("sets the fill property to true and the border property to true", () => {
        const progressBarBuilder = builder.fillAndBorder();

        expect(progressBarBuilder.builderProperties.fill).toEqual(true);
        expect(progressBarBuilder.builderProperties.border).toEqual(true);
      });
    });

    describe("build", () => {
      it("call the super method builderComponent", () => {
        const spy = jest.spyOn(Rectangle.Builder.prototype as any, "buildComponent");

        builder.build();

        expect(spy).toHaveBeenCalledWith(ComponentType.Rectangle);
      });
    });
  });
});
