import { useCallback, useEffect, useState } from "react";

const whites = ["a", "s", "d", "f", "g", "h", "j"];
const blacks = ["w", "e", "t", "y", "u"];

function keyToNote(key: string): string {
  switch (key) {
    case "a":
      return "C4";
    case "w":
      return "C#4";
    case "s":
      return "D4";
    case "e":
      return "D#4";
    case "d":
      return "E4";
    case "f":
      return "F4";
    case "t":
      return "F#4";
    case "g":
      return "G4";
    case "y":
      return "G#4";
    case "h":
      return "A4";
    case "u":
      return "A#4";
    case "j":
      return "B4";
  }
  return "C4";
}

export function Keyboard({
  onAttack,
  onRelease,
}: {
  onAttack: (note: string) => void;
  onRelease: (note: string) => void;
}) {
  const [isEnabled, setEnabled] = useState(false);

  const isDown = whites
    .concat(blacks)
    .reduce((acc: { [k: string]: [boolean, (next: boolean) => void] }, key) => {
      acc[key] = useState(false);
      return acc;
    }, {});

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    whites.concat(blacks).forEach((proposedKey) => {
      if (e.key == proposedKey) {
        onAttack(keyToNote(e.key));
        const [_, setIsDown] = isDown[e.key];
        setIsDown(true);
        e.preventDefault();
      }
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    whites.concat(blacks).forEach((proposedKey) => {
      if (e.key == proposedKey) {
        onRelease(keyToNote(e.key));
        const [_, setIsDown] = isDown[e.key];
        setIsDown(false);
        e.preventDefault();
      }
    });
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isEnabled]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp, isEnabled]);

  return (
    <div
      onMouseEnter={() => setEnabled(true)}
      onMouseLeave={() => setEnabled(false)}
      style={{
        backgroundColor: isEnabled ? "yellow" : "transparent",
      }}
    >
      <p style={{ marginLeft: 10 }}>
        {blacks.map((key, idx) => (
          <button
            key={idx}
            style={{
              backgroundColor: isDown[key][0] ? "yellow" : "black",
              color: "white",
            }}
          >
            {key}
          </button>
        ))}
      </p>
      <p>
        {whites.map((key, idx) => (
          <button
            key={idx}
            style={{
              backgroundColor: isDown[key][0] ? "yellow" : "white",
              color: "black",
            }}
          >
            {key}
          </button>
        ))}
      </p>
    </div>
  );
}
