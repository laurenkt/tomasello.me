import { SequencerState } from "./SequencerState";
import { SynthState } from "./SynthState";

export interface Track {
    sequencer?: SequencerState
    synth?: SynthState
}