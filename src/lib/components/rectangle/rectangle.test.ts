import { initVideoTrackLib } from "../..";
import { registerEffects } from "../../effects/effect/effect";
import { CanvasUtils } from "../../utils/canvasUtils";
import { ComponentType } from "../../utils/enums";
import { Component, registerComponents } from "../component/component";
import { Rectangle } from "./rectangle";

describe("Rectangle", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
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
        const spy = jest.spyOn(Component.Builder.prototype as any, "buildComponent");

        builder.build();

        expect(spy).toHaveBeenCalledWith(ComponentType.Rectangle);
      });
    });
  });

  describe("Rectangle", () => {
    describe("drawComponent", () => {
      const updatedProperties = {
        color: "red",
        display: true,
        opacity: 1,
        position: { x: 25, y: 40 },
        borderColor: "red",
        borderWidth: 20,
        size: { width: 100, height: 200 },
        corners: 10,
        fill: false,
        border: false,
      };

      it("with fill only", () => {
        const rectangle = new Rectangle.Builder().build();

        updatedProperties.fill = true;
        updatedProperties.border = false;

        const context: any = {};

        const getColorStringSpy = jest.spyOn(CanvasUtils, "getColorString");
        const drawRoundedRectangleSpy = jest.spyOn(CanvasUtils, "drawRoundedRectangle").mockImplementation(() => {});
        const drawRoundedRectangleBorderSpy = jest
          .spyOn(CanvasUtils, "drawRoundedRectangleBorder")
          .mockImplementation(() => {});

        rectangle.drawComponent(context, 0, updatedProperties);

        expect(getColorStringSpy).toHaveBeenCalledWith("red");
        expect(getColorStringSpy).toHaveBeenCalledTimes(1);
        expect(drawRoundedRectangleSpy).toHaveBeenCalledWith(
          context,
          { x: 25, y: 40 },
          { width: 100, height: 200 },
          "red",
          10
        );
        expect(drawRoundedRectangleBorderSpy).not.toHaveBeenCalled();
      });

      it("with border only", () => {
        const rectangle = new Rectangle.Builder().build();

        updatedProperties.fill = false;
        updatedProperties.border = true;

        const context: any = {};

        const getColorStringSpy = jest.spyOn(CanvasUtils, "getColorString");
        const drawRoundedRectangleSpy = jest.spyOn(CanvasUtils, "drawRoundedRectangle").mockImplementation(() => {});
        const drawRoundedRectangleBorderSpy = jest
          .spyOn(CanvasUtils, "drawRoundedRectangleBorder")
          .mockImplementation(() => {});

        rectangle.drawComponent(context, 0, updatedProperties);

        expect(getColorStringSpy).toHaveBeenCalledWith("red");
        expect(getColorStringSpy).toHaveBeenCalledTimes(1);
        expect(drawRoundedRectangleSpy).not.toHaveBeenCalled();
        expect(drawRoundedRectangleBorderSpy).toHaveBeenCalledWith(
          context,
          { x: 35, y: 50 },
          { width: 80, height: 180 },
          "red",
          10,
          20
        );
      });

      it("with fill and border", () => {
        const rectangle = new Rectangle.Builder().build();

        updatedProperties.fill = true;
        updatedProperties.border = true;

        const context: any = {};

        const getColorStringSpy = jest.spyOn(CanvasUtils, "getColorString");
        const drawRoundedRectangleSpy = jest.spyOn(CanvasUtils, "drawRoundedRectangle").mockImplementation(() => {});
        const drawRoundedRectangleBorderSpy = jest
          .spyOn(CanvasUtils, "drawRoundedRectangleBorder")
          .mockImplementation(() => {});

        rectangle.drawComponent(context, 0, updatedProperties);

        expect(getColorStringSpy).toHaveBeenCalledWith("red");
        expect(getColorStringSpy).toHaveBeenCalledTimes(2);
        expect(drawRoundedRectangleSpy).toHaveBeenCalledWith(
          context,
          { x: 25, y: 40 },
          { width: 100, height: 200 },
          "red",
          10
        );
        expect(drawRoundedRectangleBorderSpy).toHaveBeenCalledWith(
          context,
          { x: 35, y: 50 },
          { width: 80, height: 180 },
          "red",
          10,
          20
        );
      });
    });

    describe("setProperty", () => {
      it("call the super method setProperty", () => {
        const text = new Rectangle.Builder().build();
        const spy = jest.spyOn(Component.prototype as any, "setProperty");

        text.setProperty("borderWidth", 0);

        expect(spy).toHaveBeenCalledWith("borderWidth", 0);
      });
    });
  });
});
