import LoginForm from './components/LoginForm';

/**
 * Login page that handles user authentication using Supabase
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access Mark1
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
} 