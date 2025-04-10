import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Ticket, Event, TicketType } from "@shared/schema";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Ticket as TicketIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

export default function Tickets() {
  const [, navigate] = useLocation();

  // In a real app, we would get the current user ID from auth context
  const userId = 1;

  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/user/${userId}`],
  });

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10">
        <h1 className="font-display font-bold text-2xl text-white mb-4">
          My Tickets
        </h1>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-neutral-800 p-1 rounded-xl h-12">
            <TabsTrigger
              value="upcoming"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <div className="mt-4">
              {ticketsLoading ? (
                <>
                  <TicketCardSkeleton />
                  <TicketCardSkeleton />
                  <TicketCardSkeleton />
                </>
              ) : tickets && tickets.length > 0 ? (
                tickets
                  .filter(
                    (ticket) => new Date(ticket.purchaseDate) > new Date(),
                  )
                  .map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() =>
                        navigate(
                          `/ticket/confirmation/${ticket.referenceNumber}`,
                        )
                      }
                    />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <TicketIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">
                    No Upcoming Tickets
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    You don't have any upcoming events.
                  </p>
                  <Button
                    className="bg-primary text-white rounded-full px-6"
                    onClick={() => navigate("/")}
                  >
                    Discover Events
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="mt-4">
              {ticketsLoading ? (
                <>
                  <TicketCardSkeleton />
                  <TicketCardSkeleton />
                </>
              ) : tickets && tickets.length > 0 ? (
                tickets
                  .filter(
                    (ticket) => new Date(ticket.purchaseDate) <= new Date(),
                  )
                  .map((ticket) => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      isPast={true}
                      onClick={() =>
                        navigate(
                          `/ticket/confirmation/${ticket.referenceNumber}`,
                        )
                      }
                    />
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                    <TicketIcon className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2">
                    No Past Tickets
                  </h3>
                  <p className="text-neutral-400 mb-6">
                    You haven't attended any events yet.
                  </p>
                  <Button
                    className="bg-primary text-white rounded-full px-6"
                    onClick={() => navigate("/")}
                  >
                    Discover Events
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </header>

      <main className="flex-1 px-4">
        {/* This section is intentionally left empty as the content is rendered in TabsContent */}
      </main>
    </div>
  );
}

interface TicketCardProps {
  ticket: Ticket;
  isPast?: boolean;
  onClick: () => void;
}

function TicketCard({ ticket, isPast = false, onClick }: TicketCardProps) {
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${ticket.eventId}`],
  });

  const { data: ticketType } = useQuery<TicketType>({
    queryKey: [`/api/ticket-types/${ticket.ticketTypeId}`],
  });

  if (!event || !ticketType) {
    return <TicketCardSkeleton />;
  }

  return (
    <div
      className={`bg-neutral-800 rounded-xl overflow-hidden mb-4 cursor-pointer ${isPast ? "opacity-70" : ""}`}
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-semibold text-white">
            {event.title}
          </h3>
          <div className="flex items-center mt-1 text-sm text-neutral-300">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(new Date(event.date), "MMMM d, yyyy • h:mm a")}</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-neutral-400 text-sm">Ticket Type</p>
          <p className="text-white font-medium">{ticketType.name}</p>
        </div>

        {isPast ? (
          <div className="px-3 py-1 rounded-full bg-neutral-700 text-neutral-300 text-xs">
            Attended
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-secondary flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Ticket
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

function TicketCardSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-xl overflow-hidden mb-4">
      <div className="relative">
        <Skeleton className="w-full h-32" />
      </div>

      <div className="p-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-5 w-32" />
        </div>

        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}
