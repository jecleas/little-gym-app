import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const roles = [
  { id: "trainer" as const, label: "I am a Trainer" },
  { id: "client" as const, label: "I am a Client" },
];

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { setSelectedRole, selectedRole, pendingInvite, savePendingInvite } = useAuth();

  useEffect(() => {
    if (pendingInvite) {
      savePendingInvite(pendingInvite);
    }
  }, [pendingInvite, savePendingInvite]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-10">
      <div className="max-w-xl mx-auto flex flex-col gap-8">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Welcome</p>
          <h1 className="text-3xl font-semibold">Build and join your training squad</h1>
          <p className="text-slate-400 text-base">
            Choose your role to get started. You can switch later when signing in.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                navigate("/login");
              }}
              className={`w-full rounded-xl px-4 py-4 text-lg font-semibold shadow-lg border border-slate-800 bg-slate-900 hover:border-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 ${selectedRole === role.id ? "ring-2 ring-emerald-500" : ""}`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
