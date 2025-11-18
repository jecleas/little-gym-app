import { useState } from "react";

type PlanFormCardProps = {
  onCreatePlan: (name: string, description?: string) => void;
};

const PlanFormCard = ({ onCreatePlan }: PlanFormCardProps) => {
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");

  const submit = () => {
    if (!planName.trim()) return;
    onCreatePlan(planName.trim(), planDescription.trim() || undefined);
    setPlanName("");
    setPlanDescription("");
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Create Plan</h2>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-sm text-slate-400">Plan name</label>
          <input
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Upper/Lower Split"
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Description</label>
          <textarea
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={planDescription}
            onChange={(e) => setPlanDescription(e.target.value)}
            placeholder="Optional notes or focus areas"
          />
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
          onClick={submit}
          disabled={!planName.trim()}
        >
          Create Plan
        </button>
      </div>
    </div>
  );
};

export default PlanFormCard;
