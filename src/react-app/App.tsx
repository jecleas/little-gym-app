import { useMemo, useState } from "react";
import AddExerciseCard from "./components/AddExerciseCard";
import PlanFormCard from "./components/PlanFormCard";
import PlanSelectorCard from "./components/PlanSelectorCard";
import RoleToggle from "./components/RoleToggle";
import SessionLogger, { LogInputState } from "./components/SessionLogger";
import SummaryCard from "./components/SummaryCard";
import Timer from "./components/Timer";
import { defaultPlan, exerciseTemplates, today, uid } from "./data";
import { Exercise, Role, SessionEntry, WorkoutPlan } from "./types";

const App = () => {
  const [role, setRole] = useState<Role>("trainer");
  const [plans, setPlans] = useState<WorkoutPlan[]>([defaultPlan]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(defaultPlan.id);
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  const handleCreatePlan = (name: string, description?: string) => {
    const newPlan: WorkoutPlan = {
      id: uid(),
      name,
      description,
      exercises: [],
    };
    setPlans((prev) => [...prev, newPlan]);
    setSelectedPlanId(newPlan.id);
  };

  const handleAddExercise = (exercise: { name: string; targetSets: number; targetReps: number; templateId?: string }) => {
    if (!selectedPlan) return;
    const newExercise: Exercise = {
      id: uid(),
      name: exercise.name,
      templateId: exercise.templateId,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
    };
    setPlans((prev) =>
      prev.map((plan) => (plan.id === selectedPlan.id ? { ...plan, exercises: [...plan.exercises, newExercise] } : plan)),
    );
  };

  const handleUpdateExercise = (exerciseId: string, updates: { name: string; targetSets: number; targetReps: number }) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === selectedPlanId
          ? {
              ...plan,
              exercises: plan.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, name: updates.name, targetSets: updates.targetSets, targetReps: updates.targetReps } : ex,
              ),
            }
          : plan,
      ),
    );
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!selectedPlan || role !== "trainer") return;
    setPlans((prev) => prev.map((plan) => (plan.id === selectedPlan.id ? { ...plan, exercises: plan.exercises.filter((ex) => ex.id !== exerciseId) } : plan)));
  };

  const handleSaveLog = (exercise: Exercise, log: LogInputState) => {
    if (!selectedPlan) return;
    const repsArray = log.repsPerSet
      .split(",")
      .map((r) => Number(r.trim()))
      .filter((r) => !Number.isNaN(r) && r > 0);

    const newEntry: SessionEntry = {
      id: uid(),
      planId: selectedPlan.id,
      exerciseId: exercise.id,
      date: today,
      setsDone: log.setsDone || repsArray.length || exercise.targetSets,
      repsPerSet: repsArray.length ? repsArray : Array(exercise.targetSets).fill(exercise.targetReps),
      weight: log.weight || 0,
      notes: log.notes.trim() || undefined,
    };

    setSessionEntries((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.planId === selectedPlan.id && entry.exerciseId === exercise.id && entry.date === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...newEntry, id: prev[existingIndex].id };
        return updated;
      }
      return [...prev, newEntry];
    });
  };

  const todaysSummary = useMemo(
    () => sessionEntries.filter((entry) => entry.planId === selectedPlan?.id && entry.date === today),
    [sessionEntries, selectedPlan?.id],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-8">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Workout Tracker POC</h1>
            <p className="text-sm text-slate-400">Quickly draft, adjust, and log training sessions.</p>
          </div>
          <RoleToggle role={role} onChange={setRole} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="flex flex-col gap-4">
            <PlanSelectorCard
              plans={plans}
              selectedPlanId={selectedPlanId}
              selectedPlan={selectedPlan}
              role={role}
              onSelectPlan={setSelectedPlanId}
              onUpdateExercise={handleUpdateExercise}
              onDeleteExercise={handleDeleteExercise}
            />

            {role === "trainer" && <PlanFormCard onCreatePlan={handleCreatePlan} />}

            <AddExerciseCard templates={exerciseTemplates} onAdd={handleAddExercise} />
          </section>

          <section className="flex flex-col gap-4">
            <SessionLogger selectedPlan={selectedPlan} sessionEntries={sessionEntries} onSaveLog={handleSaveLog} />
            <SummaryCard plan={selectedPlan} entries={todaysSummary} date={today} />
            <Timer />
          </section>
        </div>
      </div>
    </div>
  );
};

export default App;
