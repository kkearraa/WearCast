import React, { createContext, useContext, useEffect, useState } from 'react';
import { GUEST_ID, setCurrentUserId } from '../db/session';
import {
  createUser,
  verifyLogin,
  getUserById,
  updateUserProfile,
  changeUserPassword,
} from '../db/users';
import { saveSession, loadSession, clearSession } from '../utils/sessionStore';

// Gives every screen access to "who is logged in" and the auth actions.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check for a saved session

  // On app start: restore the previous login, if there was one.
  useEffect(() => {
    (async () => {
      try {
        const savedId = await loadSession();
        if (savedId) {
          const saved = await getUserById(savedId);
          if (saved && !saved.isGuest) {
            setCurrentUserId(saved.id);
            setUser(saved);
          } else {
            await clearSession();
          }
        }
      } catch (e) {
        console.warn('Could not restore session', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startSession = async (u) => {
    setCurrentUserId(u.id);
    await saveSession(u.id);
    setUser(u);
    return u;
  };

  const signUp = async ({ name, email, password }) => startSession(await createUser({ name, email, password }));

  const logIn = async ({ email, password }) => {
    const u = await verifyLogin(email, password);
    if (!u) throw new Error('INVALID_CREDENTIALS');
    return startSession(u);
  };

  // Guest = the built-in guest closet. Not remembered between launches.
  const continueAsGuest = async () => {
    const guest = await getUserById(GUEST_ID);
    setCurrentUserId(GUEST_ID);
    await clearSession();
    setUser(guest);
  };

  const logOut = async () => {
    await clearSession();
    setCurrentUserId(GUEST_ID);
    setUser(null);
  };

  const updateProfile = async ({ name, email }) => {
    const updated = await updateUserProfile(user.id, { name, email });
    setUser(updated);
    return updated;
  };

  const changePassword = (currentPassword, newPassword) =>
    changeUserPassword(user.id, currentPassword, newPassword);

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, logIn, continueAsGuest, logOut, updateProfile, changePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
