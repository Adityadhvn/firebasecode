import { useState } from "react";
import { useLocation } from "wouter";
import {
  User,
  Lock,
  CreditCard,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Calendar,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);

  // Get user data from auth context
  const { user, logoutMutation } = useAuth();

  // Fetch user's events (for organizers)
  const { data: organizerEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/organizer', user?.id, 'events'],
    queryFn: () => fetch(`/api/organizer/${user?.id}/events`).then(res => res.json()),
    enabled: !!user?.isOrganizer,
  });

  const handleCreateEventClick = () => {
    setLocation("/create-event");
  };

  const handleEditEventClick = (eventId: number) => {
    setLocation(`/edit-event/${eventId}`);
    // Note: The edit-event route and page would need to be implemented separately
  };

  const handleViewEventClick = (eventId: number) => {
    setLocation(`/event/${eventId}`);
  };

  const handleScannerClick = () => {
    setLocation("/scanner");
  };
  
  const handleAdminPanelClick = () => {
    setLocation("/admin-panel");
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation("/auth");
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      }
    });
  };
  
  const formatEventDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, 'MMM d, yyyy');
  };
  
  // Fix all instances of navigate to use setLocation

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10">
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
      </header>

      <main className="flex-1 px-4">
        {/* User Info */}
        <div className="mt-4 mb-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white text-xl">
                {user?.username ? user.username.charAt(0) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="font-display font-semibold text-xl text-white">
                {user?.username || ''}
                
              </h2>
              <p className="text-neutral-400">{user?.email || 'No email provided'}</p>
            </div>
          </div>
        </div>

        {/* Super Admin Options */}
        {user?.isSuperAdmin && (
          <div className="mb-6">
            <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">
              Super Admin
            </h3>
            <div className="bg-neutral-800 rounded-xl overflow-hidden">
              <button
                className="w-full py-4 px-4 flex items-center justify-between text-white"
                onClick={handleAdminPanelClick}
              >
                <div className="flex items-center">
                  <span className="bg-gradient-to-r from-primary to-amber-500 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-black"
                    >
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"></path>
                      <path d="M12 8v8"></path>
                      <path d="M12 16v.1"></path>
                    </svg>
                  </span>
                  <span>Admin Panel</span>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
          </div>
        )}
        
        {/* Organizer Options (conditionally shown) */}
        {(user?.isOrganizer || user?.isSuperAdmin) && (
          <div className="mb-6">
            <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">
              Organizer Options
            </h3>
            <div className="bg-neutral-800 rounded-xl overflow-hidden">
              <button
                className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white"
                onClick={handleCreateEventClick}
              >
                <div className="flex items-center">
                  <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-4 w-4 text-secondary" />
                  </span>
                  <span>Create New Event</span>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>

              <button
                className="w-full py-4 px-4 flex items-center justify-between text-white"
                onClick={handleScannerClick}
              >
                <div className="flex items-center">
                  <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-secondary"
                    >
                      <polyline points="4 8 4 4 8 4"></polyline>
                      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <polyline points="16 4 20 4 20 8"></polyline>
                      <polyline points="4 16 4 20 8 20"></polyline>
                      <polyline points="16 20 20 20 20 16"></polyline>
                    </svg>
                  </span>
                  <span>Scan Tickets</span>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
          </div>
        )}
        
        {/* My Events (for organizers) */}
        {(user?.isOrganizer || user?.isSuperAdmin) && (
          <div className="mb-6">
            <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">
              My Events
            </h3>
            
            <div className="space-y-4">
              {isLoadingEvents ? (
                // Loading skeleton
                <>
                  <div className="bg-neutral-800 animate-pulse rounded-xl h-24"></div>
                  <div className="bg-neutral-800 animate-pulse rounded-xl h-24"></div>
                </>
              ) : organizerEvents?.length > 0 ? (
                // Event list
                organizerEvents.map((event: Event) => (
                  <div 
                    key={event.id}
                    className="bg-gradient-to-r from-neutral-800 to-neutral-800/70 rounded-xl p-4 border border-neutral-700 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-bold text-white">{event.title}</h4>
                        <p className="text-neutral-400 text-sm">{formatEventDate(event.date)}</p>
                        
                        <div className="flex gap-2 mt-2">
                          {event.tags && event.tags.length > 0 ? (
                            <Badge variant="outline" className="bg-black/50 text-primary border-primary/30">
                              {event.tags[0]}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-black/50 text-primary border-primary/30">
                              Event
                            </Badge>
                          )}
                          {event.featured && (
                            <Badge className="bg-gradient-to-r from-primary to-amber-500 text-black">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-black/40 hover:bg-primary/20 hover:text-primary"
                          onClick={() => handleEditEventClick(event.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-full bg-black/40 hover:bg-primary/20 hover:text-primary"
                          onClick={() => handleViewEventClick(event.id)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // No events
                <div className="bg-neutral-800/50 rounded-xl p-6 text-center border border-dashed border-neutral-700">
                  <Calendar className="h-10 w-10 mx-auto text-neutral-500 mb-2" />
                  <p className="text-neutral-400">You haven't created any events yet</p>
                  <Button 
                    className="mt-4 bg-gradient-to-r from-primary to-amber-600 text-black hover:from-primary/90 hover:to-amber-500"
                    onClick={handleCreateEventClick}
                  >
                    Create Your First Event
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">
            Account Settings
          </h3>
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-secondary" />
                </span>
                <span>Personal Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>

            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Lock className="h-4 w-4 text-secondary" />
                </span>
                <span>Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>

            <button className="w-full py-4 px-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="h-4 w-4 text-secondary" />
                </span>
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">
            Preferences
          </h3>
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Heart className="h-4 w-4 text-secondary" />
                </span>
                <span>Favorite Events</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>

            <div className="py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Bell className="h-4 w-4 text-secondary" />
                </span>
                <span>Notifications</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <button className="w-full py-4 px-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-secondary" />
                </span>
                <span>App Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full py-4 mt-4 bg-neutral-800 border-0 text-red-500 font-medium"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </main>
    </div>
  );
}
