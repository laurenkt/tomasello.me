import { ChangeEvent, useCallback, useState } from "react";
import { SequencerConfig } from "../models/SequencerConfig";
import { Track } from "../models/Track";
import { range } from "../range";

function produceEditedTrack(track: Track, newInput: string): Track {
  const next: Track = structuredClone(track);

  const noteDurationPattern = new RegExp(
    /(?<note>[^\W]+)\/(?<duration>[^\W]+)\b$/gi
  );
  for (let match of newInput.matchAll(noteDurationPattern)) {
    const note = match.groups!["note"] ?? "C4";
    const duration = match.groups!["duration"] ?? "8n";
    next.instrument.note = note;
    next.instrument.duration = duration;
  }

  const synthTypePattern = new RegExp(/@(?<synthType>[^\W]+)\b/gi);
  for (let match of newInput.matchAll(synthTypePattern)) {
    const synthType = match.groups!["synthType"] ?? "sine";
    const validSynthTypes = ["duo", "am", "fm", "membrane", "sine"];
    if (validSynthTypes.includes(synthType)) {
      next.instrument.type = synthType;
    }
  }

  const stepsPattern = new RegExp(/\bs(?<steps>[0-9]+)\b/gi);
  for (let match of newInput.matchAll(stepsPattern)) {
    const steps = +match.groups!["steps"] ?? 16;
    next.sequencer.steps = steps;
    if (steps > next.sequencer.sequence.length) {
      for (let i = next.sequencer.sequence.length; i < steps; i++) {
        next.sequencer.sequence.push(false);
      }
    }
  }
  const volumePattern = new RegExp(/\b(?<volume>[0-9]+)%\B/gi);
  for (let match of newInput.matchAll(volumePattern)) {
    const volume = +match.groups!["volume"] ?? 100.0;
    next.instrument.gain = volume / 100.0;
  }

  return next;
}

interface TrackEditorProps {
  track: Track;
  globalSequenceCounter: number;
  onChange: (next: Track) => void;
}

export function TrackEditor(props: TrackEditorProps) {
  const [input, setInput] = useState(
    `${props.track.instrument?.note}/${props.track.instrument?.duration}`
  );
  const onChangeInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      const next = produceEditedTrack(props.track, e.target.value);
      if (JSON.stringify(props.track) != JSON.stringify(next)) {
        props.onChange(next);
      }
    },
    [props.track]
  );

  const routeToKeyboard = props.track.instrument.routeToKeyboard;

  const onToggleRouteToKeyboard = useCallback(() => {
    const next: Track = structuredClone(props.track);
    next.instrument.routeToKeyboard = !routeToKeyboard;
    props.onChange(next);
  }, [routeToKeyboard]);

  function toggleStep(step: number): void {
    const next: Track = structuredClone(props.track);
    next.sequencer.sequence[step] = !next.sequencer.sequence[step];
    props.onChange(next);
  }

  return (
    <tr>
      <th>
        <input type="text" value={input} onChange={onChangeInput} />
      </th>
      <th>
        <button
          onClick={onToggleRouteToKeyboard}
          style={{
            fontWeight: routeToKeyboard ? "bold" : "normal",
            backgroundColor: routeToKeyboard ? "blue" : "transparent",
          }}
        >
          {routeToKeyboard ? "Disconnect" : "Route to Keyboard"}
        </button>
      </th>
      {range(props.track.sequencer.steps).map((step) => (
        <td
          key={step}
          className={
            step == props.globalSequenceCounter % props.track.sequencer.steps
              ? "active"
              : ""
          }
        >
          <input
            type="checkbox"
            checked={props.track.sequencer.sequence[step] ?? false}
            onChange={() => toggleStep(step)}
          />
        </td>
      ))}
    </tr>
  );
}
