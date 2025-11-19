import { useMemo, useState } from "react";
import { Exercise, SessionEntry, WorkoutPlan } from "../lib/types";
import { Trash2 } from "lucide-react";

export type LogSet = { reps: number; weight: number };
export type LogInputState = {
  sets: LogSet[];
  notes: string;
};

type SessionLoggerProps = {
  selectedPlan?: WorkoutPlan;
  sessionEntries: SessionEntry[];
  onSaveLog: (exercise: Exercise, log: LogInputState) => void;
};

const defaultLogState: LogInputState = { sets: [], notes: "" };

const SessionLogger = ({ selectedPlan, sessionEntries, onSaveLog }: SessionLoggerProps) => {
  const [logInputs, setLogInputs] = useState<Record<string, LogInputState>>({});

  const todayEntries = useMemo(
    () => sessionEntries.filter((entry) => entry.planId === selectedPlan?.id),
    [sessionEntries, selectedPlan?.id],
  );

  const addSet = (exercise: Exercise, defaultReps = 0) => {
    setLogInputs((prev) => {
      const cur = prev[exercise.id] ?? { sets: [], notes: "" };
      const sets = [...cur.sets, { reps: defaultReps, weight: 0 }];
      const newLog = { ...cur, sets };
      onSaveLog(exercise, newLog);
      return { ...prev, [exercise.id]: newLog };
    });
  };

  const updateSetField = (exerciseId: string, index: number, field: keyof LogSet, value: string) => {
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const sets = cur.sets.slice();
      const parsed = field === "reps" || field === "weight" ? Number(value) : (value as any);
      sets[index] = { ...sets[index], [field]: Number.isNaN(parsed) ? 0 : parsed };
      const newLog = { ...cur, sets };
      const exercise = selectedPlan?.exercises.find((e) => e.id === exerciseId);
      if (exercise) onSaveLog(exercise, newLog);
      return { ...prev, [exerciseId]: newLog };
    });
  };

  const removeSet = (exerciseId: string, index: number) => {
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const sets = cur.sets.slice();
      sets.splice(index, 1);
      const newLog = { ...cur, sets };
      const exercise = selectedPlan?.exercises.find((e) => e.id === exerciseId);
      if (exercise) onSaveLog(exercise, newLog);
      return { ...prev, [exerciseId]: newLog };
    });
  };

  const updateNotes = (exerciseId: string, value: string) => {
    setLogInputs((prev) => {
      const cur = prev[exerciseId] ?? { sets: [], notes: "" };
      const newLog = { ...cur, notes: value };
      const exercise = selectedPlan?.exercises.find((e) => e.id === exerciseId);
      if (exercise) onSaveLog(exercise, newLog);
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
                    onClick={() => addSet(exercise, exercise.targetReps)}
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

              {/* removed Save log button per request */}
            </div>
          );
        })}
        {selectedPlan.exercises.length === 0 && <p className="text-sm text-slate-500">No exercises in this plan yet.</p>}
      </div>
    </div>
  );
};

export default SessionLogger;
