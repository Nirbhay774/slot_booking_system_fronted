'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/auth/login', data);
            const { accessToken, refreshToken, user } = response.data;
            login(accessToken, refreshToken, user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-4">
            <div className="w-full max-w-[440px] flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center leading-tight">
                    Log in to your account
                </h1>

                <div className="w-full p-8 border border-gray-100 rounded-2xl shadow-sm bg-white">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button type="submit" fullWidth loading={loading}>
                            {loading ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-[#006bff] font-semibold hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
