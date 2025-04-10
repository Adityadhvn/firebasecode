import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/discover";
import EventDetails from "@/pages/event-details";
import TicketPurchase from "@/pages/ticket-purchase";
import TicketConfirmation from "@/pages/ticket-confirmation";
import Events from "@/pages/events";
import Tickets from "@/pages/tickets";
import Profile from "@/pages/profile";
import Scanner from "@/pages/scanner";
import CreateEvent from "@/pages/create-event";
import Login from "@/pages/login";
import ManageEvents from "@/pages/manage-events";
import AdminPanel from "@/pages/admin-panel";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Discover} />
      <ProtectedRoute path="/events" component={Events} />
      <ProtectedRoute path="/event/:id" component={EventDetails} />
      <ProtectedRoute path="/tickets" component={Tickets} />
      <ProtectedRoute path="/ticket/purchase/:eventId" component={TicketPurchase} />
      <ProtectedRoute path="/ticket/confirmation/:referenceNumber" component={TicketConfirmation} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/scanner" component={Scanner} />
      <ProtectedRoute path="/create-event" component={CreateEvent} />
      <ProtectedRoute path="/manage-events" component={ManageEvents} />
      <ProtectedRoute path="/admin-panel" component={AdminPanel} />
      <Route path="/auth">{() => <AuthPage />}</Route>
      <Route path="/login">{() => <Login />}</Route>
      {/* Fallback to 404 */}
      <Route path="*">{() => <NotFound />}</Route>
    </Switch>
  );
}

function App() {
  // Use the wouter hook
  const [location] = useLocation();
  // Check if we're on the login or auth page
  const hideNavbarOn = ['/login', '/auth']; // Routes where navbar should be hidden
  const showNavbar = !hideNavbarOn.includes(location);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-neutral-900 text-neutral-50">
          {showNavbar && <Navbar />}
          <div className={showNavbar ? "pt-16" : ""}>
            <Router />
          </div>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
