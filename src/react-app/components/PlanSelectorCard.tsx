import { useState } from "react";
import { WorkoutPlan } from "../lib/types";
import { exerciseTemplates } from "../lib/data";
import AddExerciseCard from "./AddExerciseCard";

type PlanSelectorCardProps = {
  plans: WorkoutPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onUpdateExerciseInPlan: (planId: string, exerciseId: string, updates: { name: string; targetSets: number; targetReps: number }) => void;
  onDeleteExerciseFromPlan: (planId: string, exerciseId: string) => void;
  onAddExerciseToPlan: (planId: string, exercise: { name: string; targetSets: number; targetReps: number; templateId?: string }) => void;
};

const PlanSelectorCard = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onUpdateExerciseInPlan,
  onDeleteExerciseFromPlan,
  onAddExerciseToPlan,
}: PlanSelectorCardProps) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState(3);
  const [editReps, setEditReps] = useState(8);

  const openEditor = (planId: string) => setEditingPlanId(planId);
  const closeEditor = () => {
    setEditingPlanId(null);
    setEditingExerciseId(null);
  };

  const startEditingExercise = (exerciseId: string, name: string, sets: number, reps: number) => {
    setEditingExerciseId(exerciseId);
    setEditName(name);
    setEditSets(sets);
    setEditReps(reps);
  };

  const saveExerciseEdit = (planId: string) => {
    if (!editingExerciseId) return;
    onUpdateExerciseInPlan(planId, editingExerciseId, {
      name: editName.trim() || "Exercise",
      targetSets: editSets || 1,
      targetReps: editReps || 1,
    });
    setEditingExerciseId(null);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Plans</h2>

      {/* vertical list of plan cards */}
      <div className="flex flex-col gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => onSelectPlan(plan.id)}
            className={`w-full cursor-pointer rounded-md border ${plan.id === selectedPlanId ? 'border-emerald-500 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
          >
            <div className="p-3 border-b border-slate-800 flex items-start justify-between">
              <div>
                <div className="font-medium">{plan.name}</div>
                {plan.description && <div className="text-sm text-slate-500 mt-1">{plan.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-400">{plan.exercises.length} exercises</div>
                <button
                  className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-slate-800 hover:bg-slate-700"
                  onClick={(e) => { e.stopPropagation(); openEditor(plan.id); }}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="p-2 flex flex-col gap-2">
              {plan.exercises.length > 0 ? (
                plan.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-slate-800 border border-slate-700 rounded-md p-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{exercise.name}</div>
                      <div className="text-xs text-slate-400">{exercise.targetSets} x {exercise.targetReps}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No exercises</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Editor modal */}
      {editingPlanId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeEditor} />
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-lg p-4 z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit Plan</h3>
              <button className="text-sm text-slate-400" onClick={closeEditor}>Close</button>
            </div>
            <div className="mt-3">
              {plans.find((p) => p.id === editingPlanId) ? (
                <div className="flex flex-col gap-3">
                  {plans.find((p) => p.id === editingPlanId)!.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between gap-3 border border-slate-800 rounded-md p-2">
                      <div>
                        <div className="font-medium">{exercise.name}</div>
                        <div className="text-sm text-slate-400">Target: {exercise.targetSets} x {exercise.targetReps}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center justify-center rounded-md px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sm"
                          onClick={() => startEditingExercise(exercise.id, exercise.name, exercise.targetSets, exercise.targetReps)}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-md px-2 py-1 bg-rose-600 hover:bg-rose-700 text-sm"
                          onClick={() => onDeleteExerciseFromPlan(editingPlanId, exercise.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* inline edit form for an exercise */}
                  {editingExerciseId && (
                    <div className="bg-slate-800 p-3 rounded-md">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          className="col-span-2 mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <input
                          type="number"
                          min={1}
                          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                          value={editSets}
                          onChange={(e) => setEditSets(Number(e.target.value))}
                        />
                        <input
                          type="number"
                          min={1}
                          className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                          value={editReps}
                          onChange={(e) => setEditReps(Number(e.target.value))}
                        />
                        <div className="sm:col-span-4 flex gap-2 mt-2">
                          <button className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-emerald-500 hover:bg-emerald-600" onClick={() => saveExerciseEdit(editingPlanId)}>
                            Save
                          </button>
                          <button className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-slate-700 hover:bg-slate-600" onClick={() => setEditingExerciseId(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold">Add exercise</h4>
                    <AddExerciseCard
                      templates={exerciseTemplates}
                      onAdd={(ex) => onAddExerciseToPlan(editingPlanId, ex)}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Plan not found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSelectorCard;
