import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, LogIn, Key } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle signup form changes
  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // For now, check if it's the admin login
      if (loginForm.username === "admin" && loginForm.password === "admin") {
        // Set admin flag in localStorage
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", "1"); // Admin user ID

        toast({
          title: "Login Successful",
          description: "Welcome, Admin! You are now logged in.",
        });

        // Redirect to the manage events page
        navigate("/manage-events");
      } else {
        // For a regular user, just simulate validation for now
        localStorage.setItem("userRole", "user");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", "1"); // Regular user ID

        toast({
          title: "Login Successful",
          description: "Welcome! You are now logged in.",
        });

        // Redirect to the discover page
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle signup submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate user creation for now
      localStorage.setItem("userRole", "user");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", "1"); // Regular user ID

      toast({
        title: "Signup Successful",
        description: "Your account has been created. Welcome!",
      });

      // Redirect to the discover page
      navigate("/");
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Logo and branding */}
        <div className="mb-8 text-center">
          <h1 className="text-[50px] italic text-primary font-bold font-[Magnolia] mb-2">
            Partier
          </h1>
          <p className="text-neutral-400 text-lg">The ultimate clubbing experience</p>
        </div>

        {/* Login/Signup Tabs */}
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="text-lg py-3">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-lg py-3">
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      Username
                    </Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Enter your username"
                        className="pl-10 bg-neutral-900 border-neutral-800 text-white"
                        value={loginForm.username}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      Password
                    </Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 bg-neutral-900 border-neutral-800 text-white"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light text-white font-medium py-6 rounded-xl transition-colors text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-neutral-500 text-sm">
                    Admin login: username "admin", password "admin"
                  </p>
                </div>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="bg-neutral-900 border-neutral-800 text-white"
                      value={signupForm.name}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="bg-neutral-900 border-neutral-800 text-white"
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      className="bg-neutral-900 border-neutral-800 text-white"
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-neutral-900 border-neutral-800 text-white"
                      value={signupForm.confirmPassword}
                      onChange={handleSignupChange}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light text-white font-medium py-6 rounded-xl transition-colors text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex items-center space-x-4">
          <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-transparent"></div>
          <span className="text-neutral-500 text-sm">Luxury Events Await</span>
          <div className="h-0.5 w-16 bg-gradient-to-l from-primary to-transparent"></div>
        </div>
      </div>
    </div>
  );
}