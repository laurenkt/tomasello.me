import * as Tone from "tone";

export interface Synth {
  duration: string;
  note: string;
  type?: string;
  gain?: number;
  toneSynth: any;
  steps: number;
  sequence: boolean[];
  keyboardEnabled?: boolean;
}
