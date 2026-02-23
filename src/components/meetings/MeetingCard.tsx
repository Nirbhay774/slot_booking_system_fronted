'use client';

import React from 'react';
import { Clock, User, CheckCircle2, XCircle, AlertCircle, Trash2, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

interface MeetingCardProps {
    booking: {
        _id: string;
        visitorName: string;
        visitorEmail: string;
        date: string;
        startTime: string;
        endTime: string;
        status: 'scheduled' | 'cancelled' | 'rescheduled';
        eventId: {
            name: string;
            duration: number;
        };
    };
    onCancel: (id: string) => void;
    onReschedule: (booking: any) => void;
    onDelete: (id: string) => void;
}

export default function MeetingCard({ booking, onCancel, onReschedule, onDelete }: MeetingCardProps) {
    const isCancelled = booking.status === 'cancelled';

    const getStatusIcon = () => {
        switch (booking.status) {
            case 'scheduled': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'cancelled': return <XCircle size={16} className="text-red-500" />;
            case 'rescheduled': return <AlertCircle size={16} className="text-blue-500" />;
            default: return null;
        }
    };

    return (
        <div className={`p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${isCancelled ? 'bg-gray-50/50 opacity-75' : 'bg-white hover:bg-gray-50/30'}`}>
            <div className="flex items-start gap-6">
                {/* Purple dot like in screenshot */}
                <div className="w-6 h-6 rounded-full bg-[#6558f5] mt-1 shrink-0" />

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium text-gray-900">
                            {booking.startTime.toLowerCase()} — {booking.endTime.toLowerCase()}
                        </span>
                        {getStatusIcon()}
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{booking.visitorName}</span>
                        <span className="text-sm text-gray-500">
                            Event type <span className="font-bold">{booking.eventId?.name || 'Meeting'}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="flex items-center gap-4 text-sm text-gray-400 font-medium mr-4">
                    <span>1 host | 0 non-hosts</span>
                </div>

                <div className="flex items-center gap-2">
                    {!isCancelled && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReschedule(booking)}
                                className="text-xs py-1.5 px-3 rounded-lg border-gray-200"
                            >
                                <Calendar size={14} className="mr-1" />
                                Reschedule
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onCancel(booking._id)}
                                className="text-xs py-1.5 px-3 rounded-lg border-red-100 text-red-600 hover:bg-red-50"
                            >
                                <XCircle size={14} className="mr-1" />
                                Cancel
                            </Button>
                        </>
                    )}
                    <button
                        onClick={() => onDelete(booking._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete record"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button className="text-[#006bff] font-bold text-sm hover:underline ml-2">
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
}
