import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const JoinHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, pendingInvite, savePendingInvite, clearPendingInvite, acceptInvite } = useAuth();
  const trainerId = useMemo(() => searchParams.get("trainerId") || pendingInvite, [pendingInvite, searchParams]);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!trainerId) return;
    if (!user) {
      savePendingInvite(trainerId);
      navigate("/", { replace: true });
    }
  }, [navigate, savePendingInvite, trainerId, user]);

  if (!trainerId) {
    return <Navigate to="/" replace />;
  }

  if (!user) return null;

  const handleAccept = () => {
    acceptInvite(trainerId);
    clearPendingInvite();
    setAccepted(true);
    setTimeout(() => navigate("/dashboard", { replace: true }), 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center px-4 py-10">
      <div className="max-w-md mx-auto w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="space-y-2 text-center">
          <p className="text-sm text-emerald-400 uppercase tracking-[0.2em]">Squad Invite</p>
          <h1 className="text-2xl font-semibold">Join {trainerId}'s squad?</h1>
        </div>
        <p className="text-slate-300 text-base leading-relaxed">
          Accepting links your account to this trainer so they can monitor your sessions.
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-3"
            onClick={handleAccept}
            disabled={accepted}
          >
            {accepted ? "Added to squad" : "Accept invite"}
          </button>
          <button
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 px-4 py-3"
            onClick={() => navigate("/dashboard")}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinHandler;
