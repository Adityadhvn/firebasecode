import { useLocation } from "wouter";
import { Compass, CalendarDays, Ticket, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import * as React from "react";

export default function Navbar() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  // Mock user data - in a real app, this would come from auth context
  const user = {
    name: "Aditya Dhawan",
  };

  return (
    <div>
      {/* Top header with logo only */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-10">
        <nav className="bg-gradient-to-b from-black to-neutral-900 border-b border-neutral-800 py-4 px-6">
          <div className="flex justify-center items-center">
            {/* Logo area */}
            <div className="text-[37px] italic text-primary font-bold font-[Magnolia]">
              Partier
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom navigation with icons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-10">
        <nav className="bg-gradient-to-t from-black to-neutral-900 border-t border-neutral-800 py-2">
          <div className="flex justify-around items-center">
            <NavButton
              icon={<Compass size={24} />}
              label="Discover"
              path="/"
              isActive={isActive("/")}
            />
            <NavButton
              icon={<CalendarDays size={24} />}
              label="Events"
              path="/events"
              isActive={isActive("/events")}
            />
            <NavButton
              icon={<Ticket size={24} />}
              label="Tickets"
              path="/tickets"
              isActive={isActive("/tickets")}
            />
            <NavButton
              icon={<User size={24} />}
              label="Profile"
              path="/profile"
              isActive={isActive("/profile")}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function NavButton({ icon, label, path, isActive }: NavButtonProps) {
  const [, navigate] = useLocation();

  return (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center justify-center px-4 py-1"
    >
      <div className={`
        p-2 rounded-full transition-all 
        ${isActive 
          ? "text-primary bg-black/50" 
          : "text-neutral-400 hover:text-neutral-300"
        }
      `}>
        {icon}
      </div>
      <span className={`
        text-xs mt-1 font-medium
        ${isActive ? "text-primary" : "text-neutral-400"}
      `}>
        {label}
      </span>
    </button>
  );
}
