import { useMemo, useState } from "react";
import { Exercise, SessionEntry, WorkoutPlan } from "../types";

export type LogInputState = {
  setsDone: number;
  repsPerSet: string;
  weight: number;
  notes: string;
};

type SessionLoggerProps = {
  selectedPlan?: WorkoutPlan;
  sessionEntries: SessionEntry[];
  onSaveLog: (exercise: Exercise, log: LogInputState) => void;
};

const defaultLogState: LogInputState = { setsDone: 0, repsPerSet: "", weight: 0, notes: "" };

const SessionLogger = ({ selectedPlan, sessionEntries, onSaveLog }: SessionLoggerProps) => {
  const [logInputs, setLogInputs] = useState<Record<string, LogInputState>>({});

  const todayEntries = useMemo(
    () => sessionEntries.filter((entry) => entry.planId === selectedPlan?.id),
    [sessionEntries, selectedPlan?.id],
  );

  const updateLogInput = (exerciseId: string, field: keyof LogInputState, value: string) => {
    setLogInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        setsDone: prev[exerciseId]?.setsDone ?? 0,
        repsPerSet: prev[exerciseId]?.repsPerSet ?? "",
        weight: prev[exerciseId]?.weight ?? 0,
        notes: prev[exerciseId]?.notes ?? "",
        [field]: field === "setsDone" || field === "weight" ? Number(value) : value,
      },
    }));
  };

  if (!selectedPlan) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md">
        <p className="text-sm text-slate-500">Create or select a plan to log a session.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Session Logging</h2>
        <span className="text-xs text-slate-500">{todayEntries.length} saved today</span>
      </div>
      <div className="flex flex-col gap-4">
        {selectedPlan.exercises.map((exercise) => {
          const log = logInputs[exercise.id] ?? defaultLogState;
          return (
            <div key={exercise.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-slate-400">Target: {exercise.targetSets} x {exercise.targetReps}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400">Sets done</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={log.setsDone}
                    onChange={(e) => updateLogInput(exercise.id, "setsDone", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-slate-400">Reps per set</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 10,10,8"
                    value={log.repsPerSet}
                    onChange={(e) => updateLogInput(exercise.id, "repsPerSet", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-slate-400">Weight (kg)</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={log.weight}
                    onChange={(e) => updateLogInput(exercise.id, "weight", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-slate-400">Notes</label>
                  <input
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={log.notes}
                    onChange={(e) => updateLogInput(exercise.id, "notes", e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => onSaveLog(exercise, log)}
                >
                  Save log
                </button>
              </div>
            </div>
          );
        })}
        {selectedPlan.exercises.length === 0 && <p className="text-sm text-slate-500">No exercises in this plan yet.</p>}
      </div>
    </div>
  );
};

export default SessionLogger;
