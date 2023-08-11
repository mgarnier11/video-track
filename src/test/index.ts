import { Worker } from "node:worker_threads";

import { Canvas } from "canvas";
import fs from "fs";
import path from "path";
import { ProgressBar, initVideoTrackLib } from "../lib/index.js";

await initVideoTrackLib();

const noGen = process.argv[2] === "noGen";

console.log(process.argv);
console.log("noGen", noGen);

const framerate = 60;
const videoDuration = 15;
const countDownStart = 1;
const countDownDuration = 12;
const totalFrames = framerate * videoDuration;

const outDir = "out/tmp";
if (!noGen) {
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
}

const progressBar = new ProgressBar.Builder()
  .withColor("#000000")
  .withSize({ height: 100, width: 1000 })
  .withPosition({ x: 1920 / 2 - 1000 / 2, y: 1080 / 2 - 100 / 2 })
  .withStartFrame(countDownStart * framerate)
  .withEndFrame((countDownStart + countDownDuration) * framerate)
  .build(framerate);

// for (let frame = 1; frame <= totalFrames; frame++) {
//   const canvas = new Canvas(1920, 1080, "svg");
//   const context = canvas.getContext("2d");

//   context.fillStyle = "#ffffff";
//   context.fillRect(0, 0, context.canvas.width, context.canvas.height);

//   progressBar.draw(context, frame);

//   const paddedNumber = String(frame).padStart(6, "0");
//   const imageFileName = `frame-${paddedNumber}.svg`;

//   fs.writeFileSync(`${outDir}/${imageFileName}`, canvas.toBuffer());
// }

// console.log("Generated svg files");

const json = JSON.stringify(progressBar.toJSON());

console.log(json);

const sharedBuffer = new SharedArrayBuffer(Buffer.byteLength(json));
const sharedArray = new Uint8Array(sharedBuffer);

sharedArray.set(Buffer.from(json));

const workers = [];

const nbWorker = 8;
const framesPerWorker = Math.ceil(totalFrames / nbWorker);

const dirName = path.dirname(new URL(import.meta.url).pathname);
const workerPath = path.join(dirName, "worker.js");

for (let i = 0; i < nbWorker; i++) {
  workers.push(
    new Worker(workerPath, { workerData: { sharedBuffer, nbFrames: framesPerWorker, outDir, workerNb: i } })
  );
}

workers.forEach((worker, i) => {
  worker.on("message", ({ type, message }) => {
    console.log(`Worker ${i} : ${message}`);
  });
});

// const nbWorker = 8;

// const workers = [];

// const outDir = "out/tmp2";
// if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
// fs.mkdirSync(outDir, { recursive: true });

// const dirName = path.dirname(new URL(import.meta.url).pathname).substring(1);

// const workerPath = path.join(dirName, "worker.js");

// console.log(workerPath);

// for (let i = 0; i < nbWorker; i++) {
//   workers.push(new Worker(workerPath, { workerData: { it: 100, outDir, workerNb: i } }));
// }
