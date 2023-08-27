import { registerComponents } from "../components/component/component";
import { registerEffects } from "../effects/effect/effect";
import * as utils from "../utils/utils";
import { VideoTrack } from "./videoTrack";

describe("VideoTrack", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();
  });

  describe("VideoTrack.Builder", () => {
    const builder: any = new VideoTrack.Builder();

    describe("setProperty", () => {
      it("should set the property", () => {
        jest.spyOn(utils, "setPropertyValue").mockImplementation(() => {});

        const builderReturn = builder.setProperty("test", 10);

        expect(utils.setPropertyValue).toHaveBeenCalledWith(expect.any(Object), "test", 10);
        expect(builderReturn).toBe(builder);
      });
    });

    describe("withDuration", () => {
      it("should set the duration", () => {
        const componentBuilder = builder.withDuration(10);

        expect(componentBuilder.builderProperties.duration).toBe(10);
      });
    });

    describe("withFramerate", () => {
      it("should set the framerate", () => {
        const componentBuilder = builder.withFramerate(10);

        expect(componentBuilder.builderProperties.framerate).toBe(10);
      });
    });

    describe("withWidth", () => {
      it("should set the width", () => {
        const componentBuilder = builder.withWidth(10);

        expect(componentBuilder.builderProperties.width).toBe(10);
      });
    });

    describe("withHeight", () => {
      it("should set the height", () => {
        const componentBuilder = builder.withHeight(10);

        expect(componentBuilder.builderProperties.height).toBe(10);
      });
    });

    describe("withComponents", () => {
      it("should set the components", () => {
        const componentBuilder = builder.withComponents(["test"]);

        expect(componentBuilder.components).toEqual(["test"]);
      });
    });

    describe("build", () => {
      it("should build a VideoTrack", () => {
        const componentBuilder = builder.build();

        expect(componentBuilder).toBeInstanceOf(VideoTrack);
      });
    });
  });

  describe("VideoTrack", () => {
    describe("toJSON", () => {
      it("should return the correct JSON", () => {
        const videoTrack = new VideoTrack.Builder()
          .withDuration(10)
          .withFramerate(60)
          .withWidth(1920)
          .withHeight(1080)
          .build();

        const json = videoTrack.toJSON();

        expect(json).toEqual({
          properties: {
            duration: 10,
            framerate: 60,
            width: 1920,
            height: 1080,
            backgroundColor: { type: "rgba", r: 0, g: 0, b: 0 },
          },
          components: [],
        });
      });
    });

    describe("fromJSON", () => {});

    describe("generateFrames", () => {});
  });
});
