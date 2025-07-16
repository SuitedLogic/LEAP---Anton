import { useState, useEffect } from "react";
import { API_URL } from "@/constants/api.constants";

interface CmsSection {
  id: string;
  type: string;
  attributes: Record<string, unknown>;
}

interface UseFetchContentResult {
  content: CmsSection[] | null;
  loading: boolean;
  error: Error | null;
}

export const useFetchContent = (): UseFetchContentResult => {
  const [content, setContent] = useState<[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/content`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();

        setContent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch content")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
};
