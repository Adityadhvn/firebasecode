import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Event } from "@shared/schema";

export default function Events() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Filter events based on search query
  const filteredEvents = events?.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10">
        <h1 className="font-display font-bold text-2xl text-white mb-4">
          Events
        </h1>

        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              className="pl-10 bg-neutral-800 border-0 text-white rounded-xl h-12"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="bg-neutral-800 border-0 h-12 w-12 rounded-xl"
          >
            <Filter className="h-5 w-5 text-neutral-300" />
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4">
        <div className="mb-6">
          <h2 className="font-display font-semibold text-xl text-white mb-4">
            Upcoming Events
          </h2>

          {isLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : filteredEvents && filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onGetTickets={() => navigate(`/ticket/purchase/${event.id}`)}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-400">No events found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onGetTickets: () => void;
  onClick: () => void;
}

function EventCard({ event, onGetTickets, onClick }: EventCardProps) {
  const handleClick = () => {
    onClick();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGetTickets();
  };

  return (
    <div
      className="bg-neutral-800 rounded-xl p-4 mb-4 flex cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={event.imageUrl}
        alt={event.title}
        className="h-24 w-24 rounded-lg object-cover"
      />
      <div className="ml-4 flex-1">
        <h3 className="font-display font-semibold text-white">{event.title}</h3>
        <div className="flex items-center mt-1 text-sm text-neutral-400">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{format(new Date(event.date), "MMMM d, h:mm a")}</span>
        </div>
        <div className="flex items-center mt-1 text-sm text-neutral-400">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{event.location}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-white font-medium">From $25.00</span>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary-light text-white text-sm py-1 px-4 rounded-full font-medium transition-colors h-8"
            onClick={handleButtonClick}
          >
            Get Tickets
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 mb-4 flex items-center">
      <Skeleton className="h-24 w-24 rounded-lg object-cover" />
      <Skeleton className="h-24 w-24 rounded-lg" />
      <div className="ml-4 flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
