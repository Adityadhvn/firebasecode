import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Event, TicketType, InsertTicket } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TicketPurchase() {
  const { eventId } = useParams<{ eventId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });

  const { data: ticketTypes, isLoading: ticketTypesLoading } = useQuery<TicketType[]>({
    queryKey: [`/api/events/${eventId}/ticket-types`],
  });

  const purchaseTicketMutation = useMutation({
    mutationFn: async (ticketData: Omit<InsertTicket, "referenceNumber">) => {
      const response = await apiRequest("POST", "/api/tickets", ticketData);
      return response.json();
    },
    onSuccess: (data) => {
      // Navigate to confirmation page with the reference number
      navigate(`/ticket/confirmation/${data.referenceNumber}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to purchase tickets. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBackClick = () => {
    navigate(`/event/${eventId}`);
  };

  const increaseTicketCount = (ticketTypeId: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: (prev[ticketTypeId] || 0) + 1
    }));
  };

  const decreaseTicketCount = (ticketTypeId: number) => {
    if (!selectedTickets[ticketTypeId] || selectedTickets[ticketTypeId] <= 0) return;
    
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: prev[ticketTypeId] - 1
    }));
  };

  const calculateSubtotal = () => {
    if (!ticketTypes) return 0;
    
    return ticketTypes.reduce((sum, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return sum + (parseFloat(ticket.price) * quantity);
    }, 0);
  };

  const calculateServiceFee = () => {
    return calculateSubtotal() * 0.1; // 10% service fee
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.07; // 7% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateServiceFee() + calculateTax();
  };

  const handleCheckout = () => {
    if (!event) return;
    
    // Check if at least one ticket is selected
    const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalTickets === 0) {
      toast({
        title: "No tickets selected",
        description: "Please select at least one ticket to continue.",
        variant: "destructive",
      });
      return;
    }

    // Get the first selected ticket type for simplicity (in a real app, we'd handle multiple)
    const selectedTicketTypeId = Object.entries(selectedTickets).find(([_, qty]) => qty > 0)?.[0];
    if (!selectedTicketTypeId) return;
    
    // Prepare payment details (auto-approved for demo)
    const paymentDetails = {
      method: "Automatic Payment",
      subtotal: calculateSubtotal().toFixed(2),
      serviceFee: calculateServiceFee().toFixed(2),
      tax: calculateTax().toFixed(2),
      status: "approved"
    };

    // Create the ticket
    purchaseTicketMutation.mutate({
      userId: 1, // In a real app, this would be the logged-in user ID
      eventId: parseInt(eventId),
      ticketTypeId: parseInt(selectedTicketTypeId),
      quantity: selectedTickets[parseInt(selectedTicketTypeId)],
      totalPrice: calculateTotal().toFixed(2),
      paymentDetails
    });
  };

  if (eventLoading || ticketTypesLoading) {
    return <TicketPurchaseSkeleton />;
  }

  if (!event || !ticketTypes) {
    return <div className="flex-1 p-4">Event not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 flex items-center">
        <Button 
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-4 border-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="text-white h-5 w-5" />
        </Button>
        <h1 className="font-display font-bold text-xl text-white">Get Tickets</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Event Summary */}
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="ml-3">
              <h3 className="font-display font-semibold text-white">{event.title}</h3>
              <p className="text-neutral-400 text-sm">{format(new Date(event.date), 'MMMM d, h:mm a')}</p>
              <p className="text-neutral-400 text-sm">{event.location}</p>
            </div>
          </div>
        </div>
        
        {/* Ticket Options */}
        <h2 className="font-display font-semibold text-lg text-white mb-3">Select Tickets</h2>
        
        <div className="space-y-4">
          {ticketTypes.map((ticketType) => (
            <div key={ticketType.id} className="bg-neutral-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-white">{ticketType.name}</h3>
                  <p className="text-neutral-400 text-sm">{ticketType.description}</p>
                  <p className="text-secondary mt-1 font-medium">${ticketType.price}</p>
                </div>
                <div className="flex items-center">
                  <Button 
                    size="icon"
                    variant="outline"
                    className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-white border-0"
                    onClick={() => decreaseTicketCount(ticketType.id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-4 text-white">{selectedTickets[ticketType.id] || 0}</span>
                  <Button 
                    size="icon"
                    className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white"
                    onClick={() => increaseTicketCount(ticketType.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        

        
        {/* Order Summary */}
        <h2 className="font-display font-semibold text-lg text-white mt-8 mb-3">Order Summary</h2>
        
        <div className="bg-neutral-800 rounded-xl p-4">
          <div className="space-y-2">
            {ticketTypes.map((ticketType) => {
              const quantity = selectedTickets[ticketType.id] || 0;
              if (quantity === 0) return null;
              
              return (
                <div key={ticketType.id} className="flex justify-between">
                  <span className="text-neutral-300">{quantity}x {ticketType.name}</span>
                  <span className="text-white">${(parseFloat(ticketType.price) * quantity).toFixed(2)}</span>
                </div>
              );
            })}
            
            <div className="flex justify-between">
              <span className="text-neutral-300">Service Fee</span>
              <span className="text-white">${calculateServiceFee().toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-neutral-300">Tax</span>
              <span className="text-white">${calculateTax().toFixed(2)}</span>
            </div>
            
            <div className="border-t border-neutral-700 my-2 pt-2 flex justify-between">
              <span className="font-medium text-white">Total</span>
              <span className="font-medium text-white">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 max-w-md mx-auto z-10 mb-16">
        <Button 
          className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 rounded-xl transition-colors"
          onClick={handleCheckout}
          disabled={purchaseTicketMutation.isPending}
        >
          {purchaseTicketMutation.isPending ? 
            "Processing..." : 
            `Checkout - $${calculateTotal().toFixed(2)}`
          }
        </Button>
      </div>
    </div>
  );
}

function TicketPurchaseSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 flex items-center">
        <Skeleton className="w-10 h-10 rounded-full mr-4" />
        <Skeleton className="h-8 w-36" />
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {/* Event Summary */}
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-5 w-4/5 mb-1" />
              <Skeleton className="h-4 w-1/2 mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
        
        {/* Ticket Options */}
        <Skeleton className="h-7 w-40 mb-3" />
        
        <div className="space-y-4">
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-5 w-36 mb-1" />
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-5 w-16 mt-1" />
              </div>
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 mx-4" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-56 mb-1" />
                <Skeleton className="h-5 w-16 mt-1" />
              </div>
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 mx-4" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        

        
        {/* Order Summary */}
        <Skeleton className="h-7 w-44 mt-8 mb-3" />
        
        <div className="bg-neutral-800 rounded-xl p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            <div className="flex justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            <div className="flex justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            
            <div className="border-t border-neutral-700 my-2 pt-2 flex justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Checkout Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 max-w-md mx-auto z-10 mb-16">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
