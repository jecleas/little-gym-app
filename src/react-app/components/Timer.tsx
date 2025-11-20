import { useEffect, useRef, useState } from "react";

const Timer = () => {

  const [clocktype, setClocktype] = useState<"Timer" | "Stopwatch">("Timer");
  const [elapsed, setElapsed] = useState(0);
  // Separate running flags so timer can keep counting while the user views the stopwatch
  const [runningTimer, setRunningTimer] = useState(false);
  const [runningStopwatch, setRunningStopwatch] = useState(false);
  // Timer-specific state
  const [durationMs, setDurationMs] = useState<number>(60 * 1000); // default 1 minute
  const [remainingMs, setRemainingMs] = useState<number>(60 * 1000);
  // refs for persisted timestamps so the countdown can continue while tab is inactive
  const endAtRef = useRef<number | null>(null);
  const startAtRef = useRef<number | null>(null);
  // ref for the scheduled end timeout so we can notify while the tab is inactive
  const endTimeoutRef = useRef<number | null>(null);

  // keep times when switching views; do not auto-stop running timers
  // (no effect needed here anymore)

  // Keep remaining synced when duration changes while stopped
  useEffect(() => {
    if (!runningTimer && clocktype === "Timer") {
      setRemainingMs(durationMs);
    }
  }, [durationMs, runningTimer, clocktype]);

  // helper to finish the timer (centralized so both RAF and timeout can call it)
  const finishTimer = () => {
    setRunningTimer(false);
    endAtRef.current = null;
    setRemainingMs(0);
    // Try to send a browser notification first (requires permission), fallback to alert
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Timer finished");
      } else {
        try { alert("Timer finished"); } catch (e) {}
      }
    } catch (e) {
      // ignore
    }
  };

  // dedicated start/pause/reset helpers for Timer and Stopwatch
  const requestNotificationPermission = () => {
    try {
      if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
        Notification.requestPermission().catch(() => {});
      }
    } catch (e) {}
  };

  const startTimer = () => {
    requestNotificationPermission();
    endAtRef.current = Date.now() + remainingMs;
    setRunningTimer(true);
  };

  const pauseTimer = () => {
    setRunningTimer(false);
    // cancel scheduled end timeout but keep endAtRef for resume
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    // update remainingMs to reflect pause time
    if (endAtRef.current) {
      setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    }
  };

  const resetTimer = () => {
    setRunningTimer(false);
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    endAtRef.current = null;
    setRemainingMs(durationMs);
  };

  const startStopwatch = () => {
    startAtRef.current = Date.now() - elapsed;
    setRunningStopwatch(true);
  };

  const pauseStopwatch = () => {
    setRunningStopwatch(false);
    if (startAtRef.current) {
      setElapsed(Date.now() - startAtRef.current);
    }
  };

  const resetStopwatch = () => {
    setRunningStopwatch(false);
    startAtRef.current = null;
    setElapsed(0);
  };

  // Stopwatch RAF (runs while runningStopwatch regardless of view)
  useEffect(() => {
    if (!runningStopwatch) return undefined;
    let frameId: number;
    if (!startAtRef.current) startAtRef.current = Date.now() - elapsed;
    const tick = () => {
      if (startAtRef.current) setElapsed(Date.now() - startAtRef.current);
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [runningStopwatch]);

  // Timer RAF (updates remainingMs for UI while runningTimer)
  useEffect(() => {
    if (!runningTimer) return undefined;
    let frameId: number;
    if (!endAtRef.current) endAtRef.current = Date.now() + remainingMs;
    const tick = () => {
      if (endAtRef.current) {
        const rem = Math.max(0, endAtRef.current - Date.now());
        setRemainingMs(rem);
        if (rem <= 0) {
          finishTimer();
          return;
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [runningTimer]);

  // schedule a real timeout that will fire when the timer ends so we can notify while the tab is inactive
  useEffect(() => {
    if (!runningTimer) {
      if (endTimeoutRef.current) {
        clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
      return;
    }
    const ms = endAtRef.current ? Math.max(0, endAtRef.current - Date.now()) : remainingMs;
    if (ms <= 0) {
      finishTimer();
      return;
    }
    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
    endTimeoutRef.current = window.setTimeout(() => {
      endTimeoutRef.current = null;
      finishTimer();
    }, ms);
    return () => {
      if (endTimeoutRef.current) {
        clearTimeout(endTimeoutRef.current);
        endTimeoutRef.current = null;
      }
    };
  }, [runningTimer, remainingMs]);

  // load persisted state on mount (so timer/stopwatch can continue across full page reloads or tab switches)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("workout_timer_state");
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.clocktype) setClocktype(s.clocktype);
      if (typeof s.durationMs === "number") setDurationMs(s.durationMs);
      if (typeof s.remainingMs === "number") setRemainingMs(s.remainingMs);
      if (typeof s.elapsed === "number") setElapsed(s.elapsed);
      // restore separate running states and timestamps
      if (s.runningTimer && typeof s.endAt === "number") {
        const rem = Math.max(0, s.endAt - Date.now());
        if (rem <= 0) {
          finishTimer();
          setRemainingMs(s.durationMs ?? 60 * 1000);
        } else {
          endAtRef.current = s.endAt;
          setRemainingMs(rem);
          setRunningTimer(true);
        }
      }
      if (s.runningStopwatch && typeof s.startAt === "number") {
        startAtRef.current = s.startAt;
        setElapsed(Math.max(0, Date.now() - s.startAt));
        setRunningStopwatch(true);
      }
    }
    catch (e) {
      // ignore
    }
  }, []);

  const minutes = Math.floor(elapsed / 1000 / 60)
     .toString()
     .padStart(2, "0");
   const seconds = Math.floor((elapsed / 1000) % 60)
     .toString()
     .padStart(2, "0");
   const centis = Math.floor((elapsed % 1000) / 10)
     .toString()
     .padStart(2, "0");

   // Timer display values
   const timerMin = Math.floor(remainingMs / 1000 / 60).toString().padStart(2, "0");
   const timerSec = Math.floor((remainingMs / 1000) % 60).toString().padStart(2, "0");

   // adjust duration by delta seconds. allow durations under one minute.
   const adjustDuration = (deltaSeconds: number) => {
     setDurationMs((cur) => {
       const next = cur + deltaSeconds * 1000;
       const oneMin = 60 * 1000;
       const safeNext = next <= 0 ? oneMin : next;
       // when timer isn't running, keep remaining in sync with duration
       if (!runningTimer && clocktype === "Timer") setRemainingMs(safeNext);
       // when timer is running, adjust the absolute end timestamp so countdown continues
       if (runningTimer && endAtRef.current) {
         endAtRef.current = endAtRef.current + deltaSeconds * 1000;
         // also update remainingMs to reflect new endAt immediately
         setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
       }
       return safeNext;
     });
   };

   // persist state to localStorage whenever relevant values change
   useEffect(() => {
     try {
      const state: any = { clocktype, durationMs, remainingMs, elapsed, runningTimer, runningStopwatch };
      if (runningTimer && endAtRef.current) state.endAt = endAtRef.current;
      if (runningStopwatch && startAtRef.current) state.startAt = startAtRef.current;
       localStorage.setItem("workout_timer_state", JSON.stringify(state));
     } catch (e) {
       // ignore
     }
   }, [clocktype, durationMs, remainingMs, elapsed, runningTimer, runningStopwatch]);

   return (
     <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
       <div className="flex items-center justify-center">
         <div className="inline-flex items-center rounded-full bg-slate-800 p-1 gap-1 shadow-sm">
           <button
             className={`rounded-full px-4 py-1 text-sm transition-all duration-150 ${clocktype === "Timer" ? "bg-emerald-600 text-white scale-100" : "bg-transparent text-slate-300 hover:bg-slate-700/50"}`}
             onClick={() => setClocktype("Timer")}
           >
             Timer
           </button>
           <button
             className={`rounded-full px-4 py-1 text-sm transition-all duration-150 ${clocktype === "Stopwatch" ? "bg-emerald-600 text-white" : "bg-transparent text-slate-300 hover:bg-slate-700/50"}`}
             onClick={() => setClocktype("Stopwatch")}
           >
             Stopwatch
           </button>
         </div>
       </div>

      {clocktype === "Timer" && (
        <>
          <div className="text-4xl font-mono text-emerald-400 text-center">
            {timerMin}:{timerSec}
          </div>

          {!runningTimer ? (
            <div className="flex items-center justify-center gap-2">
              <button
                className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                onClick={() => adjustDuration(-15)}
              >
                -15s
              </button>
              <button
                className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                onClick={() => adjustDuration(15)}
              >
                +15s
              </button>
              <div className="ml-2">
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => startTimer()}
                >
                  Start
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600"
                onClick={() => pauseTimer()}
              >
                Pause
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                onClick={() => resetTimer()}
              >
                Reset
              </button>
            </div>
          )}
        </>
      )}

      {clocktype === "Stopwatch" && (
        <>
          <div className="text-4xl font-mono text-emerald-400 text-center">
            {minutes}:{seconds}.{centis}
          </div>
          <div className="flex gap-2">
            {!runningStopwatch ? (
              <button
                className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
                onClick={() => startStopwatch()}
              >
                Start
              </button>
            ) : (
              <>
                <button
                  className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600"
                  onClick={() => pauseStopwatch()}
                >
                  Pause
                </button>
                <button
                  className="flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                  onClick={() => resetStopwatch()}
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Timer;
