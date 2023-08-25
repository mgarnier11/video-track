import { workerData, parentPort } from "node:worker_threads";
import fs from "fs";
import { ProgressBar, initVideoTrackLib } from "../lib/index.js";
import { Canvas } from "@mgarnier11/my-canvas";

const timeout = (to: number) => new Promise((resolve) => setTimeout(resolve, to));

await initVideoTrackLib();

const {
  nbFrames,
  sharedBuffer,
  outDir,
  workerNb,
}: { nbFrames: number; sharedBuffer: SharedArrayBuffer; outDir: string; workerNb: number } = workerData;

console.log("Hello from worker", workerNb);

const sharedArray = new Uint8Array(sharedBuffer);

const json = String.fromCharCode(...sharedArray);

const obj = JSON.parse(json);

const progressBar = ProgressBar.fromJSON(obj);

const postMessage = (message: string) => {
  parentPort!.postMessage({ type: "message", message });
};

for (let frame = workerNb * nbFrames; frame < (workerNb + 1) * nbFrames; frame++) {
  const canvas = new Canvas(1920, 1080);
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  progressBar.draw(context, frame);

  const output = canvas.toBuffer("image/png");

  postMessage(`Generated frame ${frame}`);

  const paddedNumber = String(frame).padStart(6, "0");
  const imageFileName = `frame-${paddedNumber}.png`;

  fs.writeFileSync(`${outDir}/${imageFileName}`, output);

  postMessage(`Wrote file ${imageFileName}`);
}

postMessage("done");
