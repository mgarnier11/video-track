import { workerData, parentPort } from "node:worker_threads";
import { VideoTrack } from "./videoTrack.js";
import fs from "fs";
import { initVideoTrackLib } from "../index.js";
import { WorkerData } from "../utils/interfaces.js";

await initVideoTrackLib();

const run = async (startFrame: number, endFrame: number, sharedBuffer: SharedArrayBuffer, outDir: string) => {
  const sharedArray = new Uint8Array(sharedBuffer);
  const json = JSON.parse(String.fromCharCode(...sharedArray));

  const videoTrack = VideoTrack.fromJSON(json);

  const postData = (type: string, data: any) => {
    parentPort!.postMessage({ type, data });
  };

  for (let frame = startFrame; frame < endFrame; frame++) {
    const output = await videoTrack.drawFrame(frame);

    const paddedNumber = String(frame).padStart(6, "0");
    const imageFileName = `frame-${paddedNumber}.png`;
    const imagePath = `${outDir}/${imageFileName}`;

    fs.writeFileSync(imagePath, output);

    postData("new-frame", { frame });
  }
};

const { startFrame, endFrame, sharedBuffer, outDir, workerNb }: WorkerData = workerData;

console.log("Hello from worker", workerNb);

await run(startFrame, endFrame, sharedBuffer, outDir);

console.log("Bye from worker", workerNb);
