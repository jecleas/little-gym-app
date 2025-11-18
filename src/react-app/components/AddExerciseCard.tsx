import { useEffect, useMemo, useState } from "react";
import { ExerciseTemplate } from "../lib/types";
import { muscleGroups } from "../lib/data";

type AddExerciseCardProps = {
  templates: ExerciseTemplate[];
  onAdd: (exercise: { name: string; targetSets: number; targetReps: number; templateId?: string }) => void;
};

const AddExerciseCard = ({ templates, onAdd }: AddExerciseCardProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState<string>(muscleGroups[0] ?? "Chest");
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(8);

  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "custom") {
      const template = templates.find((t) => t.id === selectedTemplateId);
      setCustomName(template?.name ?? "");
    } else {
      setCustomName("");
    }
  }, [selectedTemplateId, templates]);

  const isCustom = selectedTemplateId === "custom";
  const canSubmit = useMemo(() => (isCustom ? customName.trim().length > 0 : !!selectedTemplateId), [isCustom, customName, selectedTemplateId]);

  const submit = () => {
    const template = templates.find((t) => t.id === selectedTemplateId);
    const name = isCustom ? customName.trim() : template?.name ?? "";
    if (!name) return;
    onAdd({
      name,
      targetSets: targetSets || 1,
      targetReps: targetReps || 1,
      templateId: isCustom ? undefined : template?.id,
    });
    setCustomName("");
    setCustomGroup(muscleGroups[0] ?? "Chest");
    setTargetSets(3);
    setTargetReps(8);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Add Exercise to Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2">
          <label className="text-sm text-slate-400">Choose from templates</label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} {template.muscleGroup ? `(${template.muscleGroup})` : ""}
              </option>
            ))}
            <option value="custom">Custom exercise…</option>
          </select>
        </div>
        {isCustom && (
          <div className="md:col-span-2">
            <label className="text-sm text-slate-400">Custom exercise name</label>
            <input
              className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Bulgarian split squat"
            />
            <div className="mt-2">
              <label className="text-sm text-slate-400">Muscle group</label>
              <select
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {muscleGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div>
          <label className="text-sm text-slate-400">Target sets</label>
          <input
            type="number"
            min={1}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={targetSets}
            onChange={(e) => setTargetSets(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="text-sm text-slate-400">Target reps</label>
          <input
            type="number"
            min={1}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={targetReps}
            onChange={(e) => setTargetReps(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
            onClick={submit}
            disabled={!canSubmit}
          >
            Add exercise to plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExerciseCard;
