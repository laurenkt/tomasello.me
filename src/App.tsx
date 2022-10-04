import { AudioContext } from "./AudioContext";
import "./App.css";
import Sequencer from "./Sequencer";

function App() {
  return (
    <AudioContext>
      <Sequencer />
    </AudioContext>
  );
}

export default App;
