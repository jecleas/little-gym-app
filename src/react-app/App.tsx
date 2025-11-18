import { useEffect, useMemo, useState } from "react";
import PlanSelectorCard from "./components/PlanSelectorCard";
import RoleToggle from "./components/RoleToggle";
import SessionLogger, { LogInputState } from "./components/SessionLogger";
import SummaryCard from "./components/SummaryCard";
import Timer from "./components/Timer";
import { initialPlans, today, uid } from "./lib/data";
import { Exercise, Role, SessionEntry, WorkoutPlan } from "./lib/types";

const App = () => {
  const [role, setRole] = useState<Role>("trainer");
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlans[0]?.id ?? "");
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"plans" | "session" | "summary">("plans");

  // Persist helper
  const savePlans = (plansToSave: WorkoutPlan[]) => {
    try {
      localStorage.setItem("workout_plans", JSON.stringify(plansToSave));
    } catch (e) {
      // ignore
    }
  };

  // Load plans from localStorage (fallback to initialPlans)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("workout_plans");
      if (raw) {
        const parsed: WorkoutPlan[] = JSON.parse(raw);
        setPlans(parsed);
        setSelectedPlanId(parsed[0]?.id ?? initialPlans[0]?.id ?? "");
      } else {
        setPlans(initialPlans);
        setSelectedPlanId(initialPlans[0]?.id ?? "");
        savePlans(initialPlans);
      }
    } catch (e) {
      setPlans(initialPlans);
      setSelectedPlanId(initialPlans[0]?.id ?? "");
      savePlans(initialPlans);
    }
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  // Plan-scoped handlers used by PlanSelectorCard modal
  const handleAddExerciseToPlan = (planId: string, exercise: { name: string; targetSets: number; targetReps: number; templateId?: string }) => {
    setPlans((prev) => {
      const updated = prev.map((plan) =>
        plan.id === planId
          ? { ...plan, exercises: [...plan.exercises, { id: uid(), name: exercise.name, templateId: exercise.templateId, targetSets: exercise.targetSets, targetReps: exercise.targetReps }] }
          : plan,
      );
      savePlans(updated);
      return updated;
    });
  };

  const handleUpdateExerciseInPlan = (planId: string, exerciseId: string, updates: { name: string; targetSets: number; targetReps: number }) => {
    setPlans((prev) => {
      const updated = prev.map((plan) =>
        plan.id === planId
          ? { ...plan, exercises: plan.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, name: updates.name, targetSets: updates.targetSets, targetReps: updates.targetReps } : ex)) }
          : plan,
      );
      savePlans(updated);
      return updated;
    });
  };

  const handleDeleteExerciseFromPlan = (planId: string, exerciseId: string) => {
    setPlans((prev) => {
      const updated = prev.map((plan) => (plan.id === planId ? { ...plan, exercises: plan.exercises.filter((ex) => ex.id !== exerciseId) } : plan));
      savePlans(updated);
      return updated;
    });
  };

  const handleSaveLog = (exercise: Exercise, log: LogInputState) => {
    if (!selectedPlan) return;

    const repsArray = log.sets.length ? log.sets.map((s) => Number(s.reps) || 0) : [];

    const newEntry: SessionEntry = {
      id: uid(),
      planId: selectedPlan.id,
      exerciseId: exercise.id,
      date: today,
      setsDone: log.sets.length || exercise.targetSets,
      repsPerSet: repsArray.length ? repsArray : Array(exercise.targetSets).fill(exercise.targetReps),
      weight: log.sets.length ? (log.sets[log.sets.length - 1].weight || 0) : 0,
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
          </div>
          <RoleToggle role={role} onChange={setRole} />
        </header>

        {/* Top tabs to switch full-screen panels */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md overflow-hidden border border-slate-800">
            <button
              className={`px-3 py-1 ${activeTab === 'plans' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('plans')}
            >
              Plans
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'session' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('session')}
            >
              Session Logging
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'summary' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('summary')}
            >
              Today's Summary
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'plans' && (
            <section className="flex flex-col gap-4">
              <PlanSelectorCard
                plans={plans}
                selectedPlanId={selectedPlanId}
                selectedPlan={selectedPlan}
                role={role}
                onSelectPlan={setSelectedPlanId}
                onUpdateExerciseInPlan={handleUpdateExerciseInPlan}
                onDeleteExerciseFromPlan={handleDeleteExerciseFromPlan}
                onAddExerciseToPlan={handleAddExerciseToPlan}
              />

            </section>
          )}

          {activeTab === 'session' && (
            <section className="flex flex-col gap-4">
                          <Timer />
              <SessionLogger selectedPlan={selectedPlan} sessionEntries={sessionEntries} onSaveLog={handleSaveLog} />

            </section>
          )}

          {activeTab === 'summary' && (
            <section className="flex flex-col gap-4">
              <SummaryCard plan={selectedPlan} entries={todaysSummary} date={today} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
