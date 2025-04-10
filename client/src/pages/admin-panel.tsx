import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, InsertUser, Event, Ticket } from "@shared/schema";
import { Loader2, Download, Users, Calendar, TicketIcon } from "lucide-react";
import {
  exportUsersToCsv,
  exportTicketSalesToCSV,
  exportEventsToCsv,
} from "@/lib/export-utils";

// Schema for adding a new organizer
const addOrganizerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
});

type AddOrganizerValues = z.infer<typeof addOrganizerSchema>;

export default function AdminPanel() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddOrganizerOpen, setIsAddOrganizerOpen] = useState(false);

  // Redirect if not admin
  if (user && !user.isSuperAdmin && !user.isOrganizer) {
    window.location.href = "/";
    return null;
  }

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: tickets, isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets/all"],
  });

  const addOrganizerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/organizers", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "New organizer added successfully",
      });
      setIsAddOrganizerOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const form = useForm<AddOrganizerValues>({
    resolver: zodResolver(addOrganizerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
    },
  });

  function onSubmit(values: AddOrganizerValues) {
    addOrganizerMutation.mutate({
      ...values,
      isOrganizer: true,
      isSuperAdmin: false,
    });
  }

  const handleExportUsers = () => {
    if (users && users.length > 0) {
      exportUsersToCsv(users);
      toast({
        title: "Export Successful",
        description: "Users data has been exported to CSV",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "No user data available to export",
        variant: "destructive",
      });
    }
  };

  const handleExportTickets = () => {
    if (tickets && tickets.length > 0 && events && events.length > 0) {
      exportTicketSalesToCSV(tickets, events);
      toast({
        title: "Export Successful",
        description: "Ticket sales data has been exported to CSV",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "No ticket data available to export",
        variant: "destructive",
      });
    }
  };

  const handleExportEvents = () => {
    if (events && events.length > 0 && users) {
      const organizers = users.filter((u) => u.isOrganizer);
      exportEventsToCsv(events, organizers);
      toast({
        title: "Export Successful",
        description: "Events data has been exported to CSV",
      });
    } else {
      toast({
        title: "Export Failed",
        description: "No event data available to export",
        variant: "destructive",
      });
    }
  };

  const handleToggleOrganizer = (user: User) => {
    // Don't allow toggling super admin privileges
    if (user.isSuperAdmin) return;
    
    // Show confirmation toast before changing status
    toast({
      title: user.isOrganizer ? "Removing organizer privileges" : "Granting organizer privileges",
      description: `Are you sure you want to ${user.isOrganizer ? 'remove' : 'grant'} organizer privileges for ${user.fullName}?`,
      action: (
        <Button
          onClick={() => {
            updateUserMutation.mutate({
              id: user.id,
              data: { isOrganizer: !user.isOrganizer },
            });
          }}
          variant="default"
          className="bg-primary text-black border-none"
        >
          Confirm
        </Button>
      ),
    });
  };

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-2 ml-2 font-display relative">
        Admin Panel
        <span className="text-primary text-4xl font-calligraphy absolute -right-5 -top-3 italic transform ">
          f off
        </span>
      </h1>
      <p className="text-gray-400 mb-6 ml-2">Manage users, events, and settings</p>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="tickets">
            <TicketIcon className="h-4 w-4 mr-2" />
            Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold mb-4 font-display ml-2">
              User Management
            </h2>
            <div className="flex gap-4">
              {user?.isSuperAdmin && (
                <Dialog
                  open={isAddOrganizerOpen}
                  onOpenChange={setIsAddOrganizerOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="btn-hover-effect bg-primary text-black font-semibold border-primary"
                    >
                      Add Organizer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add a New Organizer</DialogTitle>
                      <DialogDescription>
                        Create a new user with organizer privileges.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={addOrganizerMutation.isPending}
                            className="mt-4 bg-primary text-black font-semibold hover:bg-primary/80"
                          >
                            {addOrganizerMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Organizer
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              <Button
                variant="outline"
                onClick={handleExportUsers}
                disabled={isLoadingUsers || !users || users.length === 0}
                className="border-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {users &&
                users.map((user) => (
                  <Card
                    key={user.id}
                    className="overflow-hidden border-primary"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{user.fullName}</CardTitle>
                          <CardDescription>{user.email}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {user.isSuperAdmin ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs">
                              Super Admin
                            </span>
                          ) : user.isOrganizer ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                              Organizer
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                              User
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        Username:{" "}
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 bg-gray-50 flex justify-between">
                      <div className="flex items-center">
                        <span className="text-sm">
                          User ID: {user.id}
                        </span>
                      </div>
                      
                      {user?.isSuperAdmin ? (
                        <span className="text-xs text-gray-500 italic">Super admin privileges cannot be modified</span>
                      ) : (
                        <Button
                          variant={user.isOrganizer ? "destructive" : "secondary"}
                          onClick={() => handleToggleOrganizer(user)}
                          disabled={updateUserMutation.isPending}
                          className="text-xs"
                          size="sm"
                        >
                          {updateUserMutation.isPending && (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          )}
                          {user.isOrganizer ? "Remove Organizer Privileges" : "Grant Organizer Privileges"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4 mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold mb-4 font-display ml-2 mt-3">
              Events Management
            </h2>
            <Button
              variant="outline"
              onClick={handleExportEvents}
              disabled={isLoadingEvents || !events || events.length === 0}
              className="border-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Events
            </Button>
          </div>

          {isLoadingEvents ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {events &&
                events.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden border-primary"
                  >
                    <CardHeader>
                      <div className="flex justify-between">
                        <div>
                          <CardTitle>{event.title}</CardTitle>
                          <CardDescription>
                            {new Date(event.date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {event.featured && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-black rounded-md text-xs h-5">
                            Featured
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {event.location}
                        </div>
                        <div>
                          <span className="font-medium">Address:</span>{" "}
                          {event.address}
                        </div>
                        <div>
                          <span className="font-medium">Organizer ID:</span>{" "}
                          {event.organizedById}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4 mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-semibold mb-4 font-display ml-2 mt-3">
              Ticket Sales
            </h2>
            <Button
              variant="outline"
              onClick={handleExportTickets}
              disabled={isLoadingTickets || !tickets || tickets.length === 0}
              className="border-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Ticket Sales
            </Button>
          </div>

          {isLoadingTickets ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {tickets &&
                tickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="overflow-hidden border-primary"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Ticket #{ticket.id}</CardTitle>
                          <CardDescription>
                            Ref: {ticket.referenceNumber}
                          </CardDescription>
                        </div>
                        <div className="text-lg font-semibold">
                          ${ticket.totalPrice || "0.00"}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Event ID:</span>{" "}
                          {ticket.eventId}
                        </div>
                        <div>
                          <span className="font-medium">User ID:</span>{" "}
                          {ticket.userId}
                        </div>
                        <div>
                          <span className="font-medium">Purchased:</span>{" "}
                          {new Date(ticket.purchaseDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span>{" "}
                          {ticket.quantity}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
