import { useState } from 'react';

interface SubmitFormData {
  fullName: string;
  email: string;
  message: string;
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  message?: string;
  general?: string; // For non-field-specific errors
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  fieldErrors?: FieldErrors;
}

interface UseSubmitFormReturn {
  submitForm: (data: SubmitFormData) => Promise<ApiResponse | null>;
  isLoading: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
  isSuccess: boolean;
  reset: () => void;
}

export const useSubmitForm = (): UseSubmitFormReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const submitForm = async (data: SubmitFormData) => {
    setIsLoading(true);
    setError(null);
    setFieldErrors({});
    setIsSuccess(false);

    try {
      const response = await fetch("/api/contactable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // The API uses 'error' field, not 'message'
        const errorMessage = result.error || result.message || 'Something went wrong';
        
        // Try to map the error message to specific fields
        const fieldErrorMap: FieldErrors = {};
        
        if (errorMessage.toLowerCase().includes('email')) {
          fieldErrorMap.email = errorMessage;
        } else if (errorMessage.toLowerCase().includes('name')) {
          fieldErrorMap.fullName = errorMessage;
        } else if (errorMessage.toLowerCase().includes('message')) {
          fieldErrorMap.message = errorMessage;
        } else {
          fieldErrorMap.general = errorMessage;
        }
        
        setFieldErrors(fieldErrorMap);
        setError(errorMessage); // Keep general error for backwards compatibility
        return null;
      }

      setIsSuccess(true);
      console.log("Form submission result:", result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setFieldErrors({ general: errorMessage });
      console.error("Form submission error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
    setFieldErrors({});
    setIsSuccess(false);
  };

  return { submitForm, isLoading, error, fieldErrors, isSuccess, reset };
};
