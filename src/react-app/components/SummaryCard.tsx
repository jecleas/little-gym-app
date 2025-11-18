import { SessionEntry, WorkoutPlan } from "../lib/types";

const SummaryCard = ({ plan, entries, date }: { plan?: WorkoutPlan; entries: SessionEntry[]; date: string }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today's Summary</h2>
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      {entries.length ? (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => {
            const exercise = plan?.exercises.find((ex) => ex.id === entry.exerciseId);
            const averageReps = entry.repsPerSet.length
              ? Math.round(entry.repsPerSet.reduce((sum, r) => sum + r, 0) / entry.repsPerSet.length)
              : 0;
            return (
              <div key={entry.id} className="border border-slate-800 rounded-lg p-3 bg-slate-900/50">
                <div className="font-medium">{exercise?.name ?? "Exercise"}</div>
                <div className="text-sm text-slate-400">
                  {entry.setsDone} sets x avg {averageReps} reps @ {entry.weight}kg
                </div>
                {entry.notes && <p className="text-sm text-slate-300">Notes: {entry.notes}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No entries logged for today.</p>
      )}
    </div>
  );
};

export default SummaryCard;
