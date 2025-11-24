import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, selectedRole, setSelectedRole, pendingInvite } = useAuth();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim()) return;
    login(username.trim());
    if (pendingInvite) {
      navigate("/join", { replace: true });
      return;
    }
    const fromPath = (location.state as { from?: string } | undefined)?.from;
    navigate(fromPath ?? "/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-8">
      <div className="max-w-md mx-auto w-full flex flex-col gap-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1 text-center">
          <p className="text-sm text-slate-400">Sign in to continue</p>
          <h1 className="text-2xl font-semibold">Log into your squad</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(["trainer", "client"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={`w-full rounded-xl px-3 py-3 text-base font-semibold border ${
                selectedRole === role ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 bg-slate-900"
              }`}
            >
              {role === "trainer" ? "Trainer" : "Client"}
            </button>
          ))}
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Username
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alex"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-3"
          >
            Continue
          </button>
        </form>

        {pendingInvite && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-600 text-emerald-100 px-3 py-2 text-sm">
            Invite detected. Finish login to join the squad.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
