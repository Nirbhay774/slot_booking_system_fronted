'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Calendar } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AvailabilityDetails from './AvailabilityDetails';
import api from '@/lib/axios';

const slotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
}).refine(data => {
    const start = data.startTime.split(':').map(Number);
    const end = data.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
}, {
    message: "End time must be after start time",
    path: ["endTime"]
});

const dayScheduleSchema = z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isAvailable: z.boolean(),
    slots: z.array(slotSchema),
});

const eventSchema = z.object({
    name: z.string().min(3, 'Event name must be at least 3 characters'),
    duration: z.preprocess((val) => Number(val), z.number().refine(val => [15, 30, 60].includes(val), {
        message: 'Duration must be 15, 30, or 60 minutes',
    })),
    locationType: z.enum(['google_meet', 'zoom', 'phone', 'custom']),
    locationDetails: z.string().optional(),
    description: z.string().optional(),
    scheduleId: z.string().optional(),
    availability: z.object({
        rollingWindow: z.number().default(60),
        weeklySchedule: z.array(dayScheduleSchema),
    }),
});

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingEvent?: any;
}

export default function CreateEventModal({ isOpen, onClose, onSuccess, editingEvent }: CreateEventModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [useCustomAvailability, setUseCustomAvailability] = useState(true);

    const methods = useForm<any>({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            duration: 30,
            locationType: 'google_meet',
            availability: {
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
            },
        }
    });

    const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = methods;
    const selectedScheduleId = watch('scheduleId');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, schedulesRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/schedules')
                ]);

                setSchedules(schedulesRes.data);
                const defaultAvail = profileRes.data.defaultAvailability;

                if (editingEvent) {
                    setUseCustomAvailability(!editingEvent.scheduleId);
                    reset({
                        name: editingEvent.name,
                        duration: editingEvent.duration,
                        locationType: editingEvent.locationType,
                        locationDetails: editingEvent.locationDetails || '',
                        description: editingEvent.description || '',
                        scheduleId: editingEvent.scheduleId || '',
                        availability: editingEvent.availability || {
                            rollingWindow: 60,
                            weeklySchedule: [],
                        },
                    });
                } else if (isOpen) {
                    // Default to the user's default schedule if it exists
                    const defaultSchedule = schedulesRes.data.find((s: any) => s.isDefault);
                    if (defaultSchedule) {
                        setUseCustomAvailability(false);
                        reset({
                            name: '',
                            duration: 30,
                            locationType: 'google_meet',
                            locationDetails: '',
                            description: '',
                            scheduleId: defaultSchedule._id,
                            availability: defaultSchedule.availability,
                        });
                    } else {
                        setUseCustomAvailability(true);
                        reset({
                            name: '',
                            duration: 30,
                            locationType: 'google_meet',
                            locationDetails: '',
                            description: '',
                            availability: (defaultAvail && defaultAvail.weeklySchedule?.length > 0)
                                ? defaultAvail
                                : {
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
                                },
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        if (isOpen) fetchData();
    }, [editingEvent, reset, isOpen]);

    // Update availability when scheduleId changes
    useEffect(() => {
        if (selectedScheduleId && !useCustomAvailability) {
            const schedule = schedules.find(s => s._id === selectedScheduleId);
            if (schedule) {
                setValue('availability', schedule.availability);
            }
        }
    }, [selectedScheduleId, schedules, setValue, useCustomAvailability]);

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<any> = async (data) => {
        setLoading(true);
        setError(null);
        // If not using custom availability, clear the scheduleId if it's "custom"
        const submissionData = { ...data };
        if (useCustomAvailability) {
            submissionData.scheduleId = null;
        }

        try {
            if (editingEvent) {
                await api.patch(`/events/${editingEvent._id}`, submissionData);
            } else {
                await api.post('/events', submissionData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${editingEvent ? 'update' : 'create'} event`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">{editingEvent ? 'Edit Event Type' : 'New Event Type'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Basic Info</h3>
                                <div className="space-y-4">
                                    <Input
                                        label="Event Name"
                                        placeholder="e.g. 15 Minute Meeting"
                                        {...register('name')}
                                        error={errors.name?.message as string}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1 w-full">
                                            <label className="text-sm font-bold text-gray-700">Duration</label>
                                            <select
                                                {...register('duration')}
                                                className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#006bff] transition-all duration-200"
                                            >
                                                <option value={15}>15 min</option>
                                                <option value={30}>30 min</option>
                                                <option value={60}>60 min</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1 w-full">
                                            <label className="text-sm font-bold text-gray-700">Location</label>
                                            <select
                                                {...register('locationType')}
                                                className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#006bff] transition-all duration-200"
                                            >
                                                <option value="google_meet">Google Meet</option>
                                                <option value="zoom">Zoom</option>
                                                <option value="phone">Phone Call</option>
                                                <option value="custom">Custom Location</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Input
                                        label="Location Details (Optional)"
                                        placeholder="Link or address"
                                        {...register('locationDetails')}
                                        error={errors.locationDetails?.message as string}
                                    />

                                    <div className="flex flex-col gap-1 w-full">
                                        <label className="text-sm font-bold text-gray-700">Description (Optional)</label>
                                        <textarea
                                            {...register('description')}
                                            rows={3}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#006bff] transition-all duration-200"
                                            placeholder="Tell your invitees a little about this event"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Availability</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUseCustomAvailability(!useCustomAvailability)}
                                            className="text-xs font-bold text-[#006bff] hover:underline"
                                        >
                                            {useCustomAvailability ? 'Use a saved schedule' : 'Set custom hours'}
                                        </button>
                                    </div>
                                </div>

                                {!useCustomAvailability ? (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <label className="text-sm font-bold text-blue-900 mb-2 block">Select Schedule</label>
                                            <select
                                                {...register('scheduleId')}
                                                className="w-full px-4 py-3 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            >
                                                <option value="">Select a schedule...</option>
                                                {schedules.map(s => (
                                                    <option key={s._id} value={s._id}>{s.name} {s.isDefault ? '(Default)' : ''}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-blue-600 mt-2">
                                                This event will use the settings from the selected schedule.
                                            </p>
                                        </div>

                                        {/* Show preview of the schedule */}
                                        {selectedScheduleId && (
                                            <div className="opacity-60 pointer-events-none">
                                                <AvailabilityDetails />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <AvailabilityDetails />
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 flex gap-3">
                            <Button type="button" variant="outline" fullWidth onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" fullWidth loading={loading}>
                                {editingEvent ? 'Save Changes' : 'Create Event Type'}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
