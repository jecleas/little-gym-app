import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../lib/AuthContext";
import PlanSelectorCard from "../../components/PlanSelectorCard";
import SessionLogger, { LogInputState } from "../../components/SessionLogger";
import SummaryCard from "../../components/SummaryCard";
import Timer from "../../components/Timer";
import { initialPlans, today, uid } from "../../lib/data";
import { Exercise, SessionEntry, WorkoutPlan } from "../../lib/types";

const DashboardView = () => {
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlans[0]?.id ?? "");
  const [sessionEntries, setSessionEntries] = useState<SessionEntry[]>([]);
  const [activeRoutinePlanId, setActiveRoutinePlanId] = useState<string | null>(null);
  const [routineDraft, setRoutineDraft] = useState<Record<string, LogInputState>>({});
  const [activeTab, setActiveTab] = useState<"workouts" | "session" | "summary">("workouts");
  const [activeRoutineExtraExercises, setActiveRoutineExtraExercises] = useState<Exercise[]>([]);
  const [showInvite, setShowInvite] = useState(false);

  const trainerInviteUrl = useMemo(() => {
    const origin = window.location.origin;
    return `${origin}/join?trainerId=${encodeURIComponent(user?.username ?? "trainer")}`;
  }, [user?.username]);

  const savePlans = (plansToSave: WorkoutPlan[]) => {
    try {
      localStorage.setItem("workout_plans", JSON.stringify(plansToSave));
    } catch {
      // ignore
    }
  };

  const saveSessionEntries = (entries: SessionEntry[]) => {
    try {
      localStorage.setItem("session_entries", JSON.stringify(entries));
    } catch {
      // ignore
    }
  };

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
    } catch {
      setPlans(initialPlans);
      setSelectedPlanId(initialPlans[0]?.id ?? "");
      savePlans(initialPlans);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("session_entries");
      if (raw) setSessionEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    saveSessionEntries(sessionEntries);
  }, [sessionEntries]);

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
    } catch {}
  }, [plans]);

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const routinePlan = activeRoutinePlanId ? plans.find((p) => p.id === activeRoutinePlanId) : undefined;

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
    const targetPlan = activeRoutinePlanId ? routinePlan : selectedPlan;
    if (!targetPlan) return;

    const repsArray = log.sets.length ? log.sets.map((s) => Number(s.reps) || 0) : [];
    const weightsArray = log.sets.length ? log.sets.map((s) => Number(s.weight) || 0) : [];

    const newEntry: SessionEntry = {
      id: uid(),
      planId: targetPlan.id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
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

  useEffect(() => {
    if (!activeRoutinePlanId) return;
    try { localStorage.setItem(`incomplete_session_${activeRoutinePlanId}`, JSON.stringify(routineDraft)); } catch {}
  }, [routineDraft, activeRoutinePlanId]);
  useEffect(() => {
    if (!activeRoutinePlanId) return;
    try { localStorage.setItem(`incomplete_session_extra_${activeRoutinePlanId}`, JSON.stringify(activeRoutineExtraExercises)); } catch {}
  }, [activeRoutineExtraExercises, activeRoutinePlanId]);

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
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Workout Tracker POC</h1>
            <p className="text-slate-400 text-sm">{user?.role === "trainer" ? "Trainer dashboard" : "Client dashboard"}</p>
            {user?.squadTrainerId && user.role === "client" && (
              <p className="text-xs text-emerald-300">Linked to trainer: {user.squadTrainerId}</p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {user?.role === "trainer" && (
              <button
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md px-3 py-2 bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setShowInvite(true)}
              >
                Invite Client
              </button>
            )}
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md px-3 py-2 bg-slate-800 border border-slate-700"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md overflow-hidden border border-slate-800 w-full sm:w-auto">
            <button
              className={`flex-1 sm:flex-none px-3 py-2 ${activeTab === 'workouts' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('workouts')}
            >
              Workouts
            </button>
            <button
              className={`flex-1 sm:flex-none px-3 py-2 ${activeTab === 'session' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
              onClick={() => setActiveTab('session')}
            >
              Session
            </button>
            <button
              className={`flex-1 sm:flex-none px-3 py-2 ${activeTab === 'summary' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-200'}`}
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

      {showInvite && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h2 className="text-xl font-semibold">Invite client</h2>
            <p className="text-sm text-slate-300">Share this QR code or link to connect clients to your squad.</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center gap-3">
              <QRCodeSVG value={trainerInviteUrl} size={200} className="rounded" />
              <code className="text-xs text-emerald-200 break-all">{trainerInviteUrl}</code>
            </div>
            <button
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-2"
              onClick={() => setShowInvite(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => (
  <ProtectedRoute>
    <DashboardView />
  </ProtectedRoute>
);

export default Dashboard;
