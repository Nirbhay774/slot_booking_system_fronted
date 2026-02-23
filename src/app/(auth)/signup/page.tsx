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

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/auth/signup', data);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong during signup');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center pt-12 px-4">
            <div className="w-full max-w-[440px] flex flex-col items-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Sign up with Calendly
                </h1>

                <div className="w-full p-8 border border-gray-100 rounded-2xl shadow-sm bg-white">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Mobile Number"
                            type="tel"
                            placeholder="1234567890"
                            {...register('mobileNumber')}
                            error={errors.mobileNumber?.message}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Min. 6 characters"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button type="submit" fullWidth loading={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#006bff] font-semibold hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
