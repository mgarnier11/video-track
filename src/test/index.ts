import { Worker } from "node:worker_threads";

import { Canvas } from "@mgarnier11/my-canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ProgressBar, VideoTrack, initVideoTrackLib, Rectangle, Transition, Text, Switch } from "../lib/index.js";

await initVideoTrackLib();

const outDir = "out/tmp";

if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const framerate = 60;
const countDownStart = 1;
const countDownDuration = 12;
const duration = 15;

const trackWidth = 1920;
const trackHeight = 1080;

const nbWorkers = 8;

const videoTrack = new VideoTrack.Builder()
  .withDuration(duration)
  .withFramerate(framerate)
  .withWidth(trackWidth)
  .withHeight(trackHeight)
  .withBackgroundColor({ type: "rgba", r: 255, g: 255, b: 255 })
  .withComponents([
    new ProgressBar.Builder()
      .withColor("#000000")
      .withSize({ height: 100, width: 1000 })
      .withProgressSettings({ corners: 10, offset: { height: 5, width: 5 } })
      .withPosition({ x: trackWidth / 2 - 1000 / 2, y: trackHeight / 2 - 100 / 2 })
      .withBorderSettings({ corners: 10, width: 10, color: "#000000" })
      .withStartFrame(countDownStart * framerate)
      .withEndFrame((countDownStart + countDownDuration) * framerate)
      .build(framerate),
    new Rectangle.Builder()
      .withColor("red")
      .withSize({ height: 100, width: 100 })
      .withPosition({ x: 0, y: 0 })
      .withCorners(10)
      .withEffects([
        new Transition.Builder()
          .withStartFrame(0)
          .withEndFrame(600)
          .withEndValue(200)
          .withProperty("position.y")
          .build(),
      ])
      .build(),
    new Rectangle.Builder()
      .withColor("yellow")
      .withSize({ height: 100, width: 100 })
      .withPosition({ x: 100, y: 0 })
      .withCorners(10)
      .withEffects([
        new Transition.Builder()
          .withStartFrame(0)
          .withEndFrame(600)
          .withEndValue(200)
          .withProperty("position.x")
          .build(),
      ])
      .build(),
    new Text.Builder()
      .withText("Hello World")
      .withColor("blue")
      .withPosition({ x: 0, y: 400 })
      .withFontSettings({ size: 50, family: "Arial" })
      .withEffects([new Switch.Builder().withFramesToSwitch([100, 200, 300, 400]).withProperty("display").build()])
      .build(),
  ])
  .build();

console.time("generateFrames");
await videoTrack.generateFrames(outDir, nbWorkers, (frame, nbFrames) => {
  console.log(`Frame ${frame} / ${nbFrames} : ${((frame / nbFrames) * 100).toFixed(2)}%`);
});
console.timeEnd("generateFrames");

const checkFrames = () => {
  //compare all frames generated to the expected frames
  const expectedFramesDir = path.join(fileURLToPath(import.meta.url), "../../../expected");
  const expectedFrames = fs.readdirSync(expectedFramesDir);

  const generatedFrames = fs.readdirSync(outDir);

  if (expectedFrames.length !== generatedFrames.length) {
    console.log("Different number of frames generated");
    process.exit(1);
  } else {
    console.log("Same number of frames generated");
  }

  for (let i = 0; i < expectedFrames.length; i++) {
    const expectedFrame = expectedFrames[i];
    const generatedFrame = generatedFrames[i];

    const expectedFramePath = path.join(expectedFramesDir, expectedFrame);
    const generatedFramePath = path.join(outDir, generatedFrame);

    const expectedFrameBuffer = fs.readFileSync(expectedFramePath);
    const generatedFrameBuffer = fs.readFileSync(generatedFramePath);

    if (!expectedFrameBuffer.equals(generatedFrameBuffer)) {
      console.log(`Frame ${i} is different`);
      process.exit(1);
    } else {
      console.log(`Frame ${i} is identical`);
    }
  }

  console.log("All frames are identical, test is successful");
};

checkFrames();
