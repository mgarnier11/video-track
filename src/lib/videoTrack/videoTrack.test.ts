import { registerComponents } from "../components/component/component";
import { registerEffects } from "../effects/effect/effect";
import * as utils from "../utils/utils";
import * as fs from "fs";
import { VideoTrack } from "./videoTrack";

describe("VideoTrack", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();

    jest.mock("fs", () => {
      const originalFs = jest.requireActual("fs");
      return {
        ...originalFs,
        writeFileSync: jest.fn(originalFs.writeFileSync),
      };
    });

    jest.mock("worker_threads", () => {
      const originalWorkerThreads = jest.requireActual("worker_threads");
      return {
        ...originalWorkerThreads,
        Worker: class {
          on = jest.fn();
        },
      };
    });

    jest.mock("path", () => {
      const originalPath = jest.requireActual("path");

      return {
        ...originalPath,

        dirname: jest.fn(() => "test"),
      };
    });
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

    describe("withBackgroundColor", () => {
      it("should set the backgroundColor", () => {
        const componentBuilder = builder.withBackgroundColor("#ffffff");

        expect(componentBuilder.builderProperties.backgroundColor).toBe("#ffffff");
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

    describe("fromJSON", () => {
      it("should return the correct VideoTrack", () => {
        const json = {
          properties: {
            duration: 20,
            framerate: 75,
            width: 1280,
            height: 720,
            backgroundColor: "#ffffff",
          },
          components: [],
        };

        const videoTrack = VideoTrack.fromJSON(json);

        expect(videoTrack).toBeInstanceOf(VideoTrack);
        expect((videoTrack as any).properties).toEqual({
          duration: 20,
          framerate: 75,
          width: 1280,
          height: 720,
          backgroundColor: "#ffffff",
        });
      });
    });

    describe("numberOfFrames", () => {
      it("should return the correct number of frames", () => {
        const videoTrack = new VideoTrack.Builder().withDuration(10).withFramerate(60).build();

        expect(videoTrack.numberOfFrames).toBe(600);
      });
    });

    describe("generateFrames", () => {
      it("should call generateFramesSync", () => {
        const videoTrack: any = new VideoTrack.Builder().build();

        const spy = jest.spyOn(videoTrack, "generateFramesSync").mockImplementation(() => {});

        videoTrack.generateFrames("test", 0, null);

        expect(spy).toHaveBeenCalledWith("test", null);
      });

      it("should call generateFramesAsync", () => {
        const videoTrack: any = new VideoTrack.Builder().build();

        const spy = jest.spyOn(videoTrack, "generateFramesAsync").mockImplementation(() => {});

        videoTrack.generateFrames("test", 1, null);

        expect(spy).toHaveBeenCalledWith("test", 1, null);
      });

      it("should return false when an error is caught", async () => {
        const videoTrack: any = new VideoTrack.Builder().build();

        jest.spyOn(videoTrack, "generateFramesSync").mockImplementation(() => {
          throw new Error();
        });

        const result = await videoTrack.generateFrames("test", 0, null);

        expect(result).toBe(false);
      });
    });

    describe("generateFramesSync", () => {
      it("should call drawFrame", async () => {
        const videoTrack: any = new VideoTrack.Builder().withDuration(10).withFramerate(1).build();

        const drawFrameSpy = jest.spyOn(videoTrack, "drawFrame").mockImplementation(() => {});
        const progressCallback = jest.fn();

        const result = await videoTrack.generateFramesSync("test", progressCallback);

        expect(drawFrameSpy).toHaveBeenCalledTimes(10);
        expect(progressCallback).toHaveBeenCalledTimes(10);
        expect(fs.writeFileSync).toHaveBeenCalledTimes(10);
        expect(result).toBe(true);
      });
    });

    fdescribe("generateFramesAsync", () => {
      it("should generate new workers", async () => {
        const videoTrack: any = new VideoTrack.Builder().withDuration(10).withFramerate(1).build();
        const json = JSON.stringify(videoTrack.toJSON());

        const sharedBuffer = new SharedArrayBuffer(Buffer.byteLength(json));
        new Uint8Array(sharedBuffer).set(Buffer.from(json));

        const progressCallback = jest.fn();
        const fileURLToPathSpy = jest.spyOn(require("url"), "fileURLToPath").mockImplementation(() => "test");

        const result = videoTrack.generateFramesAsync("test", 1, progressCallback);

        // expect(Worker).toHaveBeenCalledTimes(4);
        expect(Worker).toHaveBeenCalledWith([
          "test/videoTrackWorker.js",
          {
            workerData: {
              sharedBuffer,
              outputPath: "test",
              startFrame: 0,
              endFrame: 10,
              workerNb: 0,
            },
          },
        ]);
      });
    });
  });
});
