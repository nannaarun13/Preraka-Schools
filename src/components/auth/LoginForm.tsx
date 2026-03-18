import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { handleLogin, loginSchema } from '@/utils/authUtils';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegisterClick: () => void;
  onHomeClick: () => void;
}

const LoginForm = ({ onForgotPassword, onRegisterClick, onHomeClick }: LoginFormProps) => {

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {

    setError(null);

    try {

      await handleLogin(values);

    } catch (err: any) {

      console.error("Login Error:", err);

      if (err.code === 'auth/invalid-credential') {

        setError("Incorrect email or password.");

      } else if (err.code === 'auth/user-not-found') {

        setError("No account found with this email. Please register first.");

      } else if (err.code === 'auth/too-many-requests') {

        setError("Too many failed attempts. Please try again later.");

      } else if (err.message?.includes('not approved')) {

        setError("Your account is pending approval by the Super Admin.");

      } else {

        setError(err.message || "Failed to login. Check your connection.");

      }

    }

  };

  return (

    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      {error && (

        <Alert variant="destructive">

          <AlertCircle className="h-4 w-4" />

          <AlertDescription>
            {error}
          </AlertDescription>

        </Alert>

      )}

      {/* EMAIL FIELD */}

      <div className="space-y-2">

        <Label htmlFor="email">
          Email
        </Label>

        <Input
          id="email"
          type="email"
          placeholder="admin@school.com"
          required
          {...form.register('email')}
        />

        {form.formState.errors.email && (

          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>

        )}

      </div>

      {/* PASSWORD FIELD */}

      <div className="space-y-2">

        <div className="flex items-center justify-between">

          <Label htmlFor="password">
            Password
          </Label>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-school-blue hover:underline"
          >
            Forgot password?
          </button>

        </div>

        <div className="relative">

          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            required
            {...form.register('password')}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >

            {showPassword ? (

              <EyeOff size={18} />

            ) : (

              <Eye size={18} />

            )}

          </button>

        </div>

        {form.formState.errors.password && (

          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>

        )}

      </div>

      {/* LOGIN BUTTON */}

      <Button
        type="submit"
        className="w-full bg-school-blue hover:bg-school-blue/90"
        disabled={form.formState.isSubmitting}
      >

        {form.formState.isSubmitting ? (

          <Loader2 className="mr-2 h-4 w-4 animate-spin" />

        ) : (

          "Sign In"

        )}

      </Button>

      {/* EXTRA BUTTONS */}

      <div className="space-y-2 pt-2">

        <Button
          type="button"
          variant="outline"
          className="w-full border-school-blue text-school-blue"
          onClick={onRegisterClick}
        >
          Register New Admin
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full text-gray-500"
          onClick={onHomeClick}
        >
          Back to Home
        </Button>

      </div>

    </form>

  );

};

export default LoginForm;
