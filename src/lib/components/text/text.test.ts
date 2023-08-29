import { initVideoTrackLib } from "../..";
import { registerEffects } from "../../effects/effect/effect";
import { ComponentType } from "../../utils/enums";
import { Component, registerComponents } from "../component/component";
import { Text } from "./text";

describe("Text", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
  });

  describe("Text.Builder", () => {
    const builder = new Text.Builder();

    describe("withTextAlign", () => {
      it("sets the textAlign property", () => {
        const textBuilder = builder.withTextAlign("center");

        expect(textBuilder.builderProperties.textAlign).toEqual("center");
      });
    });

    describe("withFontSettings", () => {
      it("sets the fontSettings property", () => {
        const textBuilder = builder.withFontSettings({
          family: "Arial",
          size: 12,
        });

        expect(textBuilder.builderProperties.fontSettings).toEqual({
          family: "Arial",
          size: 12,
        });
      });
    });

    describe("withText", () => {
      it("sets the text property", () => {
        const textBuilder = builder.withText("test");

        expect(textBuilder.builderProperties.text).toEqual("test");
      });
    });

    describe("build", () => {
      it("call the super method builderComponent", () => {
        const spy = jest.spyOn(Component.Builder.prototype as any, "buildComponent");

        builder.build();

        expect(spy).toHaveBeenCalledWith(ComponentType.Text);
      });
    });
  });

  describe("Text", () => {
    describe("drawComponent", () => {
      it("draws the text from the properties", () => {
        const text = new Text.Builder().build();

        const updatedProperties = {
          color: "red",
          display: true,
          opacity: 1,
          position: { x: 25, y: 40 },
          textAlign: "center" as CanvasTextAlign,
          fontSettings: { size: 100, family: "Arial" },
          text: "test",
        };

        const context = {
          fillText: jest.fn(),
        } as any;

        text.drawComponent(context, 0, updatedProperties);

        expect(context.fillText).toHaveBeenCalledWith(
          updatedProperties.text,
          updatedProperties.position.x,
          updatedProperties.position.y
        );
        expect(context.font).toEqual("100px Arial");
        expect(context.fillStyle).toEqual("red");
        expect(context.textAlign).toEqual("center");
      });

      it("draws the text from the parameter", () => {
        const text = new Text.Builder().build();

        const updatedProperties = {
          color: "red",
          display: true,
          opacity: 1,
          position: { x: 25, y: 40 },
          textAlign: "center" as CanvasTextAlign,
          fontSettings: { size: 100, family: "Arial" },
          text: "test",
        };

        const context = {
          fillText: jest.fn(),
        } as any;

        text.drawComponent(context, 0, updatedProperties, "test2");

        expect(context.fillText).toHaveBeenCalledWith(
          "test2",
          updatedProperties.position.x,
          updatedProperties.position.y
        );
        expect(context.font).toEqual("100px Arial");
        expect(context.fillStyle).toEqual("red");
        expect(context.textAlign).toEqual("center");
      });
    });

    describe("setProperty", () => {
      it("call the super method setProperty", () => {
        const text = new Text.Builder().build();
        const spy = jest.spyOn(Component.prototype as any, "setProperty");

        text.setProperty("textAlign", "center");

        expect(spy).toHaveBeenCalledWith("textAlign", "center");
      });
    });
  });
});
