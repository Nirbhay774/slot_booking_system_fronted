'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import BookingPageContent from '@/components/booking/BookingPageContent';

export default function BookingPage() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await api.get(`/bookings/event/${eventId}`);
                setEvent(response.data);
            } catch (err: any) {
                console.error('Error fetching event:', err);
                setError(err.response?.status === 404 ? 'Booking link not found' : 'Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEvent();
        }
    }, [eventId]);

    useEffect(() => {
        if (event) {
            document.title = `${event.name} | Calendly`;
        }
    }, [event]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bff]"></div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl max-w-md w-full text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Event Not Found</h2>
                    <p className="text-gray-500 mb-8">{error || 'This booking link is invalid or has expired.'}</p>
                    <a href="/" className="inline-block px-6 py-3 bg-[#006bff] text-white font-bold rounded-full hover:bg-[#0052cc] transition-colors">
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return <BookingPageContent event={event} />;
}
