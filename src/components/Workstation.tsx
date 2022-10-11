import { useCallback, useEffect, useState } from "react";
import { TrackEditor } from "./TrackEditor";
import { Keyboard } from "./Keyboard";
import { range } from "../range";
import { AudioPipeline } from "../audio/AudioPipeline";
import { Track } from "../models/Track";
import { InstrumentConfig } from "../models/InstrumentConfig";
import { nanoid } from "nanoid";
import { useLocalStorage } from "usehooks-ts";

let audioPipeline: AudioPipeline;

const defaultNotes = ["C4", "D4", "E4", "F4", "G4", "A5", "B5"];

export default function Workstation() {
  const [bpm, setBpm] = useLocalStorage("bpm", 180);
  const [isPaused, setPaused] = useState(false);
  const [globalStepIncrement, setGlobalStepIncrement] = useState(0);
  const [tracks, setTracks] = useLocalStorage(
    "tracks",
    defaultNotes.map((note): Track => {
      return {
        id: nanoid(),
        sequencer: {
          sequence: range(16).map(() => false),
          steps: 16,
        },
        instrument: {
          duration: "8n",
          gain: 1,
          note: note,
          routeToKeyboard: false,
          type: "sine",
          effects: [],
        },
      };
    })
  );

  const onAddTrack = useCallback(() => {
    const delta: Track[] = [
      {
        id: nanoid(),
        sequencer: {
          sequence: range(16).map(() => false),
          steps: 16,
        },
        instrument: {
          duration: "8n",
          gain: 1,
          note: "C4",
          type: "sine",
          routeToKeyboard: false,
          effects: [],
        },
      },
    ];
    setTracks((s) => s.concat(delta));
  }, [tracks]);

  function onChangeTrack(next: Track) {
    setTracks((s) => {
      const copy: Track[] = structuredClone(s);
      const idx = copy.findIndex((s) => s.id === next.id);
      copy[idx] = next;
      return copy;
    });
  }

  useEffect(() => {
    if (!audioPipeline) {
      audioPipeline = new AudioPipeline({
        onCounterIncrement: setGlobalStepIncrement,
      });
    }
  }, []);

  useEffect(() => {
    audioPipeline.setTracks(tracks);
  }, [tracks]);

  const [activeKeys, setActiveKeys] = useState(range(12).map(() => false));

  function setAtIndex(to: boolean, array: boolean[], idx: number): boolean[] {
    const copy = [...array];
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
    const keyboardEnabled: InstrumentConfig[] = tracks
      .filter((track) => track.instrument?.routeToKeyboard)
      .map((track) => track.instrument!);

    for (const instrument of keyboardEnabled) {
      for (let degree = 0; degree < activeKeys.length; degree++) {
        if (activeKeys[degree]) {
          audioPipeline.attackWithSynth(instrument, degree);
        }
      }
    }
  }, [activeKeys, tracks]);

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
          {tracks.map((track) => (
            <TrackEditor
              key={track.id}
              track={track}
              onChange={(next) => onChangeTrack(next)}
              globalSequenceCounter={globalStepIncrement}
            />
          ))}
        </tbody>
      </table>
      <button onClick={onAddTrack}>➕ Add Track</button>
      <h3>Keyboard</h3>
      <div>
        Synths connected to keyboard:{" "}
        {tracks.filter((track) => track.instrument?.routeToKeyboard).length}
        <Keyboard onAttack={setActiveKey} onRelease={removeActiveKey} />
      </div>
    </>
  );
}
