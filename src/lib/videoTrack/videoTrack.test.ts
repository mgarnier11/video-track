import { registerComponents } from "../components/component/component";
import { registerEffects } from "../effects/effect/effect";

describe("VideoTrack", () => {
  beforeAll(async () => {
    await registerComponents();
    await registerEffects();
  });

  describe("VideoTrack.Builder", () => {});

  describe("VideoTrack", () => {
    describe("toJSON", () => {});

    describe("fromJSON", () => {});

    describe("generateFrames", () => {});
  });
});
