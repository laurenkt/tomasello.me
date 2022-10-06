import { useCallback, useEffect, useState } from "react";
import { SequencerEditor } from "./SequencerEditor";
import { Keyboard } from "./Keyboard";
import { SequencerState } from "../models/SequencerState";
import { range } from "../range";
import { AudioPipeline } from "../AudioPipeline";

let t = 0;

let audioPipeline: AudioPipeline;

const defaultNotes = ["C4", "D4", "E4", "F4", "G4", "A5", "B5"];

export default function Workstation() {
  const [bpm, setBpm] = useState(180);
  const [isPaused, setPaused] = useState(false);
  const [globalStepIncrement, setGlobalStepIncrement] = useState(0);
  const [sequencers, setSequencers] = useState(
    defaultNotes.map((note): SequencerState => {
      return {
        sequence: range(16).map(() => false),
        steps: 16,
        synthState: {
          duration: "8n",
          gain: 1,
          note: note,
          routeToKeyboard: false,
          type: "sine",
        },
      };
    })
  );

  const onAddSequencerRow = useCallback(() => {
    const delta: SequencerState[] = [
      {
        sequence: range(8).map(() => false),
        steps: 16,
        synthState: {
          duration: "8n",
          gain: 1,
          note: "C4",
          type: "sine",
          routeToKeyboard: false,
        },
      },
    ];
    setSequencers(sequencers.concat(delta));
  }, [sequencers]);

  function onChangeSequencer(idx: number, next: SequencerState) {
    const replacement = [...sequencers];
    replacement[idx] = next;
    setSequencers(replacement);
  }

  useEffect(() => {
    audioPipeline = new AudioPipeline({
      onCounterIncrement: setGlobalStepIncrement,
    });
  }, []);

  useEffect(() => {
    audioPipeline.setSequencers(sequencers);
  }, [sequencers]);

  const [activeKeys, setActiveKeys] = useState(range(12).map(() => false));

  function setAtIndex(to: boolean, bools: boolean[], idx: number): boolean[] {
    const copy = [...bools];
    copy[idx] = to;
    return copy;
  }

  const setActiveKey = (degree: number) => {
    setActiveKeys((activeKeys) => setAtIndex(true, activeKeys, degree));
  };

  const removeActiveKey = (degree: number) => {
    setActiveKeys((activeKeys) => setAtIndex(false, activeKeys, degree));
  };

  useEffect(() => {
    const keyboardEnabled = sequencers
      .map((s) => s.synthState)
      .filter((s) => s.routeToKeyboard);

    for (const synth of keyboardEnabled) {
      for (let degree = 0; degree < activeKeys.length; degree++) {
        if (activeKeys[degree]) {
          audioPipeline.attackWithSynth(synth, degree);
        }
      }
    }
  }, [activeKeys, sequencers]);

  return (
    <>
      <h3>Tips</h3>
      <ul>
        <li>
          Input like <code>C4/8n</code> means play a C4 eighth note
        </li>
        <li>
          Try changing instrument by using <code>@duo</code>,{" "}
          <code>@membrane</code>, <code>@am</code>, <code>@fm</code>,{" "}
          <code>@sine</code>
        </li>
        <li>
          Change the number of ticks by using e.g. <code>s32</code> — they don't
          have to match
        </li>
        <li>
          Set the gain by adding <code>90%</code>
        </li>
      </ul>
      <h3>Sequencer</h3>
      <button onClick={() => setPaused(!isPaused)}>
        {isPaused ? "▶️ Play" : "⏸ Pause"}
      </button>
      BPM:{" "}
      <input
        type="text"
        value={bpm}
        onChange={(e) => setBpm(+e.target.value)}
      />
      <table>
        <tbody>
          {sequencers.map((sequencer, idx) => (
            <SequencerEditor
              key={idx}
              sequencer={sequencer}
              onChange={(next) => onChangeSequencer(idx, next)}
              globalSequenceCounter={globalStepIncrement}
            />
          ))}
        </tbody>
      </table>
      <button onClick={onAddSequencerRow}>➕ Add Sequencer Row</button>
      <h3>Keyboard</h3>
      <div>
        Synths connected to keyboard:{" "}
        {sequencers.filter((s) => s.synthState.routeToKeyboard).length}
        <p>
          {activeKeys.map((down, degree) => (
            <span key={degree}>{down ? "1" : "."} </span>
          ))}
        </p>
        <Keyboard onAttack={setActiveKey} onRelease={removeActiveKey} />
      </div>
    </>
  );
}
