import { API_URL } from "@/constants/api.constants";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
    };
  };
  error?: string;
}

interface UseFetchUserReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
  getToken: () => string | null;
}

export const useAuthentication = (): UseFetchUserReturn => {
  const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data: LoginResponse = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to login");
    }

    // Store token in localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Set login time for welcome message
      localStorage.setItem('loginTime', Date.now().toString());
    }
  };

  const logout = async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to logout");
    }

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  };

  const isLoggedIn = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('authToken');
    return !!token;
  };

  const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  };

  return {
    login,
    logout,
    isLoggedIn,
    getToken,
  };
};
