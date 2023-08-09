import { registerEffects } from "../../effects/effect/effect";
import { ComponentType } from "../../utils/enums";
import { registerComponents } from "../component/component";
import { Text } from "./text";

describe("Text", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();
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
        const spy = jest.spyOn(Text.Builder.prototype as any, "buildComponent");

        builder.build();

        expect(spy).toHaveBeenCalledWith(ComponentType.Text);
      });
    });
  });
});
