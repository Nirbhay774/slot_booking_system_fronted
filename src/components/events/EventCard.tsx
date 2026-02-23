'use client';

import React, { useState } from 'react';
import { Clock, Video, Copy, Edit2, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';

interface EventCardProps {
    event: {
        _id: string;
        name: string;
        duration: number;
        locationType: string;
        locationDetails?: string;
        isActive: boolean;
    };
    onEdit: (event: any) => void;
    onRefresh: () => void;
}

export default function EventCard({ event, onEdit, onRefresh }: EventCardProps) {
    const [isToggling, setIsToggling] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    const getLocationLabel = (type: string) => {
        switch (type) {
            case 'google_meet': return 'Google Meet';
            case 'zoom': return 'Zoom';
            case 'phone': return 'Phone Call';
            default: return 'Custom Location';
        }
    };

    const handleToggle = async () => {
        setIsToggling(true);
        try {
            await api.patch(`/events/${event._id}`, { isActive: !event.isActive });
            onRefresh();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
        } finally {
            setIsToggling(false);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/book/${event._id}`;
        navigator.clipboard.writeText(link);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    return (
        <div className={`bg-white rounded-xl border-2 transition-all flex flex-col overflow-hidden ${event.isActive ? 'border-gray-200 shadow-sm hover:shadow-md' : 'border-gray-100 opacity-75'
            }`}>
            <div className={`h-2 ${event.isActive ? 'bg-[#006bff]' : 'bg-gray-300'}`} />
            <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{event.name}</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={event.isActive}
                            onChange={handleToggle}
                            disabled={isToggling}
                            className="w-5 h-5 rounded border-gray-300 text-[#006bff] focus:ring-[#006bff] cursor-pointer disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Clock size={16} />
                        <span>{event.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Video size={16} />
                        <span>{getLocationLabel(event.locationType)}</span>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50 flex justify-between items-center">
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${showCopied ? 'text-green-500' : 'text-gray-600 hover:text-[#006bff]'
                            }`}
                    >
                        {showCopied ? (
                            <>
                                <Check size={16} className="animate-in zoom-in" />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                <span>Copy link</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => onEdit(event)}
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

