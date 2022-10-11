import { SequencerConfig } from "./SequencerConfig";
import { InstrumentConfig } from "./InstrumentConfig";

export interface Track {
  id: string;
  sequencer: SequencerConfig;
  instrument: InstrumentConfig;
}
