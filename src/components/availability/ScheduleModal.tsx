'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AvailabilityDetails from '@/components/events/AvailabilityDetails';
import api from '@/lib/axios';

const slotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
});

const dayScheduleSchema = z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isAvailable: z.boolean(),
    slots: z.array(slotSchema),
});

const scheduleSchema = z.object({
    name: z.string().min(1, 'Schedule name is required'),
    isDefault: z.boolean().default(false),
    availability: z.object({
        rollingWindow: z.number().default(60),
        weeklySchedule: z.array(dayScheduleSchema),
    }),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingSchedule?: any;
}

export default function ScheduleModal({ isOpen, onClose, onSuccess, editingSchedule }: ScheduleModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const methods = useForm<any>({
        resolver: zodResolver(scheduleSchema),
        defaultValues: {
            name: '',
            isDefault: false,
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

    const { register, handleSubmit, reset, formState: { errors } } = methods;

    useEffect(() => {
        if (editingSchedule) {
            reset({
                name: editingSchedule.name,
                isDefault: editingSchedule.isDefault,
                availability: editingSchedule.availability,
            });
        } else {
            reset({
                name: '',
                isDefault: false,
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
            });
        }
    }, [editingSchedule, reset]);

    if (!isOpen) return null;

    const onSubmit: SubmitHandler<any> = async (data) => {
        setLoading(true);
        setError(null);
        try {
            if (editingSchedule) {
                await api.patch(`/schedules/${editingSchedule._id}`, data);
            } else {
                await api.post('/schedules', data);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${editingSchedule ? 'update' : 'create'} schedule`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">{editingSchedule ? 'Edit Schedule' : 'New Schedule'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)]">
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Schedule Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <Input
                                    label="Schedule Name"
                                    placeholder="e.g. Working Hours"
                                    {...register('name')}
                                    error={errors.name?.message as string}
                                />
                                <div className="flex items-center gap-3 pb-3">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        {...register('isDefault')}
                                        className="w-5 h-5 rounded border-gray-300 text-[#006bff] focus:ring-[#006bff] cursor-pointer"
                                    />
                                    <label htmlFor="isDefault" className="text-sm font-bold text-gray-700 cursor-pointer">
                                        Set as default schedule
                                    </label>
                                </div>
                            </div>
                        </div>

                        <AvailabilityDetails namePrefix="availability" />

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
                                {editingSchedule ? 'Save Changes' : 'Create Schedule'}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
