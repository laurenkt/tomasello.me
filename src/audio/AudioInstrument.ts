import * as Tone from "tone";

export class AudioInstrument {
  private readonly gainNode: Tone.Gain;

  constructor(
    private source: Tone.ToneAudioNode,
    private final: Tone.ToneAudioNode,
    gain: number,
    private note: string,
    private duration: string
  ) {
    this.gainNode = new Tone.Gain(gain).toDestination();
    this.final.connect(this.gainNode);
  }

  dispose() {
    this.source.dispose();
    this.gainNode.dispose();
  }

  triggerAttackRelease(time: number): void {
    // @ts-ignore Tone doesn't expose the Instrument type?
    this.source.triggerAttackRelease(this.note, this.duration, time);
  }
}
