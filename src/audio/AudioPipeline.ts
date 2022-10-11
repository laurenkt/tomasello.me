import * as Tone from "tone";
import { ToneAudioNode } from "tone";
import { SequencerConfig } from "../models/SequencerConfig";
import { InstrumentConfig } from "../models/InstrumentConfig";
import { AudioInstrument } from "./AudioInstrument";
import { Track } from "../models/Track";

export interface AudioPipelineConfig {
  onCounterIncrement: (t: number) => void;
}

function instrumentFrom(config: InstrumentConfig): AudioInstrument {
  let toneAudioNode: ToneAudioNode;
  switch (config.type) {
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

  const root = toneAudioNode;

  // apply any effects
  for (const effectConfig of config.effects) {
    let effect: ToneAudioNode;
    switch (effectConfig.type) {
      case "reverb":
        effect = new Tone.Reverb();
        break;
      case "delay":
        effect = new Tone.Delay("16n");
        break;
      case "distortion":
        effect = new Tone.Distortion(0.8);
        break;
      default:
        continue;
    }
    toneAudioNode.connect(effect);
    toneAudioNode = effect;
  }

  return new AudioInstrument(
    root,
    toneAudioNode,
    config.gain,
    config.note,
    config.duration
  );
}

export class AudioPipeline {
  private loop: Tone.Loop;
  private counter = 0;
  private instruments = [] as AudioInstrument[];
  private hashes = [] as string[];
  private sequencers = [] as SequencerConfig[];

  constructor(config: AudioPipelineConfig) {
    this.loop = new Tone.Loop((time) => {
      this.counter += 1;

      this.sequencers.forEach((sequence, idx) => {
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

  private hash(track: Track): string {
    return JSON.stringify(track);
  }

  setTracks(tracks: Track[]) {
    while (this.instruments.length > tracks.length) {
      // Remove old instruments
      const last = this.instruments.pop()!;
      this.hashes.pop();
      this.sequencers.pop();
      last.dispose();
    }
    // Replace any that changed
    tracks.forEach((track, idx) => {
      const hash = this.hash(track);
      if (hash !== this.hashes[idx]) {
        this.hashes[idx] = hash;
        this.instruments[idx] = instrumentFrom(track.instrument);
      }
    });
    this.sequencers = tracks.map((t) => t.sequencer);
  }

  attackWithSynth(synth: InstrumentConfig, degree: number) {
    const copy = structuredClone(synth);
    const tonic = Tone.Frequency(synth.note).toMidi();
    copy.note = Tone.Frequency(tonic + degree, "midi").toNote();
    const i = instrumentFrom(copy);
    i.triggerAttackRelease(Tone.now());
  }
}
