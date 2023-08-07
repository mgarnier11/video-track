import { Effect } from "../../effects/effect/effect";
import { ComponentType } from "../../utils/enums";
import * as utils from "../../utils/utils";
import { Component, registerComponents } from "./component";

describe("Component", () => {
  describe("Component.Builder", () => {
    describe("setProperty", () => {
      it("should set the property", () => {
        jest.spyOn(utils, "setPropertyValue").mockImplementation(() => {});

        const builder = new Component.Builder();

        const builderReturn = (builder as any).setProperty("test", 10);

        expect(utils.setPropertyValue).toHaveBeenCalledWith(expect.any(Object), "test", 10);
        expect(builderReturn).toEqual(builder);
      });
    });

    describe("withPosition", () => {
      it("should set the position", () => {
        const component = new Component.Builder().withPosition({ x: 10, y: 20 });

        expect((component as any).builderProperties.position).toEqual({ x: 10, y: 20 });
      });
    });

    describe("withDisplay", () => {
      it("should set the display", () => {
        const component = new Component.Builder().withDisplay(true);

        expect((component as any).builderProperties.display).toEqual(true);
      });
    });

    describe("withColor", () => {
      it("should set the color", () => {
        const component = new Component.Builder().withColor({ type: "rgba", r: 10, g: 20, b: 30 });

        expect((component as any).builderProperties.color).toEqual({ type: "rgba", r: 10, g: 20, b: 30 });
      });
    });

    describe("withOpacity", () => {
      it("should set the opacity", () => {
        const component = new Component.Builder().withOpacity(0.5);

        expect((component as any).builderProperties.opacity).toEqual(0.5);
      });
    });

    describe("withEffects", () => {
      it("should set the effects", () => {
        const component = new Component.Builder().withEffects(["test" as any]);

        expect((component as any).effects).toEqual(["test"]);
      });
    });

    describe("buildComponent", () => {
      it("should build a component", () => {
        const setPropertiesMock = jest.fn();
        const setEffectsMock = jest.fn();
        const rectangleClassMock = jest.fn().mockImplementation(() => {
          return {
            setProperties: setPropertiesMock,
            setEffects: setEffectsMock,
          };
        });

        Component.typeToClass = {
          [ComponentType.Rectangle]: rectangleClassMock,
        };

        const builder = new Component.Builder();

        const component = (builder as any).buildComponent(ComponentType.Rectangle);

        expect(rectangleClassMock).toHaveBeenCalled();
        expect(setPropertiesMock).toHaveBeenCalledWith((builder as any).builderProperties);
        expect(setEffectsMock).toHaveBeenCalledWith((builder as any).effects);
      });

      it("should throw an error if the type is unknown", () => {
        Component.typeToClass = {};

        const builder = new Component.Builder();

        expect(() => (builder as any).buildComponent(ComponentType.Unknown)).toThrowError(
          "Unknown component type: unknown"
        );
      });
    });
  });

  describe("Component", () => {});

  describe("registerComponents", () => {
    it("should register the components", async () => {
      jest.mock("../rectangle/rectangle.js", () => ({ Rectangle: "rectangle" }));
      jest.mock("../rectangle/rectangleBorder.js", () => ({
        RectangleBorder: "rectangleBorder",
      }));
      jest.mock("../text/text.js", () => ({ Text: "text" }));
      jest.mock("../progressBar/progressBar.js", () => ({ ProgressBar: "progressBar" }));

      await registerComponents();

      expect(Component.typeToClass).toEqual({
        [ComponentType.Rectangle]: "rectangle",
        [ComponentType.RectangleBorder]: "rectangleBorder",
        [ComponentType.Text]: "text",
        [ComponentType.ProgressBar]: "progressBar",
      });
    });
  });
});
