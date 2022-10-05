import { useCallback, useEffect, useState } from "react";
import * as Tone from "tone";

export function AudioContext(props: { children: any }) {
  const [isActivated, setActivated] = useState(false);

  const onActivate = useCallback((e: any) => {
    e.preventDefault();
    Tone.start().then(() => {
      setActivated(true);
    });
  }, []);

  useEffect(() => {
    if (isActivated) {
      return;
    }
    window.addEventListener("keydown", onActivate);
    return () => {
      window.removeEventListener("keydown", onActivate);
    };
  }, [isActivated]);

  if (!isActivated) {
    return (
      <p>
        <button onClick={onActivate}>
          <strong>Click/press any key to start</strong>
          <br />
          (Browser enforces that audio context must be triggered by user action)
        </button>
      </p>
    );
  } else {
    return props.children;
  }
}
