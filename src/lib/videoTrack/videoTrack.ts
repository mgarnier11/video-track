import { Canvas } from "@mgarnier11/my-canvas";
import fs from "fs";
import path from "path";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { Component } from "../components/component/component.js";
import { dumbDeepCopy, setPropertyValue } from "../utils/utils.js";
import { Color } from "../utils/interfaces.js";
import { CanvasUtils } from "../utils/canvasUtils.js";

type VideoTrackProperties = {
  width: number;
  height: number;
  framerate: number;
  duration: number;
  backgroundColor: Color;
};

const defaultVideoTrackProperties: VideoTrackProperties = {
  width: 1920,
  height: 1080,
  framerate: 30,
  duration: 10,
  backgroundColor: { type: "rgba", r: 0, g: 0, b: 0 },
};

class Builder {
  private setProperty<T>(propertyPath: keyof T, value: any): this {
    setPropertyValue(this.builderProperties, propertyPath as string, value);

    return this;
  }

  private builderProperties: VideoTrackProperties = dumbDeepCopy(defaultVideoTrackProperties);
  private components: Component[] = [];

  public withWidth(width: number): this {
    return this.setProperty<VideoTrackProperties>("width", width);
  }

  public withHeight(height: number): this {
    return this.setProperty<VideoTrackProperties>("height", height);
  }

  public withFramerate(framerate: number): this {
    return this.setProperty<VideoTrackProperties>("framerate", framerate);
  }

  public withDuration(duration: number): this {
    return this.setProperty<VideoTrackProperties>("duration", duration);
  }

  public withBackgroundColor(color: Color): this {
    return this.setProperty<VideoTrackProperties>("backgroundColor", color);
  }

  public withComponents(components: Component[]): this {
    this.components = components;
    return this;
  }

  public build(): VideoTrack {
    const videoTrack = new VideoTrack();

    videoTrack.setProperties(this.builderProperties);
    videoTrack.setComponents(this.components);

    return videoTrack;
  }
}

export class VideoTrack {
  public static Builder = Builder;

  private properties: VideoTrackProperties = dumbDeepCopy(defaultVideoTrackProperties);
  private components: Component[] = [];

  public get numberOfFrames(): number {
    return this.properties.duration * this.properties.framerate;
  }

  public setProperties(properties: VideoTrackProperties): void {
    this.properties = dumbDeepCopy(properties);
  }

  public setComponents(components: Component[]): void {
    this.components = components;
  }

  public toJSON(): any {
    return {
      properties: this.properties,
      components: this.components.map((component) => component.toJSON()),
    };
  }

  public static fromJSON(json: any): VideoTrack {
    const videoTrack = new VideoTrack();

    videoTrack.setProperties(json.properties);
    videoTrack.setComponents(json.components.map((component: any) => Component.fromJSON(component)));

    return videoTrack;
  }

  public async generateFrames(
    outputPath: string,
    numberOfWorkers: number = 0,
    progressCallback?: (framesGenerated: number, nbFrames: number) => void
  ): Promise<boolean> {
    try {
      if (numberOfWorkers === 0) {
        return this.generateFramesSync(outputPath, progressCallback);
      } else {
        return this.generateFramesAsync(outputPath, numberOfWorkers, progressCallback);
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private async generateFramesSync(
    outputPath: string,
    progressCallback?: (frameGenerated: number, nbFrames: number) => void
  ) {
    for (let frame = 0; frame < this.numberOfFrames; frame++) {
      const paddedNumber = String(frame).padStart(6, "0");
      const imageFileName = `frame-${paddedNumber}.png`;

      const output = await this.drawFrame(frame);

      fs.writeFileSync(`${outputPath}/${imageFileName}`, output);

      if (progressCallback) progressCallback(frame, this.numberOfFrames);
    }

    return true;
  }

  private generateFramesAsync(
    outputPath: string,
    numberOfWorkers: number,
    progressCallback?: (frameGenerated: number, nbFrames: number) => void
  ) {
    return new Promise<boolean>((resolve, reject) => {
      const json = JSON.stringify(this.toJSON());

      const sharedBuffer = new SharedArrayBuffer(Buffer.byteLength(json));
      const sharedArray = new Uint8Array(sharedBuffer);

      sharedArray.set(Buffer.from(json));

      const workers: Worker[] = [];
      const framesGenerated = [];

      const framesPerWorker = Math.ceil(this.numberOfFrames / numberOfWorkers);

      const dirName = path.dirname(fileURLToPath(import.meta.url));
      const workerPath = path.join(dirName, "videoTrackWorker.js");

      const promises = [];

      for (let i = 0; i < numberOfWorkers; i++) {
        const startFrame = i * framesPerWorker;
        const endFrame = Math.min((i + 1) * framesPerWorker, this.numberOfFrames);

        const worker = new Worker(workerPath, {
          workerData: { sharedBuffer, startFrame, endFrame, outDir: outputPath, workerNb: i },
        });
        const promise = new Promise<void>((res, rej) => {
          worker.on("message", ({ type, data }) => {
            if (type === "new-frame") {
              framesGenerated.push(data.frame);

              if (progressCallback) progressCallback(framesGenerated.length, this.numberOfFrames);
            }
          });

          worker.on("error", (err) => {
            rej(err);
          });

          worker.on("exit", (code) => {
            console.log(`Worker ${i} exited with code ${code}`);
            res();
          });
        });

        workers.push(worker);
        promises.push(promise);
      }

      Promise.all(promises)
        .then(() => {
          console.log("All workers finished");
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  public async drawFrame(frame: number): Promise<Buffer> {
    const canvas = new Canvas(this.properties.width, this.properties.height);
    const context = canvas.getContext("2d");

    context.fillStyle = CanvasUtils.getColorString(this.properties.backgroundColor);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    for (const component of this.components) {
      await component.draw(context, frame);
    }

    return canvas.toBuffer("image/png");
  }
}
