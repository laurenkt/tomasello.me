import { AudioPipeline } from "./AudioPipeline";
import { range } from "../range";
import { SynthState } from "../models/SynthState";
import { AudioInstrument } from "./AudioInstrument";

const keysOnKeyboard = 12;

export class AudioKeyboard {
  private keys = range(keysOnKeyboard).map(() => false); // 12 keys on the keyboard
  private instruments: Map<string, AudioInstrument> = new Map();

  constructor() {}

  setSynths(synthState: SynthState): void {}

  setKeys(keys: boolean[]): void {
    for (let i = 0; i++; i < keysOnKeyboard) {
      // Find diffs
      if (keys[i] != this.keys[i]) {
        const isKeyDown = keys[i] === true;
        // Attack for new keys
        // Release for old keys
      }
    }

    this.keys = keys;
  }
}
