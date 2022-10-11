import * as Tone from "tone";

export class AudioInstrument {
  private readonly gainNode: Tone.Gain;

  constructor(
    private instrument: Tone.ToneAudioNode,
    gain: number,
    private note: string,
    private duration: string
  ) {
    this.gainNode = new Tone.Gain(gain).toDestination();
    this.instrument.connect(this.gainNode);
  }

  dispose() {
    this.instrument.dispose();
    this.gainNode.dispose();
  }

  triggerAttackRelease(time: number): void {
    // @ts-ignore Tone doesn't expose the Instrument type?
    this.instrument.triggerAttackRelease(this.note, this.duration, time);
  }
}
