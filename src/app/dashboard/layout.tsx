'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50 uppercase-logo">
                <Sidebar />

                <div className="flex-1 flex flex-col">
                    <nav className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-600">Welcome, <strong>{user?.name}</strong></span>
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#006bff] font-bold text-xs">
                                {user?.name?.charAt(0)}
                            </div>
                        </div>
                    </nav>

                    <main className="max-w-7xl w-full mx-auto py-12 px-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
