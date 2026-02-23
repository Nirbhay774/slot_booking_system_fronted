'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { Settings, Calendar as CalendarIcon, Clock, ChevronRight, Check, Plus } from 'lucide-react';
import AvailabilityDetails from '@/components/events/AvailabilityDetails';
import Button from '@/components/ui/Button';

const slotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
});

const dayScheduleSchema = z.object({
    day: z.string(),
    isAvailable: z.boolean(),
    slots: z.array(slotSchema),
});

const availabilitySchema = z.object({
    rollingWindow: z.coerce.number().default(60),
    weeklySchedule: z.array(dayScheduleSchema),
});

interface EventType {
    _id: string;
    name: string;
    availability: any;
}

export default function AvailabilityPage() {
    const [events, setEvents] = useState<EventType[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<any>({
        resolver: zodResolver(z.object({ availability: availabilitySchema })),
    });

    const { reset, handleSubmit } = methods;

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
            if (response.data.length > 0 && !selectedEvent) {
                setSelectedEvent(response.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEvent) {
            reset({
                availability: selectedEvent.availability || {
                    rollingWindow: 60,
                    weeklySchedule: [
                        { day: 'monday', isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
                        { day: 'tuesday', isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
                        { day: 'wednesday', isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
                        { day: 'thursday', isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
                        { day: 'friday', isAvailable: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
                        { day: 'saturday', isAvailable: false, slots: [] },
                        { day: 'sunday', isAvailable: false, slots: [] },
                    ],
                }
            });
        }
    }, [selectedEvent, reset]);

    const onSubmit: SubmitHandler<any> = async (data) => {
        if (!selectedEvent) return;
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await api.patch(`/events/${selectedEvent._id}`, { availability: data.availability });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            // Update local state
            setEvents(events.map(e => e._id === selectedEvent._id ? { ...e, availability: data.availability } : e));
        } catch (err) {
            console.error('Failed to update availability:', err);
            setError('Failed to save availability');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006bff]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Availability</h1>

                {/* Tabs Emulator */}
                <div className="flex items-center gap-8 mt-6 border-b border-gray-100">
                    <button className="px-1 py-4 text-sm font-bold text-[#006bff] border-b-2 border-[#006bff]">Schedules</button>
                    <button className="px-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Calendar settings</button>
                    <button className="px-1 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Advanced settings</button>
                </div>
            </div>

            <div className="flex gap-8 items-start">
                {/* Left Sidebar: Event List */}
                <div className="w-80 shrink-0 space-y-2">
                    <h3 className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Event Types</h3>
                    {events.map((event) => (
                        <button
                            key={event._id}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all ${selectedEvent?._id === event._id
                                ? 'bg-blue-50 text-[#006bff] shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${selectedEvent?._id === event._id ? 'bg-[#006bff]' : 'bg-gray-300'}`} />
                                <span className="text-sm font-bold truncate max-w-[180px]">{event.name}</span>
                            </div>
                            <ChevronRight size={16} className={selectedEvent?._id === event._id ? 'opacity-100' : 'opacity-0'} />
                        </button>
                    ))}
                    {events.length === 0 && (
                        <p className="px-3 text-sm text-gray-400 italic">No event types found.</p>
                    )}
                </div>

                {/* Right Content: Availability Editor */}
                <div className="flex-1 min-w-0">
                    {selectedEvent ? (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <Clock size={20} className="text-[#006bff]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">Weekly hours</h2>
                                        <p className="text-xs text-gray-500">Set when you are typically available for <span className="text-gray-900 font-bold">{selectedEvent.name}</span></p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    loading={saving}
                                    className="px-6"
                                >
                                    {success ? <><Check size={18} className="mr-2" /> Saved</> : 'Save Changes'}
                                </Button>
                            </div>

                            <div className="p-8">
                                <FormProvider {...methods}>
                                    <form className="space-y-8">
                                        <AvailabilityDetails namePrefix="availability" />

                                        <div className="pt-8 border-t border-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                                                        <CalendarIcon size={20} className="text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">Date-specific hours</h2>
                                                        <p className="text-xs text-gray-500">Adjust hours for specific days</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                    <Plus size={16} />
                                                    Add date-specific hours
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </FormProvider>
                            </div>

                            {error && (
                                <div className="mx-8 mb-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}
                        </div>
                    ) : !loading && (
                        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#006bff]">
                                <CalendarIcon size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select an event</h2>
                            <p className="text-gray-500 max-w-sm mx-auto">Choose an event type from the left to manage its specific availability hours.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
