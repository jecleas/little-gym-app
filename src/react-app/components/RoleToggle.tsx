import { Role } from "../lib/types";

type RoleToggleProps = {
  role: Role;
  onChange: (role: Role) => void;
};

const RoleToggle = ({ role, onChange }: RoleToggleProps) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-slate-400">Viewing as:</span>
    <div className="inline-flex rounded-md overflow-hidden border border-slate-800">
      <button
        className={`px-3 py-1 ${role === "trainer" ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-200"}`}
        onClick={() => onChange("trainer")}
      >
        Trainer
      </button>
      <button
        className={`px-3 py-1 ${role === "client" ? "bg-emerald-600 text-white" : "bg-slate-900 text-slate-200"}`}
        onClick={() => onChange("client")}
      >
        Client
      </button>
    </div>
  </div>
);

export default RoleToggle;
