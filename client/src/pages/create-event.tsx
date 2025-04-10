import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock, MapPin, Tag, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertEvent, InsertTicketType } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Must be a valid URL"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  address: z.string().min(5, "Address is required"),
});

type CreateEventFormValues = z.infer<typeof createEventSchema>;

export default function CreateEvent() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // For simplicity, we're using a fixed organizer ID
  // In a real app, this would come from auth context
  const organizerId = 2;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [ticketTypes, setTicketTypes] = useState<
    {
      name: string;
      description: string;
      price: string;
      available: number;
    }[]
  >([
    {
      name: "General Admission",
      description: "Basic entry to the event",
      price: "25.00",
      available: 100,
    },
  ]);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      date: "",
      time: "",
      location: "",
      address: "",
    },
  });

  const eventMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      const response = await apiRequest("POST", "/api/events", data);
      return response.json();
    },
    onSuccess: async (newEvent) => {
      console.log("Event created successfully:", newEvent);
      // Create ticket types for the new event
      for (const ticketType of ticketTypes) {
        // Create the ticket type data matching the expected schema types
        const ticketTypeData: InsertTicketType = {
          eventId: newEvent.id,
          name: ticketType.name,
          description: ticketType.description,
          price: parseFloat(ticketType.price),
          available: typeof ticketType.available === 'string' ? parseInt(ticketType.available) : ticketType.available,
        };

        await apiRequest("POST", "/api/ticket-types", ticketTypeData);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Created",
        description: "Your event has been successfully created!",
      });
      navigate("/events");
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      
      // If error has a response, show its message, otherwise use a fallback
      toast({
        title: "Error",
        description: (error as any)?.response?.data?.message || "Failed to create event. Try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (formValues: CreateEventFormValues) => {
    if (tags.length === 0) {
      toast({
        title: "Missing Tags",
        description: "Please add at least one tag for your event.",
        variant: "destructive",
      });
      return;
    }

    if (ticketTypes.length === 0) {
      toast({
        title: "Missing Ticket Types",
        description: "Please add at least one ticket type for your event.",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const dateTimeString = `${formValues.date}T${formValues.time}:00`;

    try {
      // Handle the date conversion properly
      const dateObj = new Date(dateTimeString);
      
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }

      const eventData: InsertEvent = {
        title: formValues.title,
        description: formValues.description,
        imageUrl: formValues.imageUrl,
        date: dateObj,
        location: formValues.location,
        address: formValues.address,
        organizedById: organizerId,
        featured: false,
        tags,
      };
      
      console.log("Event Data being sent:", eventData);

      
      eventMutation.mutate(eventData);
    } catch (error) {
      toast({
        title: "Date Error",
        description: "Invalid date or time format. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", description: "", price: "", available: 0 },
    ]);
  };

  const handleRemoveTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleTicketTypeChange = (
    index: number,
    field: keyof (typeof ticketTypes)[0],
    value: string | number,
  ) => {
    const newTicketTypes = [...ticketTypes];
    newTicketTypes[index][field] = value as never;
    setTicketTypes(newTicketTypes);
  };

  const handleBackClick = () => {
    navigate("/profile");
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10 flex items-center">
        <Button
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-4 border-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="text-white h-5 w-5" />
        </Button>
        <h1 className="font-display font-bold text-xl text-white">
          Create Event
        </h1>
      </header>

      <main className="flex-1 px-4 py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Basic Event Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Event Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., Summer Bass Night"
                        className="bg-neutral-800 border-0 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your event..."
                        className="bg-neutral-800 border-0 text-white min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Cover Image URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        className="bg-neutral-800 border-0 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className="bg-neutral-800 border-0 text-white"
                          {...field}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="time"
                          className="bg-neutral-800 border-0 text-white"
                          {...field}
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Venue Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="E.g., Echo Lounge"
                          className="bg-neutral-800 border-0 text-white"
                          {...field}
                        />
                        <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full venue address"
                        className="bg-neutral-800 border-0 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-white mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-neutral-700 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-neutral-300 hover:text-white hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <div className="relative flex-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag (e.g., Electronic, Live Music)"
                    className="bg-neutral-800 border-0 text-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none h-4 w-4" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="ml-2 bg-neutral-800 border-0 text-white"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Ticket Types */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label className="text-white">Ticket Types</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-secondary border-secondary"
                  onClick={handleAddTicketType}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Type
                </Button>
              </div>

              <div className="space-y-4">
                {ticketTypes.map((ticketType, index) => (
                  <div
                    key={index}
                    className="bg-neutral-800 rounded-xl p-4 relative"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-7 w-7 p-0 text-neutral-500 hover:text-white hover:bg-neutral-700"
                      onClick={() => handleRemoveTicketType(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-neutral-400 text-sm mb-1 block">
                          Name
                        </Label>
                        <Input
                          value={ticketType.name}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "name",
                              e.target.value,
                            )
                          }
                          placeholder="E.g., General Admission"
                          className="bg-neutral-700 border-0 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-neutral-400 text-sm mb-1 block">
                          Price ($)
                        </Label>
                        <Input
                          value={ticketType.price}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "price",
                              e.target.value,
                            )
                          }
                          placeholder="E.g., 25.00"
                          className="bg-neutral-700 border-0 text-white"
                          type="number"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <Label className="text-neutral-400 text-sm mb-1 block">
                          Description
                        </Label>
                        <Input
                          value={ticketType.description}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Brief description"
                          className="bg-neutral-700 border-0 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-neutral-400 text-sm mb-1 block">
                          Available Tickets
                        </Label>
                        <Input
                          value={ticketType.available}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "available",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="Number of tickets"
                          className="bg-neutral-700 border-0 text-white"
                          type="number"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 rounded-xl transition-colors"
              disabled={eventMutation.isPending}
            >
              {eventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
