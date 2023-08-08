import { Canvas } from "canvas";
import fs from "fs";
import { ProgressBar, initVideoTrackLib } from "../lib/index.js";

await initVideoTrackLib();

const noGen = process.argv[2] === "noGen";

console.log(process.argv);
console.log("noGen", noGen);

const outDir = "out/tmp";
if (!noGen) {
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });
}

const progressBar = new ProgressBar.Builder()
  .withColor("#000000")
  .withSize({ height: 100, width: 1000 })
  .withPosition({ x: 1920 / 2 - 1000 / 2, y: 1080 / 2 - 100 / 2 })
  .withStartFrame(0)
  .withEndFrame(60)
  .build(30);

for (let frame = 1; frame <= 75; frame++) {
  const canvas = new Canvas(1920, 1080);
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);

  progressBar.draw(context, frame);

  const output = canvas.toBuffer("image/png");

  console.log(`Generated frame ${frame}`);

  if (!noGen) {
    const paddedNumber = String(frame).padStart(6, "0");
    const imageFileName = `frame-${paddedNumber}.png`;

    fs.writeFileSync(`${outDir}/${imageFileName}`, output);

    console.log(`Wrote file ${imageFileName}`);
  }
}
