/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
  sendPasswordResetEmail,
  updateCurrentUserPassword,
} from "../business/services/authService";
import {
  createManagedUser,
  getManagedUsers,
  removeManagedUser,
} from "../business/services/userService";
import {
  createManagedDataRecord,
  getManagedDataRecords,
  removeManagedDataRecord,
  updateManagedDataRecord,
} from "../business/services/dataService";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [managedUsers, setManagedUsers] = useState([]);
  const [managedData, setManagedData] = useState([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const [users, dataItems] = await Promise.all([
        getManagedUsers(),
        getManagedDataRecords(),
      ]);

      setManagedUsers(users);
      setManagedData(dataItems);

      const profile = await getCurrentAuthenticatedUser();

      setUser(profile);
      setIsBootstrapping(false);
    };

    bootstrap();
  }, []);

  const login = async (email, password) => {
    const result = await loginUser({ email, password });

    if (result.success && result.user) {
      setUser(result.user);
    }

    return result;
  };

  const register = async ({
    name,
    username,
    email,
    password,
    confirmPassword,
  }) => {
    const result = await registerUser({
      name,
      username,
      email,
      password,
      confirmPassword,
    });

    if (result.success) {
      setManagedUsers(await getManagedUsers());
    }

    if (result.success && result.user) {
      setUser(result.user);
    }

    return result;
  };

  const logout = async () => {
    const result = await logoutUser();

    if (result.success) {
      setUser(null);
    }

    return result;
  };

  const requestPasswordReset = (email, redirectTo) =>
    sendPasswordResetEmail({ email, redirectTo });

  const updatePassword = (password) => updateCurrentUserPassword(password);

  const createUserAccount = async ({ name, email, role }) => {
    const result = await createManagedUser({ name, email, role });

    if (result.success) {
      setManagedUsers(await getManagedUsers());
    }

    return result;
  };

  const deleteUserAccount = async (email) => {
    const result = await removeManagedUser({
      email,
      currentUserEmail: user?.email ?? "",
    });

    if (result.success) {
      setManagedUsers(await getManagedUsers());
    }

    return result;
  };

  const createDataItem = async ({ key, value }) => {
    const result = await createManagedDataRecord({ key, value });

    if (result.success) {
      setManagedData(await getManagedDataRecords());
    }

    return result;
  };

  const updateDataItem = async ({ id, key, value }) => {
    const result = await updateManagedDataRecord({ id, key, value });

    if (result.success) {
      setManagedData(await getManagedDataRecords());
    }

    return result;
  };

  const deleteDataItem = async (id) => {
    const result = await removeManagedDataRecord(id);

    if (result.success) {
      setManagedData(await getManagedDataRecords());
    }

    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users: managedUsers,
        dataItems: managedData,
        isBootstrapping,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        requestPasswordReset,
        updatePassword,
        createUserAccount,
        deleteUserAccount,
        createDataItem,
        updateDataItem,
        deleteDataItem,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
