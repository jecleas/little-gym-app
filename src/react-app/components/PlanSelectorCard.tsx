import { useState } from "react";
import { WorkoutPlan } from "../lib/types";
import { exerciseTemplates } from "../lib/data";
import { Info, Pencil } from "lucide-react";
import AddExerciseCard from "./AddExerciseCard";

type PlanSelectorCardProps = {
  plans: WorkoutPlan[];
  selectedPlanId: string;
  onSelectPlan: (planId: string) => void;
  onUpdateExerciseInPlan: (planId: string, exerciseId: string, updates: { name: string; targetSets: number; targetReps: number }) => void;
  onDeleteExerciseFromPlan: (planId: string, exerciseId: string) => void;
  onAddExerciseToPlan: (planId: string, exercise: { name: string; targetSets: number; targetReps: number; templateId?: string }) => void;
  onStartRoutine?: (planId: string) => void;
  disableSelection?: boolean; // when true, prevent switching plans
};

const PlanSelectorCard = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onUpdateExerciseInPlan,
  onDeleteExerciseFromPlan,
  onAddExerciseToPlan,
  onStartRoutine,
  disableSelection,
}: PlanSelectorCardProps) => {
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState(3);
  const [editReps, setEditReps] = useState(10);
  // collapsed state for the My Workouts section
  const [collapsed, setCollapsed] = useState(false);
  // info modal state for plan descriptions
  const [infoPlan, setInfoPlan] = useState<{ title: string; description: string } | null>(null);
  // control showing the AddExerciseCard inside the editor
  const [addExercise, setAddExercise] = useState(false);

  const openEditor = (planId: string) => setEditingPlanId(planId);
  const closeEditor = () => {
    setEditingPlanId(null);
    setEditingExerciseId(null);
    setAddExercise(false);
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

  const openInfoForPlan = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const title = plan.name;
    const description = plan.description ?? plan.exercises.map((ex) => `${ex.name} — ${ex.targetSets} x ${ex.targetReps}`).join("\n");
    setInfoPlan({ title, description });
  };

  const closeInfo = () => setInfoPlan(null);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Workouts</h2>
        <button
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((s) => !s)}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
        >
          <span className="sr-only">Toggle My Workouts</span>
          <span className="text-lg">{collapsed ? '▸' : '▾'}</span>
        </button>
      </div>

      {/* vertical list of plan cards (hidden when collapsed) */}
      {!collapsed && (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => { if (!disableSelection) onSelectPlan(plan.id); }}
              className={`w-full ${disableSelection ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} rounded-md border ${plan.id === selectedPlanId ? 'border-emerald-500 bg-slate-800' : 'border-slate-700 bg-slate-900'}`}
            >
              <div className="p-3 border-b border-slate-800 flex items-start justify-between">
                <div>
                  <div className="font-medium">{plan.name}</div>
                  {plan.description && <div className="text-sm text-slate-500 mt-1">{plan.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">{plan.exercises.length} exercises</div>
                  <button
                    className="p-1 text-slate-400 hover:text-slate-200"
                    onClick={(e) => { e.stopPropagation(); openInfoForPlan(plan.id); }}
                    aria-label={`Info for ${plan.name}`}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-slate-800 hover:bg-slate-700"
                    onClick={(e) => { e.stopPropagation(); if (!disableSelection) openEditor(plan.id); }}
                    aria-label={`Edit ${plan.name}`}
                  >
                    <Pencil className="w-4 h-4 text-slate-200" />
                  </button>
                </div>
              </div>

              <div className="p-2 flex flex-col gap-2">
                {plan.exercises.length > 0 ? (
                  plan.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between rounded-md p-1">
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
              {/* Start Routine button full-width */}
              <div className="p-3 pt-0">
                <button
                  className={`w-full inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 ${disableSelection ? 'opacity-50 cursor-not-allowed hover:bg-emerald-500' : ''}`}
                  disabled={!!disableSelection}
                  onClick={(e) => { e.stopPropagation(); if (disableSelection) return; if (onStartRoutine) onStartRoutine(plan.id); }}
                >
                  Start Routine
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal (hidden when collapsed) */}
      {!collapsed && editingPlanId && (
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
                    {!addExercise ? (
                      <button
                        className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => setAddExercise(true)}
                      >
                        Add Exercise
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Plan not found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise popup modal */}
      {!collapsed && editingPlanId && addExercise && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setAddExercise(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Add exercise</h4>
              <button
                className="inline-flex items-center justify-center rounded-md px-2 py-1 text-sm font-medium bg-slate-700 hover:bg-slate-600"
                onClick={() => setAddExercise(false)}
              >
                Close
              </button>
            </div>
            <AddExerciseCard
              templates={exerciseTemplates}
              onAdd={(ex) => { onAddExerciseToPlan(editingPlanId, ex); setAddExercise(false); }}
            />
          </div>
        </div>
      )}

      {/* Info modal for plan descriptions */}
      {infoPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeInfo} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-lg p-4 z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{infoPlan.title}</h3>
                <pre className="whitespace-pre-wrap text-sm text-slate-400 mt-2">{infoPlan.description}</pre>
              </div>
              <button className="text-sm text-slate-400" onClick={closeInfo}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanSelectorCard;
