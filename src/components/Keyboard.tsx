import { useCallback, useEffect, useState } from "react";

const whites = ["a", "s", "d", "f", "g", "h", "j"];
const blacks = ["w", "e", "t", "y", "u"];
const allKeys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j"];

export function Keyboard({
  onAttack,
  onRelease,
}: {
  onAttack: (degree: number) => void;
  onRelease: (degree: number) => void;
}) {
  const [isEnabled, setEnabled] = useState(false);

  const isDown = allKeys.reduce(
    (acc: { [k: string]: [boolean, (next: boolean) => void] }, key) => {
      acc[key] = useState(false);
      return acc;
    },
    {}
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    allKeys.forEach((proposedKey) => {
      if (e.key == proposedKey) {
        onAttack(allKeys.indexOf(e.key));
        const [_, setIsDown] = isDown[e.key];
        setIsDown(true);
        e.preventDefault();
      }
    });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    whites.concat(blacks).forEach((proposedKey) => {
      if (e.key == proposedKey) {
        onRelease(allKeys.indexOf(e.key));
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
