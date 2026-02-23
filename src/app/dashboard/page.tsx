'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import EventCard from '@/components/events/EventCard';
import CreateEventModal from '@/components/events/CreateEventModal';
import { Plus } from 'lucide-react';

interface EventType {
    _id: string;
    name: string;
    duration: number;
    locationType: 'google_meet' | 'zoom' | 'phone' | 'custom';
    locationDetails?: string;
    description?: string;
    isActive: boolean;
    availability?: {
        rollingWindow: number;
        weeklySchedule: any[];
    };
}

export default function DashboardPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<EventType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleEditEvent = (event: EventType) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleCreateEvent = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Event Types</h1>
                    <p className="text-gray-500 mt-1">Manage your scheduling endpoints</p>
                </div>
                <Button onClick={handleCreateEvent} className="flex items-center gap-2">
                    <Plus size={20} />
                    Create Event Type
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bff]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((event) => (
                        <EventCard
                            key={event._id}
                            event={event}
                            onEdit={handleEditEvent}
                            onRefresh={fetchEvents}
                        />
                    ))}

                    <button
                        onClick={handleCreateEvent}
                        className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[#006bff] hover:border-[#006bff] transition-all group min-h-[280px]"
                    >
                        <div className="p-3 bg-gray-50 group-hover:bg-blue-50 rounded-full transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="font-semibold text-gray-500 group-hover:text-[#006bff]">Create new event type</span>
                    </button>
                </div>
            )}

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchEvents}
                editingEvent={editingEvent}
            />
        </>
    );
}
