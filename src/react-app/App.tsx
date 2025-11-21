import { useEffect, useState } from "react";
import PlanSelectorCard from "./components/PlanSelectorCard";
import SessionLogger, { LogInputState } from "./components/SessionLogger";
import SummaryCard from "./components/SummaryCard";
import Timer from "./components/Timer";
import { initialPlans, today, uid } from "./lib/data";
import { Exercise, SessionEntry, WorkoutPlan } from "./lib/types";

const App = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlans[0]?.id ?? "");
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);
  const [activeRoutinePlanId, setActiveRoutinePlanId] = useState<string | null>(null);
  // draft logs for active routine (exerciseId -> LogInputState) persisted until save/discard
  const [routineDraft, setRoutineDraft] = useState<Record<string, LogInputState>>({});
  const [activeTab, setActiveTab] = useState<"workouts" | "session" | "summary">("workouts");
  const [activeRoutineExtraExercises, setActiveRoutineExtraExercises] = useState<Exercise[]>([]);

  // Persist helper
  const savePlans = (plansToSave: WorkoutPlan[]) => {
    try {
      localStorage.setItem("workout_plans", JSON.stringify(plansToSave));
    } catch (e) {
      // ignore
    }
  };

  // persist session entries helper
  const saveSessionEntries = (entries: SessionEntry[]) => {
    try {
      localStorage.setItem("session_entries", JSON.stringify(entries));
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

  // load session entries from storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("session_entries");
      if (raw) setSessionEntries(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  // persist sessionEntries when they change
  useEffect(() => {
    saveSessionEntries(sessionEntries);
  }, [sessionEntries]);

  // restore active routine if present in localStorage and switch to session view
  useEffect(() => {
    try {
      const raw = localStorage.getItem("active_routine");
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj?.planId) {
          setSelectedPlanId((prev) => obj.planId || prev);
          setActiveRoutinePlanId(obj.planId);
          try {
            const draftRaw = localStorage.getItem(`incomplete_session_${obj.planId}`);
            if (draftRaw) setRoutineDraft(JSON.parse(draftRaw));
          } catch {}
          try {
            const extrasRaw = localStorage.getItem(`incomplete_session_extra_${obj.planId}`);
            if (extrasRaw) setActiveRoutineExtraExercises(JSON.parse(extrasRaw));
          } catch {}
          setActiveTab("session");
        }
      }
    } catch (e) {}
  }, [plans]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  // plan being actively logged (locked for the routine) separate from UI selection
  const routinePlan = activeRoutinePlanId ? plans.find(p => p.id === activeRoutinePlanId) : undefined;

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
    // use routine plan if an active routine exists; otherwise fall back to currently selected plan
    const targetPlan = activeRoutinePlanId ? routinePlan : selectedPlan;
    if (!targetPlan) return;

    const repsArray = log.sets.length ? log.sets.map((s) => Number(s.reps) || 0) : [];
    const weightsArray = log.sets.length ? log.sets.map((s) => Number(s.weight) || 0) : [];

    const newEntry: SessionEntry = {
      id: uid(),
      planId: targetPlan.id,
      exerciseId: exercise.id,
      exerciseName: exercise.name, // store name to support session-only exercises
      date: today,
      setsDone: log.sets.length || exercise.targetSets,
      repsPerSet: repsArray.length ? repsArray : Array(exercise.targetSets).fill(exercise.targetReps),
      weightsPerSet: weightsArray.length ? weightsArray : Array(exercise.targetSets).fill(0),
      notes: log.notes.trim() || undefined,
    };

    setSessionEntries((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.planId === targetPlan.id && entry.exerciseId === exercise.id && entry.date === today);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...newEntry, id: prev[existingIndex].id };
        return updated;
      }
      return [...prev, newEntry];
    });
  };

  // start a routine: save active routine to localStorage and switch to session tab
  const handleStartRoutine = (planId: string) => {
    try {
      localStorage.setItem("active_routine", JSON.stringify({ planId, startedAt: Date.now() }));
      const draftRaw = localStorage.getItem(`incomplete_session_${planId}`);
      if (draftRaw) {
        try { setRoutineDraft(JSON.parse(draftRaw)); } catch { setRoutineDraft({}); }
      } else {
        setRoutineDraft({});
      }
      const extrasRaw = localStorage.getItem(`incomplete_session_extra_${planId}`);
      if (extrasRaw) {
        try { setActiveRoutineExtraExercises(JSON.parse(extrasRaw)); } catch { setActiveRoutineExtraExercises([]); }
      } else {
        setActiveRoutineExtraExercises([]);
      }
    } catch {}
    setSelectedPlanId(planId);
    setActiveRoutinePlanId(planId);
    setActiveTab("session");
  };

  const handleFinalizeSession = (planId: string, logs: Record<string, any>) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    const combinedExercises = [...plan.exercises, ...activeRoutineExtraExercises];
    combinedExercises.forEach((exercise) => {
      const log = logs[exercise.id];
      if (!log) return;
      handleSaveLog(exercise, log);
    });
    try { localStorage.removeItem(`incomplete_session_${planId}`); } catch {}
    try { localStorage.removeItem(`incomplete_session_extra_${planId}`); } catch {}
    try { localStorage.removeItem("active_routine"); } catch {}
    setActiveRoutinePlanId(null);
    setRoutineDraft({});
    setActiveRoutineExtraExercises([]);
    setActiveTab("summary");
  };

  const handleDiscardSession = (planId: string) => {
    try { localStorage.removeItem(`incomplete_session_${planId}`); } catch {}
    try { localStorage.removeItem(`incomplete_session_extra_${planId}`); } catch {}
    try { localStorage.removeItem("active_routine"); } catch {}
    setActiveRoutinePlanId(null);
    setRoutineDraft({});
    setActiveRoutineExtraExercises([]);
    setActiveTab("workouts");
  };

  // persist routineDraft while routine active
  useEffect(() => {
    if (!activeRoutinePlanId) return;
    try { localStorage.setItem(`incomplete_session_${activeRoutinePlanId}`, JSON.stringify(routineDraft)); } catch {}
  }, [routineDraft, activeRoutinePlanId]);
  useEffect(() => {
    if (!activeRoutinePlanId) return;
    try { localStorage.setItem(`incomplete_session_extra_${activeRoutinePlanId}`, JSON.stringify(activeRoutineExtraExercises)); } catch {}
  }, [activeRoutineExtraExercises, activeRoutinePlanId]);

  // update routine draft helper passed to SessionLogger
  const updateRoutineDraft = (exerciseId: string, log: LogInputState) => {
    setRoutineDraft(prev => ({ ...prev, [exerciseId]: log }));
  };

  const addSessionExercise = (ex: { name: string; targetSets: number; targetReps: number; templateId?: string }) => {
    if (!activeRoutinePlanId) return;
    setActiveRoutineExtraExercises(prev => [...prev, { id: uid(), name: ex.name, templateId: ex.templateId, targetSets: ex.targetSets, targetReps: ex.targetReps }]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center px-4 py-8">
      <div className="w-full max-w-6xl flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Workout Tracker POC</h1>
          </div>
        </header>

        {/* Top tabs to switch full-screen panels */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md overflow-hidden border border-slate-800">
            <button
              className={`px-3 py-1 ${activeTab === 'workouts' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('workouts')}
            >
              Workouts
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'session' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('session')}
            >
              Session
            </button>
            <button
              className={`px-3 py-1 ${activeTab === 'summary' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'workouts' && (
            <section className="flex flex-col gap-4">
              <PlanSelectorCard
                plans={plans}
                selectedPlanId={selectedPlanId}
                onSelectPlan={setSelectedPlanId}
                onUpdateExerciseInPlan={handleUpdateExerciseInPlan}
                onDeleteExerciseFromPlan={handleDeleteExerciseFromPlan}
                onAddExerciseToPlan={handleAddExerciseToPlan}
                onStartRoutine={handleStartRoutine}
                disableSelection={!!activeRoutinePlanId}
              />

            </section>
          )}

          {activeTab === 'session' && (
            <section className="flex flex-col gap-4">
                          <Timer />
              {/* If there's no active routine, show a Begin New Workout button */}
              { !activeRoutinePlanId ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md">
                  <p className="text-sm text-slate-400 mb-3">No active workout session.</p>
                  <button className="inline-flex items-center justify-center rounded-md px-3 py-2 bg-emerald-500 hover:bg-emerald-600" onClick={() => setActiveTab('workouts')}>Begin New Workout</button>
                </div>
              ) : (
                <SessionLogger
                  selectedPlan={routinePlan}
                  extraExercises={activeRoutineExtraExercises}
                  onAddSessionExercise={addSessionExercise}
                  onSaveLog={handleSaveLog}
                  onFinalizeSession={handleFinalizeSession}
                  onDiscardSession={handleDiscardSession}
                  draftLogs={routineDraft}
                  onUpdateDraft={updateRoutineDraft}
                />
              )}

            </section>
          )}

          {activeTab === 'summary' && (
            <section className="flex flex-col gap-4">
              <SummaryCard allEntries={sessionEntries} plans={plans} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
