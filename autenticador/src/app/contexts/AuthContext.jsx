/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { loginUser, registerUser } from "../business/services/authService";
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

  const refreshUsers = useCallback(async () => {
    const users = await getManagedUsers();
    setManagedUsers(users);
    return users;
  }, []);

  const refreshData = useCallback(async () => {
    const dataRecords = await getManagedDataRecords();
    setManagedData(dataRecords);
    return dataRecords;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await Promise.all([refreshUsers(), refreshData()]);

      if (isMounted) {
        setIsBootstrapping(false);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [refreshUsers, refreshData]);

  const login = useCallback(async (email, password) => {
    const result = await loginUser({ email, password });

    if (result.success && result.user) {
      setUser(result.user);
    }

    return result;
  }, []);

  const register = useCallback(
    async ({ name, email, password, confirmPassword }) => {
      const result = await registerUser({
        name,
        email,
        password,
        confirmPassword,
      });

      if (result.success && result.user) {
        setUser(result.user);
        await refreshUsers();
      }

      return result;
    },
    [refreshUsers],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const createUserAccount = useCallback(
    async ({ name, email, password }) => {
      const result = await createManagedUser({ name, email, password });

      if (result.success) {
        await refreshUsers();
      }

      return result;
    },
    [refreshUsers],
  );

  const deleteUserAccount = useCallback(
    async (email) => {
      const result = await removeManagedUser({
        email,
        currentUserEmail: user?.email ?? "",
      });

      if (result.success) {
        await refreshUsers();
      }

      return result;
    },
    [refreshUsers, user?.email],
  );

  const createDataItem = useCallback(
    async ({ key, value }) => {
      const result = await createManagedDataRecord({ key, value });

      if (result.success) {
        await refreshData();
      }

      return result;
    },
    [refreshData],
  );

  const updateDataItem = useCallback(
    async ({ id, key, value }) => {
      const result = await updateManagedDataRecord({ id, key, value });

      if (result.success) {
        await refreshData();
      }

      return result;
    },
    [refreshData],
  );

  const deleteDataItem = useCallback(
    async (id) => {
      const result = await removeManagedDataRecord(id);

      if (result.success) {
        await refreshData();
      }

      return result;
    },
    [refreshData],
  );

  const value = useMemo(
    () => ({
      user,
      users: managedUsers,
      dataItems: managedData,
      isBootstrapping,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      createUserAccount,
      deleteUserAccount,
      createDataItem,
      updateDataItem,
      deleteDataItem,
    }),
    [
      user,
      managedUsers,
      managedData,
      isBootstrapping,
      login,
      register,
      logout,
      createUserAccount,
      deleteUserAccount,
      createDataItem,
      updateDataItem,
      deleteDataItem,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }

  return context;
}
