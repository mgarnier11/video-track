import { registerComponents } from "../components/component/component";
import { registerEffects } from "../effects/effect/effect";
import * as utils from "../utils/utils";
import fs from "fs";
import threads from "worker_threads";
import url from "url";
import path from "path";
import canvas from "@mgarnier11/my-canvas";
import { EventEmitter } from "events";
import { VideoTrack } from "./videoTrack";
import { initVideoTrackLib } from "..";

jest.mock("fs");
jest.mock("worker_threads");
jest.mock("url");
jest.mock("path");
jest.mock("@mgarnier11/my-canvas", () => ({
  Canvas: jest.fn(),
}));

describe("VideoTrack", () => {
  beforeAll(async () => {
    await initVideoTrackLib();
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

      it("should call generateFramesAsync", async () => {
        const videoTrack: any = new VideoTrack.Builder().build();

        const spy = jest.spyOn(videoTrack, "generateFramesAsync").mockImplementation(() => {});

        await videoTrack.generateFrames("test", 1, null);

        expect(spy).toHaveBeenCalledWith("test", 1, null);
      });

      it("should return false when an error is caught", async () => {
        const videoTrack: any = new VideoTrack.Builder().build();

        jest.spyOn(videoTrack, "generateFramesSync").mockImplementation(() => {
          throw new Error();
        });
        jest.spyOn(console, "error").mockImplementation(() => {});

        const result = await videoTrack.generateFrames("test", 0, null);

        expect(result).toBe(false);
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("generateFramesSync", () => {
      it("should call drawFrame", async () => {
        fs.writeFileSync = jest.fn();

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

    describe("generateFramesAsync", () => {
      const eventEmitter = new EventEmitter();
      const constructorMock = jest.fn();

      beforeAll(() => {
        // @ts-ignore
        threads.Worker = class {
          constructor(...args: any[]) {
            constructorMock(...args);
            return eventEmitter;
          }
        };
      });

      it("should generate new workers", async () => {
        path.join = jest.fn(() => "test/videoTrackWorker.js");

        const videoTrack: any = new VideoTrack.Builder().withDuration(10).withFramerate(10).build();

        const json = JSON.stringify(videoTrack.toJSON());
        const sharedBuffer = new SharedArrayBuffer(Buffer.byteLength(json));
        new Uint8Array(sharedBuffer).set(Buffer.from(json));

        const progressCallback = jest.fn();

        const resultPromise = videoTrack.generateFramesAsync("test", 1, progressCallback);

        const expectedCallbackCalls: number[][] = [];

        for (let i = 0; i < 100; i++) {
          eventEmitter.emit("message", { type: "new-frame", data: { frame: i } });
          expectedCallbackCalls.push([i + 1, 100]);
        }
        eventEmitter.emit("exit");

        const result = await resultPromise;

        expect(constructorMock).toHaveBeenCalledTimes(1);
        expect(constructorMock.mock.calls).toEqual([
          [
            "test/videoTrackWorker.js",
            {
              workerData: {
                sharedBuffer,
                outDir: "test",
                startFrame: 0,
                endFrame: 100,
                workerNb: 0,
              },
            },
          ],
        ]);
        expect(progressCallback).toHaveBeenCalledTimes(100);
        expect(progressCallback.mock.calls).toEqual(expectedCallbackCalls);
        expect(result).toBe(true);
      });

      it("should throw an error when it is caught", async () => {
        const videoTrack: any = new VideoTrack.Builder().withDuration(10).withFramerate(10).build();

        const json = JSON.stringify(videoTrack.toJSON());
        const sharedBuffer = new SharedArrayBuffer(Buffer.byteLength(json));
        new Uint8Array(sharedBuffer).set(Buffer.from(json));

        const progressCallback = jest.fn();

        const resultPromise = videoTrack.generateFramesAsync("test", 1, progressCallback);

        eventEmitter.emit("error", new Error());

        expect(resultPromise).rejects.toThrowError();
      });
    });

    describe("drawFrame", () => {
      it("should return the correct frame", async () => {
        const drawFn = jest.fn();
        const canvasConstructor = jest.fn();
        const contextFillRect = jest.fn();
        const canvasGetContext = jest
          .fn()
          .mockReturnValue({ fillRect: contextFillRect, canvas: { width: 1920, height: 1080 } });

        // @ts-ignore
        canvas.Canvas = class {
          constructor(...args: any[]) {
            canvasConstructor(...args);
          }
          getContext = canvasGetContext;
          toBuffer = jest.fn(() => Buffer.from("test"));
        };

        const videoTrack: any = new VideoTrack.Builder()
          .withDuration(10)
          .withFramerate(60)
          .withHeight(1080)
          .withWidth(1920)
          .withComponents([{ draw: drawFn }, { draw: drawFn }, { draw: drawFn }] as any)
          .build();

        const frame = await videoTrack.drawFrame(0);

        expect(canvasConstructor).toHaveBeenCalledWith(1920, 1080);
        expect(canvasGetContext).toHaveBeenCalledWith("2d");
        expect(contextFillRect).toHaveBeenCalledWith(0, 0, 1920, 1080);
        expect(drawFn).toHaveBeenCalledTimes(3);
        expect(frame).toBeInstanceOf(Buffer);
      });
    });
  });
});
