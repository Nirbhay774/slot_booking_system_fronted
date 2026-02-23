'use client';

import React from 'react';
import { Calendar, Trash2, Edit2, CheckCircle, Link } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';

interface ScheduleCardProps {
    schedule: {
        _id: string;
        name: string;
        isDefault: boolean;
        availability: any;
    };
    eventCount?: number;
    onEdit: (schedule: any) => void;
    onRefresh: () => void;
}

export default function ScheduleCard({ schedule, eventCount = 0, onEdit, onRefresh }: ScheduleCardProps) {
    const handleDelete = async () => {
        if (eventCount > 0) {
            alert(`This schedule is used by ${eventCount} event(s). Please move them to another schedule before deleting.`);
            return;
        }
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.delete(`/schedules/${schedule._id}`);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete schedule:', error);
        }
    };

    return (
        <div className={`bg-white rounded-xl border-2 transition-all flex flex-col overflow-hidden ${schedule.isDefault ? 'border-blue-100 shadow-sm' : 'border-gray-100'
            }`}>
            <div className={`h-2 ${schedule.isDefault ? 'bg-[#006bff]' : 'bg-gray-200'}`} />
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                            {schedule.name}
                            {schedule.isDefault && (
                                <span className="bg-blue-50 text-[#006bff] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    Default
                                </span>
                            )}
                        </h3>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Calendar size={16} />
                        <span>
                            {schedule.availability.weeklySchedule.filter((s: any) => s.isAvailable).length} days available
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Link size={16} />
                        <span>Used by {eventCount} event(s)</span>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-500 text-sm font-semibold transition-colors"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>

                    <button
                        onClick={() => onEdit(schedule)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#006bff] text-sm font-semibold transition-colors"
                    >
                        <Edit2 size={16} />
                        <span>Edit</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
