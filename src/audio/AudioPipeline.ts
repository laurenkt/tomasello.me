import * as Tone from "tone";
import { ToneAudioNode } from "tone";
import { SequencerState } from "../models/SequencerState";
import { SynthState } from "../models/SynthState";
import { AudioInstrument } from "./AudioInstrument";

export interface AudioPipelineConfig {
  onCounterIncrement: (t: number) => void;
}

function instrumentFrom(synthState: SynthState): AudioInstrument {
  let toneAudioNode: ToneAudioNode;
  switch (synthState.type) {
    case "am":
      toneAudioNode = new Tone.AMSynth();
      break;
    case "fm":
      toneAudioNode = new Tone.FMSynth();
      break;
    case "duo":
      toneAudioNode = new Tone.DuoSynth();
      break;
    case "membrane":
      toneAudioNode = new Tone.MembraneSynth();
      break;
    case "noise":
      toneAudioNode = new Tone.NoiseSynth();
      break;
    case "metal":
      toneAudioNode = new Tone.MetalSynth();
      break;
    case "sine":
    default:
      toneAudioNode = new Tone.Synth();
      break;
  }
  return new AudioInstrument(
    toneAudioNode,
    synthState.gain,
    synthState.note,
    synthState.duration
  );
}

export class AudioPipeline {
  private loop: Tone.Loop;
  private counter = 0;
  private instruments = [] as AudioInstrument[];
  private hashes = [] as string[];
  private sequences = [] as SequencerState[];

  constructor(config: AudioPipelineConfig) {
    this.loop = new Tone.Loop((time) => {
      this.counter += 1;

      this.sequences.forEach((sequence, idx) => {
        if (sequence.sequence[this.counter % sequence.steps]) {
          this.instruments[idx].triggerAttackRelease(time);
        }
      });

      config.onCounterIncrement(this.counter);
    }, "8n");
    this.loop.start(Tone.now());
    Tone.Transport.start();
  }

  play() {
    this.loop.start();
  }

  pause() {
    this.loop.stop();
  }

  private hash(sequencerState: SequencerState): string {
    return JSON.stringify(sequencerState);
  }

  setSequencers(sequencers: SequencerState[]) {
    while (this.instruments.length > sequencers.length) {
      // Remove old instruments
      const last = this.instruments.pop()!;
      this.hashes.pop();
      this.sequences.pop();
      last.dispose();
    }
    // Replace any that changed
    sequencers.forEach((sequencer, idx) => {
      const hash = this.hash(sequencer);
      if (hash !== this.hashes[idx]) {
        this.hashes[idx] = hash;
        this.instruments[idx] = instrumentFrom(sequencer.synthState);
      }
    });
    this.sequences = sequencers;
  }

  attackWithSynth(synth: SynthState, degree: number) {
    const copy = structuredClone(synth);
    const tonic = Tone.Frequency(synth.note).toMidi();
    copy.note = Tone.Frequency(tonic + degree, "midi").toNote();
    const i = instrumentFrom(copy);
    i.triggerAttackRelease(Tone.now());
  }
}
