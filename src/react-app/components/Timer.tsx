import { useEffect, useState } from "react";

const Timer = () => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const start = performance.now() - elapsed;
    let frameId: number;
    const tick = (now: number) => {
      setElapsed(now - start);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [running, elapsed]);

  const minutes = Math.floor(elapsed / 1000 / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((elapsed / 1000) % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <div className="text-sm uppercase tracking-wide text-slate-400">Workout Timer</div>
      <div className="text-4xl font-mono text-emerald-400 text-center">
        {minutes}:{seconds}
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          onClick={() => setRunning(true)}
          disabled={running}
        >
          Start
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 disabled:opacity-50"
          onClick={() => setRunning(false)}
          disabled={!running}
        >
          Pause
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600"
          onClick={() => {
            setRunning(false);
            setElapsed(0);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
