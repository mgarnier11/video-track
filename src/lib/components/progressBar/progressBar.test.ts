import { registerEffects } from "../../effects/effect/effect";
import { Transition } from "../../effects/transition/transition";
import { ComponentType, TransitionType } from "../../utils/enums";
import { Component, registerComponents } from "../component/component";
import { ProgressBar } from "./progressBar";
import * as utils from "../../utils/utils";
import { generateId } from "../../utils/utils";

describe("ProgressBar", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();
  });

  describe("ProgressBar.Builder", () => {
    const builder = new ProgressBar.Builder();

    describe("withSize", () => {
      it("sets the size property", () => {
        const progressBarBuilder = builder.withSize({ width: 10, height: 20 });

        expect(progressBarBuilder.builderProperties.size).toEqual({ width: 10, height: 20 });
      });
    });

    describe("withStartFrame", () => {
      it("sets the startFrame property", () => {
        const progressBarBuilder = builder.withStartFrame(10);

        expect(progressBarBuilder.builderProperties.startFrame).toEqual(10);
      });
    });

    describe("withEndFrame", () => {
      it("sets the endFrame property", () => {
        const progressBarBuilder = builder.withEndFrame(10);

        expect(progressBarBuilder.builderProperties.endFrame).toEqual(10);
      });
    });

    describe("withProgressSettings", () => {
      it("sets the progressSettings property", () => {
        const progressBarBuilder = builder.withProgressSettings({ offset: { width: 10, height: 20 }, corners: 10 });

        expect(progressBarBuilder.builderProperties.progressSettings).toEqual({
          offset: { width: 10, height: 20 },
          corners: 10,
        });
      });
    });

    describe("withBorderSettings", () => {
      it("sets the borderSettings property", () => {
        const progressBarBuilder = builder.withBorderSettings({
          width: 10,
          color: { type: "rgba", r: 10, g: 20, b: 30 },
          corners: 10,
        });

        expect(progressBarBuilder.builderProperties.borderSettings).toEqual({
          width: 10,
          color: { type: "rgba", r: 10, g: 20, b: 30 },
          corners: 10,
        });
      });
    });

    describe("withTransitionType", () => {
      it("sets the transitionType property", () => {
        const progressBarBuilder = builder.withTransitionType(TransitionType.EASE_IN_OUT);

        expect(progressBarBuilder.builderProperties.transitionType).toEqual(TransitionType.EASE_IN_OUT);
      });
    });

    describe("build", () => {
      it("should have the correct properties", () => {
        const progressBar = builder
          .withSize({ width: 10, height: 20 })
          .withStartFrame(10)
          .withEndFrame(20)
          .withProgressSettings({ offset: { width: 10, height: 20 }, corners: 10 })
          .withBorderSettings({ width: 10, color: { type: "rgba", r: 10, g: 20, b: 30 }, corners: 10 })
          .withTransitionType(TransitionType.EASE_IN_OUT)
          .build(60);

        const properties = progressBar.getProperties() as any;

        expect(properties.size).toEqual({ width: 10, height: 20 });
        expect(properties.startFrame).toEqual(10);
        expect(properties.endFrame).toEqual(20);
        expect(properties.progressSettings).toEqual({ offset: { width: 10, height: 20 }, corners: 10 });
        expect(properties.borderSettings).toEqual({
          width: 10,
          color: { type: "rgba", r: 10, g: 20, b: 30 },
          corners: 10,
        });
        expect(properties.transitionType).toEqual(TransitionType.EASE_IN_OUT);
      });

      it("should have correct effects", () => {
        const progressBar = builder
          .withEffects([new Transition.Builder().withStartFrame(0).withEndFrame(10).withEndValue(20).build()])
          .withStartFrame(10)
          .withEndFrame(30)
          .build(60) as any;

        expect(progressBar.effects).toHaveLength(2);
        expect(progressBar.effects[0].properties.startFrame).toEqual(0);
        expect(progressBar.effects[0].properties.endFrame).toEqual(10);
        expect(progressBar.effects[0].properties.endValue).toEqual(20);
        expect(progressBar.effects[1].properties.startFrame).toEqual(30);
        expect(progressBar.effects[1].properties.endFrame).toEqual(45);
        expect(progressBar.effects[1].properties.borderDelay).toEqual(2);
        expect(progressBar.effects[1].properties.nbBorders).toEqual(3);
      });

      it("should have correct subComponents", () => {
        const progressBar = builder
          .withPosition({ x: 10, y: 20 })
          .withSize({ width: 10, height: 20 })
          .withBorderSettings({
            width: 10,
            color: { type: "rgba", r: 10, g: 20, b: 30 },
            corners: 10,
          })
          .withProgressSettings({ offset: { width: 10, height: 20 }, corners: 10 })
          .withColor({ type: "rgba", r: 20, g: 30, b: 40 })
          .build(60) as any;

        const border = progressBar.getSubComponent("border") as any;
        const progress = progressBar.getSubComponent("progress") as any;

        expect(border).toBeDefined();
        expect(border.type).toEqual(ComponentType.Rectangle);
        expect(border.properties.position).toEqual({ x: 0, y: 0 });
        expect(border.properties.size).toEqual({ width: 0, height: 0 });
        expect(border.properties.corners).toEqual(10);
        expect(border.properties.borderWidth).toEqual(10);
        expect(border.properties.borderColor).toEqual({ type: "rgba", r: 10, g: 20, b: 30 });
        expect(border.properties.border).toEqual(true);
        expect(border.properties.fill).toEqual(false);

        expect(progress).toBeDefined();
        expect(progress.type).toEqual(ComponentType.Rectangle);
        expect(progress.properties.position).toEqual({ x: 10, y: 0 });
        expect(progress.properties.size).toEqual({ width: 0, height: 0 });
        expect(progress.properties.corners).toEqual(10);
        expect(progress.properties.corners).toEqual(10);
        expect(progress.properties.fill).toEqual(true);
        expect(progress.properties.border).toEqual(false);
        expect(progress.effects).toHaveLength(1);
      });
    });
  });

  describe("ProgressBar", () => {
    describe("toJSON", () => {
      it("should return the correct JSON", () => {
        jest.spyOn(utils, "generateId").mockImplementation(() => "abcdefg");

        const progressBar = new ProgressBar.Builder()
          .withSize({ width: 10, height: 20 })
          .withStartFrame(10)
          .withEndFrame(20)
          .withProgressSettings({ offset: { width: 10, height: 20 }, corners: 10 })
          .withBorderSettings({ width: 10, color: { type: "rgba", r: 10, g: 20, b: 30 }, corners: 10 })
          .withTransitionType(TransitionType.EASE_IN_OUT)
          .build(60);

        const json = progressBar.toJSON();

        expect(json.type).toEqual("progressBar");
        expect(json.properties).toEqual({
          size: { width: 10, height: 20 },
          startFrame: 10,
          endFrame: 20,
          progressSettings: { offset: { width: 10, height: 20 }, corners: 10 },
          borderSettings: { width: 10, color: { type: "rgba", r: 10, g: 20, b: 30 }, corners: 10 },
          transitionType: TransitionType.EASE_IN_OUT,
          color: { type: "rgba", r: 0, g: 0, b: 0 },
          display: true,
          opacity: 1,
          position: { x: 0, y: 0 },
        });
        expect(json.progressTransitionId).toEqual("abcdefg");
      });
    });

    describe("setSpecialProperties", () => {
      it("should set the correct properties", () => {
        const progressBar = new ProgressBar.Builder().build(60) as any;

        progressBar.setSpecialProperties({
          progressTransitionId: "abcdefg",
        });

        expect(progressBar.progressTransitionId).toEqual("abcdefg");
      });
    });

    describe("drawComponent", () => {
      it("should update the subcomponents", () => {
        const progressBar = new ProgressBar.Builder().build(60);

        const progress = (progressBar as any).getSubComponent("progress");
        const progressTransition = progress.getEffect((progressBar as any).progressTransitionId);
        const border = (progressBar as any).getSubComponent("border");

        jest.spyOn(progressTransition, "updateEndValue").mockImplementation(() => undefined);
        jest.spyOn(progress, "setProperty").mockImplementation(() => undefined);
        jest.spyOn(border, "setProperty").mockImplementation(() => undefined);

        progressBar.drawComponent(undefined as any, 0, {
          position: { x: 10, y: 20 },
          size: { width: 10, height: 20 },
          borderSettings: { width: 10, color: { type: "rgba", r: 10, g: 20, b: 30 }, corners: 10 },
          progressSettings: { offset: { width: 10, height: 20 }, corners: 10 },
          color: { type: "rgba", r: 20, g: 30, b: 40 },
        } as any);

        expect(border.setProperty).toHaveBeenCalledTimes(4);
        expect(progress.setProperty).toHaveBeenCalledTimes(5);
        expect(progressTransition.updateEndValue).toHaveBeenCalledWith(-10);

        expect(border.setProperty).toHaveBeenCalledWith("size", { width: 10, height: 20 });
        expect(border.setProperty).toHaveBeenCalledWith("borderColor", { type: "rgba", r: 10, g: 20, b: 30 });
        expect(border.setProperty).toHaveBeenCalledWith("borderWidth", 10);
        expect(border.setProperty).toHaveBeenCalledWith("corners", 10);

        expect(progress.setProperty).toHaveBeenCalledWith("position.x", 10);
        expect(progress.setProperty).toHaveBeenCalledWith("position.y", 20);
        expect(progress.setProperty).toHaveBeenCalledWith("size.height", -20);
        expect(progress.setProperty).toHaveBeenCalledWith("color", { type: "rgba", r: 20, g: 30, b: 40 });
        expect(progress.setProperty).toHaveBeenCalledWith("corners", 10);
      });
    });

    describe("setProperty", () => {
      it("should set the correct property", () => {
        const spy = jest.spyOn(Component.prototype as any, "setProperty").mockImplementation(() => undefined);

        const progressBar = new ProgressBar.Builder().build(60);

        progressBar.setProperty("size", { width: 10, height: 20 });

        expect(spy).toHaveBeenCalledWith("size", { width: 10, height: 20 });
      });
    });
  });
});
