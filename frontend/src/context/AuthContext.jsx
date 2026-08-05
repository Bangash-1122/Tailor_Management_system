import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import {
  login as loginApi,
  getMe as getMeApi,
  logout as logoutApi,
} from '../api/auth';

import {
  setToken as setAuthToken,
  clearToken,
  setUnauthorizedHandler,
  initAuthToken,
  getToken as getStoredToken,
} from '../api/authToken';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(false);

  const [authLoading, setAuthLoading] =
    useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
      setToken(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      initAuthToken();

      const existingToken =
        getStoredToken();

      if (!existingToken) {
        setAuthLoading(false);
        return;
      }

      setToken(existingToken);

      try {
        const response = await getMeApi();

        const currentUser =
          response.data?.data;

        if (!currentUser) {
          throw new Error(
            'User was not returned'
          );
        }

        setUser(currentUser);
      } catch (error) {
        console.error(
          'Session restoration failed:',
          error
        );

        clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(
    async (email, password) => {
      setLoading(true);

      try {
        const response = await loginApi({
          email: email.trim().toLowerCase(),
          password,
        });

        const loggedInUser =
          response.data?.data?.user;

        const accessToken =
          response.data?.data?.accessToken;

        if (!loggedInUser) {
          throw new Error(
            'User data was not returned'
          );
        }

        if (!accessToken) {
          throw new Error(
            'Access token was not returned'
          );
        }

        setAuthToken(accessToken);
        setToken(accessToken);
        setUser(loggedInUser);

        return {
          success: true,
          user: loggedInUser,
        };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            error.response?.data?.errors?.[0]
              ?.msg ||
            error.message ||
            'Login failed. Please check your credentials.',
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error(
        'Backend logout failed:',
        error
      );
    } finally {
      clearToken();
      setToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = Boolean(
    token && user
  );

  const value = {
    user,
    token,
    loading,
    authLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};