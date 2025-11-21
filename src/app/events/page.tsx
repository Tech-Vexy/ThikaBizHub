"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  title: string;
  description: string;
  businessId: string;
  businessName: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  attendees?: number;
  isPaid: boolean;
  price?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsRef = collection(db, 'events');
      let q;

      if (filter === 'upcoming') {
        q = query(
          eventsRef,
          where('eventDate', '>=', new Date().toISOString().split('T')[0]),
          orderBy('eventDate', 'asc')
        );
      } else if (filter === 'past') {
        q = query(
          eventsRef,
          where('eventDate', '<', new Date().toISOString().split('T')[0]),
          orderBy('eventDate', 'desc')
        );
      } else {
        q = query(eventsRef, orderBy('eventDate', 'desc'));
      }

      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];

      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Calendar className="h-10 w-10 text-purple-600" />
          Community Events
        </h1>
        <p className="text-gray-600">Discover local events and gatherings in Thika</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'upcoming' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'past' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Past Events
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Events
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No events found</h3>
          <p className="text-gray-500">Check back later for upcoming events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {event.imageUrl && (
                <div className="h-48 bg-gray-200">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold mb-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(event.eventDate)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  {event.attendees && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees} attending</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {event.isPaid ? (
                    <span className="text-green-600 font-bold">KES {event.price}</span>
                  ) : (
                    <span className="text-gray-500 font-medium">Free Event</span>
                  )}
                  <Link
                    href={`/events/${event.id}`}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
