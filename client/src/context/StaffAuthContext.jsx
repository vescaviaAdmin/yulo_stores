import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/auth.api";
import { setStaffToken, getStaffToken } from "@/api/client";

const PROFILE_KEY = "yulo_staff_profile";

function readProfile() {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const StaffAuthContext = createContext(null);

export function StaffAuthProvider({ children }) {
  // Session-scoped: profile + token gone when tab closes (intentional for POS terminals).
  const [staff, setStaff] = useState(() => {
    const profile = readProfile();
    // Restore token into the client module so Axios interceptor picks it up.
    if (profile) getStaffToken(); // reads from sessionStorage internally
    return profile;
  });

  const login = useCallback(async ({ restaurantId, staffCode, pin }) => {
    const { data } = await authApi.staffLogin({ restaurantId, staffCode, pin });
    const { staffToken, role, name, staffCode: code } = data.data;
    setStaffToken(staffToken);
    const profile = { role, name, staffCode: code, restaurantId };
    sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setStaff(profile);
    return profile;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.staffLogout(); } catch { /* silent */ }
    setStaffToken(null);
    sessionStorage.removeItem(PROFILE_KEY);
    setStaff(null);
  }, []);

  return (
    <StaffAuthContext.Provider
      value={{ staff, login, logout, isAuthenticated: !!staff }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const ctx = useContext(StaffAuthContext);
  if (!ctx) throw new Error("useStaffAuth must be inside StaffAuthProvider");
  return ctx;
}
