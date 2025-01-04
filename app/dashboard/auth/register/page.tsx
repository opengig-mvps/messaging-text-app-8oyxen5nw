'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import api from '@/lib/api';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  confirmPassword: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const payload = {
        email: data.email,
        password: data.password,
      };

      const response = await api.post('/api/auth/register', payload);

      if (response.data.success) {
        toast.success('Registration successful! Redirecting to dashboard...');
        router.push('/dashboard/user');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              {...register('password')}
              type="password"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          <Button type="submit" className="w-full">
            {loading ? <LoaderCircleIcon className="animate-spin" /> : "Register"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;