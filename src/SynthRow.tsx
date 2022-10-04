import { useState } from "react";
import { Synth } from "./Synth";
import * as Tone from "tone";

export function SynthRow({
  synth,
  timeStep,
}: {
  synth: Synth;
  timeStep: number;
}) {
  const [input, setInput] = useState(`${synth.note}/${synth.duration}`);

  function onChange(newInput: string) {
    setInput(newInput);
    const pattern = new RegExp(
      /(?<note>[^\/]+)\/(?<duration>[^ ]+)(\s*)(?<synthType>@[^ ]+)?(\s*)(?<steps>s[0-9]+)?(\s*)(?<volume>[0-9]+%)?$/i
    );
    const match = newInput.match(pattern);
    if (match) {
      synth.note = match.groups!["note"];
      synth.duration = match.groups!["duration"];
      const synthType = (match.groups ?? {})["synthType"] ?? "sine";
      const steps = +((match.groups ?? {})["steps"] ?? "s16").slice(1);
      const volumeStr = (match.groups ?? {})["volume"] ?? "100%";
      const volume = +volumeStr.slice(0, volumeStr.length - 1) / 100.0;
      const old = synth.type;
      if (old != synthType || volume != synth.gain) {
        const gain = new Tone.Gain(volume).toDestination();
        switch (synthType) {
          case "@duo":
            synth.type = "duo";
            synth.toneSynth.disconnect();
            synth.toneSynth = new Tone.DuoSynth().connect(gain);
            break;
          case "@am":
            synth.type = "am";
            synth.toneSynth.disconnect();
            synth.toneSynth = new Tone.AMSynth().connect(gain);
            break;
          case "@fm":
            synth.type = "fm";
            synth.toneSynth.disconnect();
            synth.toneSynth = new Tone.FMSynth().connect(gain);
            break;
          case "@membrane":
            synth.type = "membrane";
            synth.toneSynth.disconnect();
            synth.toneSynth = new Tone.MembraneSynth().connect(gain);
            break;
          default:
          case "@sine":
            synth.type = "sine";
            synth.toneSynth.disconnect();
            synth.toneSynth = new Tone.Synth().connect(gain);
            break;
        }
      }
      if (steps !== synth.steps) {
        synth.steps = steps;
        if (steps > synth.sequence.length) {
          for (let i = synth.sequence.length; i < steps; i++) {
            synth.sequence.push(false);
          }
        }
      }
    }
  }

  return (
    <tr>
      <th>
        <input
          type="text"
          value={input}
          onChange={(e) => onChange(e.target.value)}
        />
      </th>
      <th>
        <button
          onClick={() => (synth.keyboardEnabled = !synth.keyboardEnabled)}
          style={{
            fontWeight: synth.keyboardEnabled ? "bold" : "normal",
            backgroundColor: synth.keyboardEnabled ? "blue" : "transparent",
          }}
        >
          {synth.keyboardEnabled ? "Disconnect" : "Connect to Keyboard"}
        </button>
      </th>
      {synth.sequence.slice(0, synth.steps).map((enabled, t) => (
        <td key={t} className={t == timeStep % synth.steps ? "active" : ""}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => (synth.sequence[t] = !synth.sequence[t])}
          />
        </td>
      ))}
    </tr>
  );
}
