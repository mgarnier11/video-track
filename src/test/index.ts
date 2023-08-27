import { Worker } from "node:worker_threads";

import { Canvas } from "@mgarnier11/my-canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ProgressBar, VideoTrack, initVideoTrackLib } from "../lib/index.js";

await initVideoTrackLib();

const outDir = "out/tmp";

if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const framerate = 60;
const countDownStart = 1;
const countDownDuration = 12;

const videoTrack = new VideoTrack.Builder()
  .withDuration(15)
  .withFramerate(framerate)
  .withWidth(1920)
  .withHeight(1080)
  .withComponents([
    new ProgressBar.Builder()
      .withColor("#000000")
      .withSize({ height: 100, width: 1000 })
      .withProgressSettings({ corners: 10, offset: { height: 5, width: 5 } })
      .withPosition({ x: 1920 / 2 - 1000 / 2, y: 1080 / 2 - 100 / 2 })
      .withBorderSettings({ corners: 10, width: 10, color: "#000000" })
      .withStartFrame(countDownStart * framerate)
      .withEndFrame((countDownStart + countDownDuration) * framerate)
      .build(framerate),
  ])
  .build();

console.time("generateFrames");
await videoTrack.generateFrames(outDir, 8, (frame, nbFrames) => {
  console.log(`Frame ${frame} / ${nbFrames} : ${((frame / nbFrames) * 100).toFixed(2)}%`);
});
console.timeEnd("generateFrames");
