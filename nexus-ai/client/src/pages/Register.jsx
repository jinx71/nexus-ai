import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { NexusMark } from '../components/icons';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', confirm: '' } });

  const password = watch('password');

  const onSubmit = async ({ name, email, password: pw }) => {
    setServerError('');
    try {
      await registerUser({ name, email, password: pw });
      toast.success('Account created');
      navigate('/tools', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <NexusMark className="h-10 w-10" />
          <h1 className="mt-3 text-2xl font-bold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Free, and works in demo mode out of the box.</p>
        </div>

        <Card className="p-6">
          {serverError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <Input
              id="name"
              label="Name"
              placeholder="Ada Lovelace"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'At least 2 characters' },
              })}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Input
              id="confirm"
              type="password"
              label="Confirm password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirm?.message}
              {...register('confirm', {
                required: 'Please confirm your password',
                validate: (v) => v === password || 'Passwords do not match',
              })}
            />

            <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
