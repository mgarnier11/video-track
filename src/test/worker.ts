import { workerData } from "node:worker_threads";
import fs from "fs";
import { ProgressBar, initVideoTrackLib } from "../lib/index.js";
import { Canvas } from "canvas";

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
const json = sharedArray.toString();
const obj = JSON.parse(json);

const progressBar = ProgressBar.fromJSON(obj);

for (let frame = 0; frame < (workerNb + 1) * nbFrames; frame++) {
  const canvas = new Canvas(1920, 1080);
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  progressBar.draw(context, frame);

  const output = canvas.toBuffer("image/png");

  console.log(`Generated frame ${frame}`);

  const paddedNumber = String(frame).padStart(6, "0");
  const imageFileName = `frame-${paddedNumber}.png`;

  fs.writeFileSync(`${outDir}/${imageFileName}`, output);

  console.log(`Wrote file ${imageFileName}`);
}

postMessage("done");
