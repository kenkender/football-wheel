import { useRef, useState } from "react";

const TEAMS = ["บก.ทท.2", "บก.ทท.1", "บก.อก.บช.ทท", "บก.ทท.3"];
const COLORS = ["#ef4444", "#facc15", "#3b82f6", "#22c55e"];

export default function App() {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [pool, setPool] = useState([...TEAMS]);
  const [firstPick, setFirstPick] = useState(null);
  const [match, setMatch] = useState(null);
  const wheelRef = useRef(null);

  const slice = 360 / TEAMS.length;
  const background = `conic-gradient(${COLORS.map(
    (c, i) => `${c} ${i * slice}deg ${(i + 1) * slice}deg`
  ).join(",")})`;
  function spin() {
    if (spinning || pool.length === 0) return;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const index = TEAMS.indexOf(chosen);
    const base = angle % 360;
    const target = index * slice + slice / 2;
    const extra = 360 * 5 + target - base;
    setSpinning(true);
    const el = wheelRef.current;
    el.addEventListener(
      "transitionend",
      () => {
        setSpinning(false);
        handleLanding(chosen);
      },
      { once: true }
    );
    setAngle(angle + extra);
  }

  function handleLanding(team) {
    if (firstPick === null) {
      setFirstPick(team);
      setPool((p) => p.filter((t) => t !== team));
    } else {
      const pair = { a: firstPick, b: team };
      setMatch(pair);
      setFirstPick(null);
      setPool((p) => p.filter((t) => t !== team));
    }
  }
    
    function reset() {
    setAngle(0);
    setSpinning(false);
    setPool([...TEAMS]);
    setFirstPick(null);
    setMatch(null);
  }

  return (
    <div className="app">
      <h1>Football Team Wheel</h1>
      <div className="wheel-area">
        <div
          className="wheel"
          style={{ background, transform: `rotate(${angle}deg)` }}
          ref={wheelRef}
        > 
        {TEAMS.map((t, i) => (
            <div
              key={t}
              className="label"
              style={{
                transform: `rotate(${i * slice + slice / 2}deg) translate(0,-120px)`,
              }}
            >
            {t}
            </div>
          ))}
        </div>
        <div className="pointer" onClick={spin}></div>
      </div>
      <div className="controls">
        <button onClick={spin} disabled={spinning || pool.length === 0}>
          Spin
        </button>
        <button onClick={reset}>Reset</button>
      </div>

    {match && (
        <div className="modal">
          <div className="modal-box">
            <h2>
              {match.a} vs {match.b}
            </h2>
            <button onClick={() => setMatch(null)}>Close</button>
          </div>
          </div>
          )}
    </div>
  );
}