import { useRef, useEffect, useState } from "react";
import { useSubmitForm } from "@/hooks/submitForm.hook";
import { useAuthentication } from "@/hooks/authentication.hook";
import Link from "next/link";

// Token Security Tester Component
interface SecurityTestResult {
  test: string;
  result: 'PASSED' | 'FAILED';
  details: string;
  success: boolean;
}

const TokenSecurityTester: React.FC<{ userToken: string }> = ({ userToken }) => {
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runSecurityTest = async (testType: string) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/test-token-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, token: userToken }),
      });
      
      const result = await response.json();
      setTestResults(prev => [...prev.filter(r => r.test !== testType), result]);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => [...prev.filter(r => r.test !== testType), {
        test: testType,
        result: 'FAILED',
        details: 'Network error or test execution failed',
        success: false
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    const tests = [
      'algorithm_confusion',
      'signature_tampering', 
      'payload_modification',
      'expiry_manipulation',
      'cross_server_token'
    ];
    
    setIsRunning(true);
    setTestResults([]);
    
    for (const test of tests) {
      await runSecurityTest(test);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }
    setIsRunning(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          onClick={runAllTests}
          disabled={isRunning}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded font-medium"
        >
          {isRunning ? 'Running Tests...' : 'Run All Security Tests'}
        </button>
        
        <button 
          onClick={() => runSecurityTest('algorithm_confusion')}
          disabled={isRunning}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm"
        >
          Algorithm Confusion
        </button>
        
        <button 
          onClick={() => runSecurityTest('signature_tampering')}
          disabled={isRunning}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm"
        >
          Signature Tampering
        </button>
        
        <button 
          onClick={() => runSecurityTest('payload_modification')}
          disabled={isRunning}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm"
        >
          Payload Modification
        </button>
        
        <button 
          onClick={() => runSecurityTest('cross_server_token')}
          disabled={isRunning}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm"
        >
          Cross-Server Token
        </button>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Test Results:</h3>
          {testResults.map((result, index) => (
            <div 
              key={index} 
              className={`p-3 rounded border-l-4 ${
                result.result === 'PASSED' 
                  ? 'bg-green-50 border-green-500 text-green-800' 
                  : 'bg-red-50 border-red-500 text-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {result.test.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  result.result === 'PASSED' 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {result.result}
                </span>
              </div>
              <p className="text-sm mt-1">{result.details}</p>
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          Click &quot;Run All Security Tests&quot; to verify token security against common attack vectors
        </div>
      )}
    </div>
  );
};

const Landing: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { submitForm, isLoading, error, fieldErrors, isSuccess, reset } =
    useSubmitForm();
  const { isLoggedIn, getToken } = useAuthentication();
  const [userToken, setUserToken] = useState<string | null>(null);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        reset();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, reset]);

  // Check authentication status
  useEffect(() => {
    if (isLoggedIn()) {
      setUserToken(getToken());
    }
  }, [isLoggedIn, getToken]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent submission if already loading
    if (isLoading) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    const result = await submitForm(data);

    // If successful, reset the form
    if (result && formRef.current) {
      formRef.current.reset();
    }
  };

  return (
    <>
      {/* Authentication Status Banner */}
      {userToken && (
        <div className="bg-green-600 text-white">
          <div className="max-w-7xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-4 w-4 text-white mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  ✓ You are logged in with a valid token
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-sm font-medium underline hover:no-underline"
              >
                Go to Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}

      <section
        id="hero-section"
        className="relative py-20 flex items-center justify-center"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gray-700 bg-opacity-50"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to Our Platform
          </h1>
          <p className="text-2xl text-gray-100">Discover Amazing Features</p>
          <button className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300">
            Get Started
          </button>
        </div>
      </section>

      <section id="feature-grid" className="py-16 px-4 md:px-10 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              id="feature-1"
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Performance</h3>
              <p className="text-gray-600">Lightning quick loading times</p>
            </div>

            <div
              id="feature-2"
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-gray-600">Enterprise-grade security</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable Solution</h3>
              <p className="text-gray-600">Grows with your business needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Token Security Testing Section - only show when logged in */}
      {userToken && (
        <section id="token-security" className="py-16 px-4 bg-gray-100">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              🔒 Token Security Testing
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Test the security of our JWT token implementation against common
              attack vectors
            </p>

            <TokenSecurityTester userToken={userToken} />
          </div>
        </section>
      )}

      <section id="contact-form" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>

          <form
            ref={formRef}
            onSubmit={handleFormSubmit}
            method="POST"
            className="bg-gray-50 p-8 rounded-lg shadow-md"
          >
            <div className="mb-6">
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-medium mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.fullName
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your@email.com"
                className={`form-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            <div className="mb-6">
              <label
                htmlFor="message"
                className="block text-gray-700 font-medium mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="How can we help you?"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.message
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              ></textarea>
              {fieldErrors.message && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-medium py-3 rounded-lg transition duration-300 flex items-center justify-center ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isLoading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <div
            className={`mt-4 p-4 bg-green-100 text-green-700 rounded-lg relative ${
              isSuccess ? "block" : "hidden"
            }`}
          >
            <button
              onClick={reset}
              className="absolute top-2 right-2 text-green-700 hover:text-green-900 font-bold text-lg leading-none"
              aria-label="Close success message"
            >
              ×
            </button>
            Thank you for contacting us! We&apos;ll get back to you soon.
          </div>

          <div
            className={`mt-4 p-4 bg-red-100 text-red-700 rounded-lg ${
              fieldErrors.general ||
              (error &&
                !fieldErrors.fullName &&
                !fieldErrors.email &&
                !fieldErrors.message)
                ? "block"
                : "hidden"
            }`}
          >
            {fieldErrors.general ||
              error ||
              "Something went wrong. Please try again."}
          </div>
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Mayhem. All rights reserved.</p>
          <div className="mt-4 flex justify-center space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <span className="sr-only">Facebook</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <span className="sr-only">Twitter</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;
