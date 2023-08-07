import { CanvasUtils } from "./canvasUtils";

describe("CanvasUtils", () => {
  describe("roundRect", () => {
    it("should draw a rectangle", () => {
      const context = {
        roundRect: jest.fn(),
        rect: jest.fn(),
      } as any;

      (CanvasUtils as any).roundRect(context, 0, 0, 10, 10);

      expect(context.rect).toHaveBeenCalledWith(0, 0, 10, 10);
    });

    it("should draw a rounded rectangle with 5px all around", () => {
      const context = {
        roundRect: jest.fn(),
        rect: jest.fn(),
      } as any;

      (CanvasUtils as any).roundRect(context, 0, 0, 10, 10, 5);

      expect(context.roundRect).toHaveBeenCalledWith(0, 0, 10, 10, [5]);
    });

    it("should draw a rounded rectangle with 5px top left and 10px top right", () => {
      const context = {
        roundRect: jest.fn(),
        rect: jest.fn(),
      } as any;

      (CanvasUtils as any).roundRect(context, 0, 0, 10, 10, { type: "corners2", topLeft: 5, topRight: 10 });

      expect(context.roundRect).toHaveBeenCalledWith(0, 0, 10, 10, [5, 10]);
    });

    it("should draw a rounded rectangle with 5px top left, 10px top right, 15px bottom right and 20px bottom left", () => {
      const context = {
        roundRect: jest.fn(),
        rect: jest.fn(),
      } as any;

      (CanvasUtils as any).roundRect(context, 0, 0, 10, 10, {
        type: "corners4",
        topLeft: 5,
        topRight: 10,
        bottomRight: 15,
        bottomLeft: 20,
      });

      expect(context.roundRect).toHaveBeenCalledWith(0, 0, 10, 10, [5, 10, 15, 20]);
    });
  });

  describe("drawRoundedRectangleBorder", () => {
    it("should draw a rounded rectangle border", () => {
      const context = {
        save: jest.fn(),
        strokeStyle: "",
        lineWidth: 0,
        beginPath: jest.fn(),
        closePath: jest.fn(),
        restore: jest.fn(),
        stroke: jest.fn(),
      } as any;
      jest.spyOn(CanvasUtils as any, "roundRect").mockImplementation(() => {});

      CanvasUtils.drawRoundedRectangleBorder(context, { x: 0, y: 0 }, { width: 10, height: 10 }, "red", undefined, 10);

      expect(context.save).toHaveBeenCalledTimes(1);
      expect(context.strokeStyle).toEqual("red");
      expect(context.lineWidth).toEqual(10);
      expect(context.beginPath).toHaveBeenCalledTimes(1);
      expect((CanvasUtils as any).roundRect).toHaveBeenCalledWith(context, 0, 0, 10, 10, undefined);
      expect(context.stroke).toHaveBeenCalledTimes(1);
      expect(context.closePath).toHaveBeenCalledTimes(1);
      expect(context.restore).toHaveBeenCalledTimes(1);
    });
  });

  describe("drawRoundedRectangle", () => {
    it("should draw a rounded rectangle", () => {
      const context = {
        save: jest.fn(),
        fillStyle: "",
        beginPath: jest.fn(),
        closePath: jest.fn(),
        restore: jest.fn(),
        fill: jest.fn(),
      } as any;
      jest.spyOn(CanvasUtils as any, "roundRect").mockImplementation(() => {});

      CanvasUtils.drawRoundedRectangle(context, { x: 0, y: 0 }, { width: 10, height: 10 }, "red");

      expect(context.save).toHaveBeenCalledTimes(1);
      expect(context.fillStyle).toEqual("red");
      expect(context.beginPath).toHaveBeenCalledTimes(1);
      expect((CanvasUtils as any).roundRect).toHaveBeenCalledWith(context, 0, 0, 10, 10, undefined);
      expect(context.closePath).toHaveBeenCalledTimes(1);
      expect(context.restore).toHaveBeenCalledTimes(1);
      expect(context.fill).toHaveBeenCalledTimes(1);
    });
  });

  describe("getColorString", () => {
    it("should return the color string when it is a string", () => {
      const color = CanvasUtils.getColorString("red");

      expect(color).toEqual("red");
    });

    it("should return the color string when it is a RGBAColor", () => {
      const color = CanvasUtils.getColorString({ type: "rgba", r: 255, g: 0, b: 0 });

      expect(color).toEqual("rgba(255, 0, 0, 1)");
    });

    it("should return the color string when it is a HSLAColor", () => {
      const color = CanvasUtils.getColorString({ type: "hsla", h: 0, s: 100, l: 50 });

      expect(color).toEqual("hsl(0, 100%, 50%, 1)");
    });

    it("should return an empty string when the color is not supported", () => {
      const color = CanvasUtils.getColorString({ type: "test" } as any);

      expect(color).toEqual("");
    });
  });
});
