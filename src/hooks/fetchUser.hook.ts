import { useState, useEffect } from "react";
import { API_URL } from "@/constants/api.constants";

interface UseFetchUserResult {
  users: unknown[] | null;
  loading: boolean;
  error: Error | null;
}

export const useFetchUser = (): UseFetchUserResult => {
  const [users, setUsers] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/user`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();

        setUsers(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch user")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { users, loading, error };
};
