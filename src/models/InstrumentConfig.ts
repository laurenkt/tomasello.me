import { EffectConfig } from "./EffectConfig";

export interface InstrumentConfig {
  duration: string;
  note: string;
  type: string;
  gain: number;
  routeToKeyboard: boolean;
  effects: EffectConfig[];
}
