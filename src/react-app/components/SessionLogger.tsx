import { useEffect, useState } from "react";
import { Exercise, WorkoutPlan } from "../lib/types";
import { Trash2 } from "lucide-react";

export type LogSet = { reps: number | string; weight: number | string };
export type LogInputState = {
  sets: LogSet[];
  notes: string;
};

type SessionLoggerProps = {
  selectedPlan?: WorkoutPlan;
  onFinalizeSession?: (planId: string, logs: Record<string, LogInputState>) => void;
  onDiscardSession?: (planId: string) => void;
  draftLogs?: Record<string, LogInputState>; // controlled draft state from App
  onUpdateDraft?: (exerciseId: string, log: LogInputState) => void; // propagate changes upward
};

const defaultLogState: LogInputState = { sets: [], notes: "" };

const SessionLogger = ({ selectedPlan, onFinalizeSession, onDiscardSession, draftLogs, onUpdateDraft }: SessionLoggerProps) => {
  const [logInputs, setLogInputs] = useState<Record<string, LogInputState>>({});

  // sync incoming draftLogs with internal state whenever plan or draft changes
  useEffect(() => {
    if (!selectedPlan) return;
    const filtered: Record<string, LogInputState> = {};
    selectedPlan.exercises.forEach(ex => {
      if (draftLogs && draftLogs[ex.id]) filtered[ex.id] = draftLogs[ex.id];
    });
    setLogInputs(filtered);
  }, [selectedPlan?.id, draftLogs]);

  // Handler for finalizing (Save) session
  const handleFinalize = () => {
    if (!selectedPlan) return;
    if (onFinalizeSession) onFinalizeSession(selectedPlan.id, logInputs);
  };

  const handleDiscard = () => {
    if (!selectedPlan) return;
    setLogInputs({});
    if (onDiscardSession) onDiscardSession(selectedPlan.id);
  };

  const pushUpdate = (exercise: Exercise, newLog: LogInputState) => {
    // removed immediate parent session entry save to avoid parent setState during child render
    if (onUpdateDraft) onUpdateDraft(exercise.id, newLog); // persist draft in App
  };

  const addSet = (exercise: Exercise) => {
    setLogInputs((prev) => {
      const cur = prev[exercise.id] ?? { sets: [], notes: "" };
      const sets = [...cur.sets, { reps: "", weight: "" }];
      const newLog = { ...cur, sets };
      pushUpdate(exercise, newLog);
      return { ...prev, [exercise.id]: newLog };
    });
  };

  const updateSetField = (exerciseId: string, index: number, field: keyof LogSet, value: string) => {
    if (!selectedPlan) return;
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const sets = cur.sets.slice();
      if (value === "") {
        sets[index] = { ...sets[index], [field]: "" } as LogSet;
      } else {
        const num = Number(value);
        sets[index] = { ...sets[index], [field]: Number.isNaN(num) ? 0 : num } as LogSet;
      }
      const newLog = { ...cur, sets };
      const exercise = selectedPlan.exercises.find(e => e.id === exerciseId);
      if (exercise) pushUpdate(exercise, newLog);
      return { ...prev, [exerciseId]: newLog };
    });
  };

  const removeSet = (exerciseId: string, index: number) => {
    if (!selectedPlan) return;
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const sets = cur.sets.slice();
      sets.splice(index, 1);
      const newLog = { ...cur, sets };
      const exercise = selectedPlan.exercises.find(e => e.id === exerciseId);
      if (exercise) pushUpdate(exercise, newLog);
      return { ...prev, [exerciseId]: newLog };
    });
  };

  const updateNotes = (exerciseId: string, value: string) => {
    if (!selectedPlan) return;
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const newLog = { ...cur, notes: value };
      const exercise = selectedPlan.exercises.find(e => e.id === exerciseId);
      if (exercise) pushUpdate(exercise, newLog);
      return { ...prev, [exerciseId]: newLog };
    });
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
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
            onClick={handleFinalize}
          >
            Save
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-rose-600 hover:bg-rose-700"
            onClick={handleDiscard}
          >
            <Trash2 className="w-4 h-4 text-slate-100" />
          </button>
        </div>
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
              <div>
                <label className="text-slate-400">Notes</label>
                <input
                  className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={log.notes}
                  onChange={(e) => updateNotes(exercise.id, e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">Sets: {log.sets.length}</div>
                  <button
                    className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-slate-800 hover:bg-slate-700"
                    onClick={() => addSet(exercise)}
                  >
                    + Add set
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {log.sets.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-4 gap-2 items-end">
                      <div className="flex flex-col items-center">
                        <label className="text-slate-400">#</label>
                        <div className="mt-1 text-sm text-slate-200">{idx + 1}</div>
                      </div>
                      <div>
                        <label className="text-slate-400">Reps</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={s.reps}
                          onChange={(e) => updateSetField(exercise.id, idx, "reps", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-slate-400">Weight (kg)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          style={{ WebkitAppearance: 'none', MozAppearance: 'textfield', appearance: 'textfield' }}
                          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          value={s.weight}
                          onChange={(e) => updateSetField(exercise.id, idx, "weight", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center">
                        <button
                          className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-sm font-medium bg-red-600 hover:bg-red-700"
                          onClick={() => removeSet(exercise.id, idx)}
                          aria-label={`Remove set ${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4 text-slate-100" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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
