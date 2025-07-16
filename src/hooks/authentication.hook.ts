import { API_URL } from "@/constants/api.constants";

interface LoginCredentials {
  username: string;
  password: string;
}

interface UseFetchUserReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
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

    const data = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error || "Failed to login");
    }
  };

  const logout = async () => {
    const response = await fetch(`http://api.mayhem.local:3000/api/logout`, {
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
  };

  return {
    login,
    logout,
  };
};
