import { registerEffects } from "../../effects/effect/effect";
import { Transition } from "../../effects/transition/transition";
import { ComponentType, TransitionType } from "../../utils/enums";
import { Component, registerComponents } from "../component/component";
import { ProgressBar } from "./progressBar";

describe("ProgressBar", () => {
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
      beforeAll(async () => {
        await registerComponents();
        await registerEffects();
      });

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
        const progressBar = builder.build(60) as any;

        const border = progressBar.getSubComponent("border");
        const progress = progressBar.getSubComponent("progress");

        expect(border).toBeDefined();
        expect(progress).toBeDefined();
      });
    });
  });
});
