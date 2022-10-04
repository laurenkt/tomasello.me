import { useEffect, useState } from "react";
import * as Tone from "tone";
import { SynthRow } from "./SynthRow";
import { Synth } from "./Synth";
import { Keyboard } from "./Keyboard";

let t = 0;

const defaultNotes = ["C4", "D4", "E4", "F4", "G4", "A5", "B5"];
const synths = defaultNotes.map((note): Synth => {
  return {
    note: note,
    duration: "8n",
    type: "sine",
    toneSynth: new Tone.Synth().toDestination(),
    sequence: range(16).map(() => false),
    steps: 16,
  };
}) as Synth[];

function range(limit: number): number[] {
  let nums = [];
  for (let i = 0; i < limit; i++) {
    nums.push(i);
  }
  return nums;
}
export default function Sequencer() {
  const [bpm, setBpm] = useState(180);
  const [isPaused, setPaused] = useState(false);
  const [activeTime, setActiveTime] = useState(0);

  useEffect(() => {
    //play a note every quarter-note
    if (!isPaused) {
      const loop = new Tone.Loop((time) => {
        t = t + 1;
        for (const synth of synths) {
          if (synth.sequence[t % synth.steps]) {
            synth.toneSynth.triggerAttackRelease(
              synth.note,
              synth.duration,
              time
            );
          }
        }

        setActiveTime(t);
      }, "8n");
      loop.start(Tone.now());
      Tone.Transport.start();
      return () => {
        loop.stop();
      };
    }
  }, [isPaused]);

  useEffect(() => {
    Tone.Transport.bpm.rampTo(bpm, 1);
  }, [bpm]);

  function addRow() {
    synths.push({
      note: "C4",
      duration: "8n",
      type: "sine",
      toneSynth: new Tone.Synth().toDestination(),
      sequence: range(16).map(() => false),
      steps: 16,
    });
  }

  return (
    <>
      <button onClick={() => setPaused(!isPaused)}>
        {isPaused ? "Play" : "Pause"}
      </button>
      BPM:{" "}
      <input
        type="text"
        value={bpm}
        onChange={(e) => setBpm(+e.target.value)}
      />
      <p>
        Input like <code>C4/8n</code> means play a C4 eighth note
      </p>
      <p>
        Try changing instrument by using <code>@duo</code>,{" "}
        <code>@membrane</code>, <code>@am</code>, <code>@fm</code>,{" "}
        <code>@sine</code>
      </p>
      <p>
        Change the number of ticks by using e.g. <code>s32</code> (this one is
        pretty buggy)
      </p>
      <table>
        <tbody>
          {synths.map((synth, idx) => (
            <SynthRow key={idx} synth={synth} timeStep={activeTime} />
          ))}
        </tbody>
      </table>
      <button onClick={() => addRow()}>Add Row</button>
      <h3>Keyboard</h3>
      <Keyboard
        onAttack={(note) => {
          synths
            .filter((s) => s.keyboardEnabled)
            .forEach((synth) => {
              synth.toneSynth.triggerAttack(note);
            });
        }}
        onRelease={(note) => {
          synths
            .filter((s) => s.keyboardEnabled)
            .forEach((synth) => {
              synth.toneSynth.triggerRelease();
            });
        }}
      />
    </>
  );
}
