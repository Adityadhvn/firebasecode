import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { X, Share, InfoIcon, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, Event, TicketType } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect, useState } from "react";
import TicketQRCode from "./TicketQrCode";


export default function TicketConfirmation() {
  const { referenceNumber } = useParams<{ referenceNumber: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();


  // Use React Query to fetch the ticket with the given reference number
  const { 
    data: ticket, 
    isLoading: ticketLoading, 
    isError: ticketError 
  } = useQuery<Ticket>({
    queryKey: [`/api/tickets/reference/${referenceNumber}`],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/reference/${referenceNumber}`);
      if (!res.ok) throw new Error("Ticket not found");
      return res.json();
    },
    gcTime: 0,
    retry: 3
  });

  // Show toast for ticket errors
  React.useEffect(() => {
    if (ticketError) {
      console.error("Error fetching ticket data for reference:", referenceNumber);
      toast({
        title: "Error",
        description: "Could not load ticket information. Please try again.",
        variant: "destructive",
      });
    }
  }, [ticketError, referenceNumber, toast]);

  // If we have a ticket, fetch the event details
  const { 
    data: event, 
    isLoading: eventLoading, 
    isError: eventError 
  } = useQuery<Event>({
    queryKey: ticket?.eventId ? [`/api/events/${ticket.eventId}`] : ['noQuery'],
    queryFn: async () => {
      const res = await fetch(`/api/events/${ticket!.eventId}`);
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    },
    enabled: !!ticket?.eventId,
    gcTime: 0
  });
  

  // If we have a ticket, fetch the ticket type details
  const { 
    data: ticketType,
    isLoading: ticketTypeLoading, 
    isError: ticketTypeError 
  } = useQuery<TicketType>({
    queryKey: ticket?.ticketTypeId ? [`/api/ticket-types/${ticket.ticketTypeId}`] : ['noQuery'],
    queryFn: async () => {
      const res = await fetch(`/api/ticket-types/${ticket!.ticketTypeId}`);
      if (!res.ok) throw new Error("Ticket type not found");
      return res.json();
    },
    enabled: !!ticket?.ticketTypeId,
    gcTime: 0
  });
  

  const handleCloseClick = () => {
    navigate("/tickets");
  };

  if (ticketLoading || (ticket && (eventLoading || ticketTypeLoading))) {
    return <TicketConfirmationSkeleton />;
  }

  console.log("TICKET:", ticket);
  console.log("EVENT:", event);
  console.log("TICKET TYPE:", ticketType);
  
  if (!ticket || !event || !ticketType) {
    console.error("Something is missing:", {
      ticketMissing: !ticket,
      eventMissing: !event,
      ticketTypeMissing: !ticketType,
    });
  }
  // Show error screen with helpful message and return button
  if (ticketError || !ticket || (ticket && (eventError || !event || ticketTypeError || !ticketType))) {
    return (
      <div className="h-full flex flex-col bg-neutral-900 p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4">
            <X className="text-white h-8 w-8" />
          </div>
          <h2 className="font-display font-semibold text-2xl text-white mb-2">Ticket Not Found</h2>
          <p className="text-neutral-400 text-center mb-8">
            We couldn't find this ticket. It may have been deleted or the reference number is incorrect.
          </p>
          <Button 
            onClick={() => navigate("/tickets")}
            className="bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Go to My Tickets
          </Button>
        </div>
      </div>
    );
  }
  console.log("ticketError:", ticketError);
  console.log("ticket:", ticket);
  console.log("eventError:", eventError);
  console.log("event:", event);
  console.log("ticketTypeError:", ticketTypeError);
  console.log("ticketType:", ticketType);
  

  // Safety check - we should have ticket, event, and ticketType at this point
  // but let's double check to prevent runtime errors
  if (!ticket || !event || !ticketType) {
    return (
      <div className="h-full flex flex-col bg-neutral-900 p-4">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-4">
            <X className="text-white h-8 w-8" />
          </div>
          <h2 className="font-display font-semibold text-xl text-white mb-2">Data Loading Error</h2>
          <p className="text-neutral-400 text-center mb-8">
            There was a problem loading this ticket information. Please try again.
          </p>
          <Button 
            onClick={() => navigate("/tickets")}
            className="bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Go to My Tickets
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div className="h-full flex flex-col">
      <header className="px-4 pt-12 pb-4 bg-neutral-900">
        <div className="flex justify-between items-center">
          <Button 
            size="icon"
            variant="outline"
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border-0"
            onClick={handleCloseClick}
          >
            <X className="text-white h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-white">Ticket Confirmed</h1>
          <Button 
            size="icon"
            variant="outline"
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border-0"
          >
            <Share className="text-white h-5 w-5" />
          </Button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Success Animation */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#00C853] flex items-center justify-center mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="font-display font-semibold text-xl text-white">Payment Successful!</h2>
          <p className="text-neutral-400 text-center mt-1">Your ticket has been confirmed and is ready to use.</p>
        </div>
        
        {/* QR Code Ticket */}
        <div className="bg-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4">
            <h3 className="font-display font-semibold text-white">{event.title}</h3>
            <p className="text-neutral-400 text-sm">
              {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
            </p>
            <p className="text-neutral-400 text-sm">{event.location}, {event.address}</p>
          </div>
          
          <div className="bg-white p-6 flex flex-col items-center justify-center">
            <div className="w-48 h-48 border-2 border-neutral-800 relative flex flex-col items-center justify-center">
            {ticket?.referenceNumber && (
  <TicketQRCode referenceNumber={ticket.referenceNumber} />
)}
              <div className="text-neutral-800 text-sm font-bold font-mono tracking-wider">
                {ticket.referenceNumber}
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-neutral-800"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-neutral-800"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-neutral-800"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-neutral-800"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-neutral-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-400">Ticket Type</span>
              <span className="text-white font-medium">{ticketType.name}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-neutral-400">Ticket Number</span>
              <span className="text-white font-medium">#{ticket.referenceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Purchased On</span>
              <span className="text-white font-medium">
                {format(new Date(ticket.purchaseDate), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 bg-neutral-800 rounded-xl p-4">
          <h3 className="font-medium text-white mb-2">Important Information</h3>
          <ul className="text-neutral-300 text-sm space-y-2">
            <li className="flex">
              <InfoIcon className="h-4 w-4 mr-2 text-secondary mt-1 flex-shrink-0" />
              <span>Present this QR code at the entrance for quick check-in.</span>
            </li>
            <li className="flex">
              <InfoIcon className="h-4 w-4 mr-2 text-secondary mt-1 flex-shrink-0" />
              <span>Doors open at {format(new Date(event.date), 'h:mm a').replace(/\d+/, (m) => String(parseInt(m) - 1))}. Please arrive early to avoid queues.</span>
            </li>
            <li className="flex">
              <InfoIcon className="h-4 w-4 mr-2 text-secondary mt-1 flex-shrink-0" />
              <span>This ticket is non-refundable and non-transferable.</span>
            </li>
          </ul>
        </div>
        
        {/* Save to wallet button */}
        <Button 
          variant="outline"
          className="mt-6 w-full bg-neutral-800 text-white font-medium py-3 rounded-xl mb-6 flex items-center justify-center border-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          Save To Device
        </Button>
      </div>
    </div>
  );
}

function TicketConfirmationSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <header className="px-4 pt-12 pb-4 bg-neutral-900">
        <div className="flex justify-between items-center">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-7 w-44" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {/* Success Animation */}
        <div className="flex flex-col items-center justify-center py-6">
          <Skeleton className="w-16 h-16 rounded-full mb-3" />
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-64 text-center" />
        </div>
        
        {/* QR Code Ticket */}
        <div className="bg-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-6 w-4/5 mb-1" />
            <Skeleton className="h-4 w-2/3 mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div className="bg-gray-100 p-6 flex justify-center">
            <Skeleton className="w-48 h-48" />
          </div>
          
          <div className="p-4 border-t border-neutral-700">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-6 bg-neutral-800 rounded-xl p-4">
          <Skeleton className="h-5 w-44 mb-2" />
          <div className="space-y-3">
            <div className="flex">
              <Skeleton className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex">
              <Skeleton className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex">
              <Skeleton className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
        
        {/* Save to Device button */}
        <Skeleton className="mt-6 h-12 w-full rounded-xl mb-6" />
      </div>
    </div>
  );
}

