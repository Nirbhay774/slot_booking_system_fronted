'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Share2, ChevronDown } from 'lucide-react';
import api from '@/lib/axios';
import MeetingCard from '@/components/meetings/MeetingCard';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

export default function MeetingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rescheduleData, setRescheduleData] = useState<any | null>(null);
    const [rescheduleForm, setRescheduleForm] = useState({ date: '', startTime: '' });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/me');
            setBookings(response.data);
        } catch (err: any) {
            console.error('Failed to fetch bookings:', err);
            setError('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleConfirmCancel = async () => {
        if (!cancelId) return;
        setActionLoading(true);
        try {
            await api.patch(`/bookings/me/${cancelId}/cancel`);
            await fetchBookings();
            setCancelId(null);
        } catch (err) {
            alert('Failed to cancel meeting');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setActionLoading(true);
        try {
            await api.delete(`/bookings/me/${deleteId}`);
            await fetchBookings();
            setDeleteId(null);
        } catch (err) {
            alert('Failed to delete record');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rescheduleData) return;
        setActionLoading(true);
        try {
            // Calculate end time based on duration
            const [h, m] = rescheduleForm.startTime.split(':').map(Number);
            const endMinutes = h * 60 + m + (rescheduleData.eventId?.duration || 30);
            const newEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

            await api.patch(`/bookings/me/${rescheduleData._id}/reschedule`, {
                date: rescheduleForm.date,
                startTime: rescheduleForm.startTime,
                endTime: newEndTime
            });
            await fetchBookings();
            setRescheduleData(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to reschedule');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const meetingDate = new Date(b.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming') {
            return meetingDate >= today && b.status !== 'cancelled';
        } else {
            return meetingDate < today || b.status === 'cancelled';
        }
    });

    // Group by date
    const groupedBookings = filteredBookings.reduce((groups: any, booking) => {
        const date = booking.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(booking);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedBookings).sort((a, b) =>
        activeTab === 'upcoming'
            ? new Date(a).getTime() - new Date(b).getTime()
            : new Date(b).getTime() - new Date(a).getTime()
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006bff]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meetings</h1>
                    <div className="bg-gray-100 p-1 rounded-full text-gray-400">
                        <HelpCircle size={14} />
                    </div>
                </div>
            </div>

            {/* Sub-header like in screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                        My Calendly <ChevronDown size={14} />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <span>Show buffers</span>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative shadow-inner">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                    Displaying {filteredBookings.length} of {bookings.length} Events
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="px-8 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'upcoming' ? 'text-[#006bff] border-[#006bff]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            Upcoming
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'past' ? 'text-[#006bff] border-[#006bff]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                        >
                            Past
                        </button>
                        <button className="py-4 text-sm font-bold text-gray-400 border-b-2 border-transparent hover:text-gray-600 flex items-center gap-1">
                            Date Range <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Share2 size={14} /> Export
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <Filter size={14} /> Filter <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* List Container */}
                <div className="min-h-[400px]">
                    {sortedDates.length > 0 ? (
                        sortedDates.map(date => (
                            <div key={date}>
                                <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                {groupedBookings[date].map((booking: any) => (
                                    <MeetingCard
                                        key={booking._id}
                                        booking={booking}
                                        onCancel={setCancelId}
                                        onDelete={setDeleteId}
                                        onReschedule={(b) => {
                                            setRescheduleData(b);
                                            setRescheduleForm({ date: b.date, startTime: b.startTime });
                                        }}
                                    />
                                ))}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-[#006bff] mb-4">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">No {activeTab} meetings</h3>
                            <p className="text-gray-500">When you have scheduled meetings, they will appear here.</p>
                        </div>
                    )}

                    {sortedDates.length > 0 && (
                        <div className="py-8 text-center text-sm font-medium text-gray-400 border-t border-gray-50 mt-12">
                            You've reached the end of the list
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={!!cancelId}
                onClose={() => setCancelId(null)}
                onConfirm={handleConfirmCancel}
                title="Cancel Meeting"
                message="Are you sure you want to cancel this meeting? This action cannot be undone."
                variant="danger"
                confirmLabel="Cancel Meeting"
                loading={actionLoading}
            />

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Record"
                message="Are you sure you want to permanently delete this meeting record?"
                variant="danger"
                confirmLabel="Delete Permanently"
                loading={actionLoading}
            />

            <Modal
                isOpen={!!rescheduleData}
                onClose={() => setRescheduleData(null)}
                title="Reschedule Meeting"
            >
                <form onSubmit={handleConfirmReschedule} className="space-y-6">
                    <p className="text-sm text-gray-500">
                        Propose a new date and time for your meeting with <span className="font-bold">{rescheduleData?.visitorName}</span>.
                    </p>

                    <Input
                        label="New Date"
                        type="date"
                        value={rescheduleForm.date}
                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                        required
                    />

                    <Input
                        label="New Start Time"
                        type="time"
                        value={rescheduleForm.startTime}
                        onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                        required
                    />

                    <div className="flex items-center gap-3 pt-4">
                        <Button variant="outline" fullWidth onClick={() => setRescheduleData(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" fullWidth loading={actionLoading}>
                            Confirm Reschedule
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

function HelpCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}
