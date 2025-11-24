import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type Role = "trainer" | "client";

export type User = {
  username: string;
  role: Role;
  squadTrainerId?: string | null;
};

type AuthContextValue = {
  user: User | null;
  selectedRole: Role;
  pendingInvite: string | null;
  setSelectedRole: (role: Role) => void;
  login: (username: string, roleOverride?: Role) => void;
  logout: () => void;
  savePendingInvite: (trainerId: string) => void;
  clearPendingInvite: () => void;
  acceptInvite: (trainerId: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_USER_KEY = "auth_user";
const SELECTED_ROLE_KEY = "selected_role";
const PENDING_INVITE_KEY = "pendingInvite";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_USER_KEY);
      if (raw) return JSON.parse(raw) as User;
    } catch {
      // ignore
    }
    return null;
  });

  const [selectedRole, setSelectedRoleState] = useState<Role>(() => {
    try {
      const raw = localStorage.getItem(SELECTED_ROLE_KEY);
      if (raw === "trainer" || raw === "client") return raw;
    } catch {
      // ignore
    }
    return "client";
  });

  const [pendingInvite, setPendingInvite] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(PENDING_INVITE_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_ROLE_KEY, selectedRole);
    } catch {
      // ignore
    }
  }, [selectedRole]);

  const setSelectedRole = (role: Role) => {
    setSelectedRoleState(role);
  };

  const login = (username: string, roleOverride?: Role) => {
    const role = roleOverride ?? selectedRole;
    const baseUser: User = { username, role, squadTrainerId: user?.squadTrainerId ?? null };
    setUser(baseUser);
  };

  const logout = () => {
    setUser(null);
    setPendingInvite(null);
    try {
      sessionStorage.removeItem(PENDING_INVITE_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {
      // ignore
    }
  };

  const savePendingInvite = (trainerId: string) => {
    setPendingInvite(trainerId);
    try {
      sessionStorage.setItem(PENDING_INVITE_KEY, trainerId);
    } catch {
      // ignore
    }
  };

  const clearPendingInvite = () => {
    setPendingInvite(null);
    try {
      sessionStorage.removeItem(PENDING_INVITE_KEY);
    } catch {
      // ignore
    }
  };

  const acceptInvite = (trainerId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, squadTrainerId: trainerId };
    });
    clearPendingInvite();
  };

  const value = useMemo(
    () => ({
      user,
      selectedRole,
      pendingInvite,
      setSelectedRole,
      login,
      logout,
      savePendingInvite,
      clearPendingInvite,
      acceptInvite,
    }),
    [user, selectedRole, pendingInvite],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
