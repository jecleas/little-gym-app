import { SessionEntry, WorkoutPlan } from "../lib/types";

type SummaryCardProps = {
  allEntries: SessionEntry[];
  plans: WorkoutPlan[];
};

// Helper to group entries by date and plan
const groupEntriesBySession = (entries: SessionEntry[]) => {
  return entries.reduce((acc, entry) => {
    const sessionKey = `${entry.date}-${entry.planId}`;
    if (!acc[sessionKey]) {
      acc[sessionKey] = {
        date: entry.date,
        planId: entry.planId,
        entries: [],
      };
    }
    acc[sessionKey].entries.push(entry);
    return acc;
  }, {} as Record<string, { date: string; planId: string; entries: SessionEntry[] }>);
};

const SummaryCard = ({ allEntries, plans }: SummaryCardProps) => {
  const groupedSessions = Object.values(groupEntriesBySession(allEntries)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (groupedSessions.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md">
        <h2 className="text-lg font-semibold mb-3">Workout History</h2>
        <p className="text-sm text-slate-500">No saved workouts yet. Complete a session to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Workout History</h2>
      {groupedSessions.map((session) => {
        const plan = plans.find((p) => p.id === session.planId);
        if (!plan) return null;

        return (
          <div key={`${session.date}-${session.planId}`} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <h3 className="font-semibold">{plan.name}</h3>
              <span className="text-sm text-slate-400">{new Date(session.date).toLocaleDateString()}</span>
            </div>
            <div className="flex flex-col gap-2">
              {session.entries.map((entry) => {
                const exerciseName = plan.exercises.find((ex) => ex.id === entry.exerciseId)?.name ?? "Unknown Exercise";
                return (
                  <div key={entry.id} className="text-sm">
                    <span className="font-medium">{exerciseName}: </span>
                    <span className="text-slate-400">
                      {entry.repsPerSet.join(", ")} reps @ {entry.weightsPerSet.length ? entry.weightsPerSet.join(", ") : '-'} kg
                    </span>
                    {entry.notes && <p className="text-xs text-slate-500 pl-2">- {entry.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCard;
