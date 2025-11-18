import { useEffect, useState } from "react";
import { Role, WorkoutPlan } from "../types";

type PlanSelectorCardProps = {
  plans: WorkoutPlan[];
  selectedPlanId: string;
  selectedPlan?: WorkoutPlan;
  role: Role;
  onSelectPlan: (planId: string) => void;
  onUpdateExercise: (exerciseId: string, updates: { name: string; targetSets: number; targetReps: number }) => void;
  onDeleteExercise: (exerciseId: string) => void;
};

const PlanSelectorCard = ({
  plans,
  selectedPlanId,
  selectedPlan,
  role,
  onSelectPlan,
  onUpdateExercise,
  onDeleteExercise,
}: PlanSelectorCardProps) => {
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState(3);
  const [editReps, setEditReps] = useState(8);

  useEffect(() => {
    setEditingExerciseId(null);
    setEditName("");
    setEditSets(3);
    setEditReps(8);
  }, [selectedPlanId]);

  const startEditing = (exerciseId: string, name: string, sets: number, reps: number) => {
    setEditingExerciseId(exerciseId);
    setEditName(name);
    setEditSets(sets);
    setEditReps(reps);
  };

  const saveEdit = () => {
    if (!editingExerciseId) return;
    onUpdateExercise(editingExerciseId, {
      name: editName.trim() || "Exercise",
      targetSets: editSets || 1,
      targetReps: editReps || 1,
    });
    setEditingExerciseId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Plans</h2>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-400">Select plan</label>
        <select
          value={selectedPlanId}
          onChange={(e) => onSelectPlan(e.target.value)}
          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>
      {selectedPlan && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selectedPlan.name}</h3>
              {selectedPlan.description && <p className="text-sm text-slate-400">{selectedPlan.description}</p>}
            </div>
            <span className="text-xs text-slate-500">{selectedPlan.exercises.length} exercises</span>
          </div>
          <div className="divide-y divide-slate-800">
            {selectedPlan.exercises.map((exercise) => (
              <div key={exercise.id} className="py-2 flex flex-col gap-2">
                {editingExerciseId === exercise.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      className="col-span-2 mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      type="number"
                      min={1}
                      className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editSets}
                      onChange={(e) => setEditSets(Number(e.target.value))}
                    />
                    <input
                      type="number"
                      min={1}
                      className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={editReps}
                      onChange={(e) => setEditReps(Number(e.target.value))}
                    />
                    <div className="flex gap-2 sm:col-span-4">
                      <button
                        className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                        onClick={() => setEditingExerciseId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-slate-400">Target: {exercise.targetSets} x {exercise.targetReps}</div>
                    </div>
                    {role === "trainer" && (
                      <div className="flex gap-2 text-xs">
                        <button
                          className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-slate-800 hover:bg-slate-700"
                          onClick={() => startEditing(exercise.id, exercise.name, exercise.targetSets, exercise.targetReps)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-rose-600 hover:bg-rose-700"
                          onClick={() => onDeleteExercise(exercise.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {selectedPlan.exercises.length === 0 && (
              <p className="text-sm text-slate-500 py-2">No exercises yet. Add one below.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSelectorCard;
