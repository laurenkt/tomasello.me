import { useState } from "react";
import * as Tone from "tone";

export function AudioContext(props: { children: any }) {
  const [isActivated, setActivated] = useState(false);

  async function activateAudioContext() {
    await Tone.start();
    setActivated(true);
  }

  if (!isActivated) {
    return (
      <p>
        Please activate audio context{" "}
        <button onClick={activateAudioContext}>by clicking here</button>
      </p>
    );
  } else {
    return props.children;
  }
}
