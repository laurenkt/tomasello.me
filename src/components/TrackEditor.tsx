import { ChangeEvent, useCallback, useState } from "react";
import { SequencerState } from "../models/SequencerState";
import { Track } from "../models/Track";
import { range } from "../range";

function produceEditedSequencer(
  sequencer: SequencerState,
  newInput: string
): SequencerState {
  const next: SequencerState = structuredClone(sequencer);

  const noteDurationPattern = new RegExp(
    /(?<note>[^\W]+)\/(?<duration>[^\W]+)\b$/gi
  );
  for (let match of newInput.matchAll(noteDurationPattern)) {
    const note = match.groups!["note"] ?? "C4";
    const duration = match.groups!["duration"] ?? "8n";
    next.synthState.note = note;
    next.synthState.duration = duration;
  }

  const synthTypePattern = new RegExp(/@(?<synthType>[^\W]+)\b/gi);
  for (let match of newInput.matchAll(synthTypePattern)) {
    const synthType = match.groups!["synthType"] ?? "sine";
    const validSynthTypes = ["duo", "am", "fm", "membrane", "sine"];
    if (validSynthTypes.includes(synthType)) {
      next.synthState.type = synthType;
    }
  }

  const stepsPattern = new RegExp(/\bs(?<steps>[0-9]+)\b/gi);
  for (let match of newInput.matchAll(stepsPattern)) {
    const steps = +match.groups!["steps"] ?? 16;
    next.steps = steps;
    if (steps > next.sequence.length) {
      for (let i = next.sequence.length; i < steps; i++) {
        next.sequence.push(false);
      }
    }
  }
  const volumePattern = new RegExp(/\b(?<volume>[0-9]+)%\B/gi);
  for (let match of newInput.matchAll(volumePattern)) {
    const volume = +match.groups!["volume"] ?? 100.0;
    next.synthState.gain = volume / 100.0;
  }

  return next;
}

interface TrackEditorProps {
  track: Track;
  globalSequenceCounter: number;
  onChange: (next: SequencerState) => void;
}

export function TrackEditor(props: TrackEditorProps) {
  const [input, setInput] = useState(
    `${props.track.synth?.note}/${props.track.synth?.duration}`
  );
  const onChangeInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      console.log("Changing to ", e.target.value);
      setInput(e.target.value);
      const next = produceEditedSequencer(props.track.sequencer!, e.target.value);
      if (JSON.stringify(props.track.sequencer) != JSON.stringify(next)) {
        console.log("Updating sequencer in parent");
        props.onChange(next);
      }
    },
    [props.sequencer]
  );

  const routeToKeyboard = props.sequencer.synthState.routeToKeyboard;

  const onToggleRouteToKeyboard = useCallback(() => {
    const next: SequencerState = structuredClone(props.sequencer);
    next.synthState.routeToKeyboard = !routeToKeyboard;
    props.onChange(next);
  }, [routeToKeyboard]);

  function toggleStep(step: number): void {
    const next: SequencerState = structuredClone(props.sequencer);
    next.sequence[step] = !next.sequence[step];
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
      {range(props.sequencer.steps).map((step) => (
        <td
          key={step}
          className={
            step == props.globalSequenceCounter % props.sequencer.steps
              ? "active"
              : ""
          }
        >
          <input
            type="checkbox"
            checked={props.sequencer.sequence[step] ?? false}
            onChange={() => toggleStep(step)}
          />
        </td>
      ))}
    </tr>
  );
}
