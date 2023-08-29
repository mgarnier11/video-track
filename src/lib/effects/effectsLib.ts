import { TransitionType } from "../utils/enums.js";
import { Effect } from "./effect/effect.js";
import { Set } from "./set/set.js";
import { Transition } from "./transition/transition.js";

export class EffectsLib {
  public static Fade(startFrame: number, endFrame: number, direction: "in" | "out"): Effect[] {
    return [
      new Transition.Builder()
        .withProperty("opacity")
        .withEndValue(direction === "in" ? 1 : 0)
        .withStartFrame(startFrame)
        .withEndFrame(endFrame)
        .withTransitionType(TransitionType.LINEAR)
        .build(),
      new Set.Builder()
        .withProperty("display")
        .withFrameToSet(direction === "in" ? startFrame : endFrame)
        .withValue(direction === "in" ? true : false)
        .build(),
    ];
  }
}
