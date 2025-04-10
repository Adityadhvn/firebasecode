import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  CircleCheck, 
  Edit, 
  Ticket, 
  ArrowLeft,
  X,
  Plus,
  Star,
  Download,
  Users,
  FileText
} from "lucide-react";
import { Event, TicketType } from "@shared/schema";

export default function ManageEvents() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [newAvailable, setNewAvailable] = useState<number>(0);

  // Check if user is admin
  React.useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (userRole !== "admin" || isLoggedIn !== "true") {
      toast({
        title: "Access Denied",
        description: "You need to be logged in as an admin to access this page.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate, toast]);

  // Fetch all events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Mutation for updating ticket type
  const updateTicketTypeMutation = useMutation({
    mutationFn: async ({ id, available }: { id: number; available: number }) => {
      const response = await apiRequest("PUT", `/api/ticket-types/${id}`, { available });
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      toast({
        title: "Success",
        description: "Ticket availability updated successfully.",
      });
      
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ticket availability. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle ticket edit
  const handleEditTicket = async (event: Event, ticketType: TicketType) => {
    setSelectedEvent(event);
    setSelectedTicketType(ticketType);
    setNewAvailable(ticketType.available);
    setEditDialogOpen(true);
  };

  // Handle saving ticket changes
  const handleSaveTicket = () => {
    if (selectedTicketType && newAvailable !== null) {
      updateTicketTypeMutation.mutate({
        id: selectedTicketType.id,
        available: newAvailable,
      });
    }
  };

  // Load ticket types for an event
  const getTicketTypes = async (eventId: number) => {
    try {
      const response = await fetch(`/api/events/${eventId}/ticket-types`);
      if (!response.ok) throw new Error("Failed to fetch ticket types");
      return await response.json();
    } catch (error) {
      console.error("Error loading ticket types:", error);
      return [];
    }
  };

  // Load ticket types for all events
  const [eventTickets, setEventTickets] = useState<Record<number, TicketType[]>>({});
  
  React.useEffect(() => {
    const fetchTicketTypes = async () => {
      if (events) {
        const ticketData: Record<number, TicketType[]> = {};
        
        for (const event of events) {
          const ticketTypes = await getTicketTypes(event.id);
          ticketData[event.id] = ticketTypes;
        }
        
        setEventTickets(ticketData);
      }
    };
    
    fetchTicketTypes();
  }, [events]);

  // Handle navigation back
  const handleBackClick = () => {
    navigate("/profile");
  };

  if (eventsLoading) {
    return <EventsTableSkeleton />;
  }

  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-4 pt-12 pb-4 bg-gradient-to-b from-black to-neutral-900">
        <div className="flex justify-between items-center">
          <Button 
            size="icon"
            variant="outline"
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border-0"
            onClick={handleBackClick}
          >
            <ArrowLeft className="text-white h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-white">Manage Events</h1>
          <div className="w-10 h-10"></div> {/* Empty div for spacing */}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="text-primary h-5 w-5" />
            <h2 className="font-display text-lg text-white">Admin Dashboard</h2>
          </div>
          <p className="text-neutral-400 text-sm mb-4">
            Manage your events and ticket availability below. Changes will take effect immediately.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            <a 
              href="/api/export/users" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
            >
              <Users className="h-4 w-4 mr-2 text-primary" />
              Export Users (Excel)
            </a>
            
            <a 
              href="/api/export/tickets" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2 text-primary" />
              Export Tickets (CSV)
            </a>
          </div>
        </div>
        
        {events && events.length > 0 ? (
          <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
            <Table>
              <TableHeader className="bg-neutral-800">
                <TableRow>
                  <TableHead className="text-white font-display">Event</TableHead>
                  <TableHead className="text-white font-display">Ticket Types</TableHead>
                  <TableHead className="text-white font-display text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id} className="border-b border-neutral-800">
                    <TableCell className="py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-white">{event.title}</p>
                          <p className="text-sm text-neutral-400">{event.location}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {eventTickets[event.id] ? (
                        <div className="space-y-2">
                          {eventTickets[event.id].map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                              <div>
                                <p className="text-sm text-white">{ticket.name}</p>
                                <p className="text-xs text-neutral-400">${ticket.price} · {ticket.available} available</p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 bg-neutral-700 border-0 hover:bg-neutral-600"
                                onClick={() => handleEditTicket(event, ticket)}
                              >
                                <Edit className="h-4 w-4 text-primary" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500">Loading ticket types...</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Event
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-neutral-800 rounded-xl p-8 text-center">
            <Ticket className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-display text-white mb-2">No Events Found</h3>
            <p className="text-neutral-400 mb-6">There are no events available to manage at this time.</p>
            <Button className="bg-primary hover:bg-primary-light text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          </div>
        )}
      </div>

      {/* Edit Ticket Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">Edit Ticket Availability</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && selectedTicketType && (
            <div className="py-4">
              <div className="bg-neutral-800 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-white">{selectedEvent.title}</h3>
                <p className="text-sm text-neutral-400 mt-1">Ticket Type: {selectedTicketType.name}</p>
                <p className="text-sm text-neutral-400">Price: ${selectedTicketType.price}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="available" className="text-white">Available Tickets</Label>
                  <Input
                    id="available"
                    type="number"
                    min="0"
                    className="mt-1 bg-neutral-800 border-neutral-700 text-white"
                    value={newAvailable}
                    onChange={(e) => setNewAvailable(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-light text-white"
              onClick={handleSaveTicket}
              disabled={updateTicketTypeMutation.isPending}
            >
              {updateTicketTypeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EventsTableSkeleton() {
  return (
    <div className="h-full flex flex-col bg-black">
      <header className="px-4 pt-12 pb-4 bg-gradient-to-b from-black to-neutral-900">
        <div className="flex justify-between items-center">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-7 w-44" />
          <div className="w-10 h-10"></div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="bg-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-full mb-5" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
        
        <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800">
          <div className="p-4 bg-neutral-800">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          
          <div className="p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 border-b border-neutral-800 flex justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="w-1/3">
                  <Skeleton className="h-12 w-full rounded-lg mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}