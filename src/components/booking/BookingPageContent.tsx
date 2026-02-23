'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface BookingPageContentProps {
    event: any;
}

export default function BookingPageContent({ event }: BookingPageContentProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [step, setStep] = useState<'date' | 'slot' | 'details' | 'success'>('date');

    // Visitor details
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedDate) {
            fetchSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchSlots = async (date: Date) => {
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await api.get(`/bookings/slots/${event._id}?date=${dateStr}`);
            setAvailableSlots(response.data);
            setStep('slot');
        } catch (err) {
            console.error('Error fetching slots:', err);
            setError('Failed to load available slots');
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedSlot) return;

        setBookingLoading(true);
        setError(null);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            await api.post('/bookings', {
                eventId: event._id,
                visitorName: name,
                visitorEmail: email,
                date: dateStr,
                startTime: selectedSlot.startTime,
                endTime: selectedSlot.endTime
            });
            setStep('success');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-xl max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                        <p className="text-gray-500">You're all set. A calendar invitation has been sent to your email.</p>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Event Details</p>
                        <h3 className="font-bold text-gray-900">{event.name}</h3>
                        <p className="text-gray-600">
                            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-[#006bff] font-bold">{selectedSlot?.startTime} - {selectedSlot?.endTime}</p>
                    </div>
                    <Button fullWidth onClick={() => window.location.reload()}>
                        Book another
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-4 md:p-8">
            <div className="bg-white w-full max-w-5xl rounded-2xl border border-gray-100 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Left Sidebar: Event Info */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 p-8 space-y-8 bg-gray-50/20">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Host Name</h3>
                        <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-600 font-medium">
                            <Clock size={20} className="text-gray-400" />
                            <span>{event.duration} min</span>
                        </div>
                        {event.locationType && (
                            <div className="flex items-center gap-3 text-gray-600 font-medium">
                                <MapPin size={20} className="text-gray-400" />
                                <span className="capitalize">{event.locationType.replace('_', ' ')}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-500 leading-relaxed">
                        {event.description || 'Welcome! Please select a day and time that works best for you.'}
                    </p>
                </div>

                {/* Right Area: Scheduling Logic */}
                <div className="flex-1 flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            {step === 'date' && 'Select a Date'}
                            {step === 'slot' && 'Select a Time'}
                            {step === 'details' && 'Enter Your Details'}
                        </h2>
                        {step !== 'date' && (
                            <button
                                onClick={() => setStep(step === 'details' ? 'slot' : 'date')}
                                className="flex items-center gap-1 text-sm font-bold text-[#006bff] hover:underline"
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>
                        )}
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto">
                        {step === 'date' && (
                            <CalendarView onSelect={setSelectedDate} />
                        )}

                        {step === 'slot' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-gray-900 font-bold mb-1">
                                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <p className="text-sm text-gray-500">All times are in your local timezone</p>
                                </div>

                                {loadingSlots ? (
                                    <div className="flex flex-col items-center py-12 gap-3 text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006bff]"></div>
                                        <span className="text-sm font-bold animate-pulse">Checking availability...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {availableSlots.map((slot, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedSlot(slot);
                                                    setStep('details');
                                                }}
                                                className="px-4 py-3 rounded-xl border-2 border-gray-100 font-bold text-gray-700 hover:border-[#006bff] hover:text-[#006bff] transition-all"
                                            >
                                                {slot.startTime}
                                            </button>
                                        ))}
                                        {availableSlots.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-gray-400 font-medium italic">
                                                No available slots for this date.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 'details' && (
                            <form onSubmit={handleBooking} className="max-w-md mx-auto space-y-6">
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
                                    <p className="text-sm font-bold text-blue-900 mb-1">Your Selection:</p>
                                    <p className="text-sm text-blue-700 font-medium">
                                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot?.startTime}
                                    </p>
                                </div>

                                <Input
                                    label="Your Name"
                                    placeholder="Jane Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <Button type="submit" fullWidth loading={bookingLoading}>
                                    Confirm Booking
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Calendar component
function CalendarView({ onSelect }: { onSelect: (date: Date) => void }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => setCurrentDate(new Date(year, month - 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-bold text-gray-900">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                    onClick={() => setCurrentDate(new Date(year, month + 1))}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors rotate-180"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-2">
                        {day}
                    </div>
                ))}

                {blanks.map(b => <div key={`blank-${b}`} />)}

                {days.map(day => {
                    const date = new Date(year, month, day);
                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                        <button
                            key={day}
                            disabled={isPast}
                            onClick={() => onSelect(date)}
                            className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all ${isPast
                                    ? 'text-gray-200 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-[#006bff] active:scale-90 border border-transparent hover:border-blue-100'
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-50 border border-blue-100" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selected</span>
                </div>
            </div>
        </div>
    );
}
