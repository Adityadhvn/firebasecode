import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
// Import party background image
import partyBgImage from "../assets/party-background.gif";

// Create validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Form handlers
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
    },
  });

  // Redirect if user is already logged in
  if (user) {
    navigate("/");
    return null
  }

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate({
      username: values.username,
      password: values.password,
      email: values.email,
      fullName: values.name,
      isOrganizer: false
    });
  };

  // Custom styling for background with gif overlay
  const containerStyle = {
    backgroundImage: `url(${partyBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={containerStyle}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="w-full max-w-md flex flex-col md:flex-row relative z-10 bg-transparent">
        {/* Left side - branding */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center items-center md:items-end">
          <div className="text-center mb-4">
            <h1 className="text-7xl font-bold text-white mb-2" style={{fontFamily: "'Great Vibes', cursive"}}>Partier</h1>
            <p className="text-xl text-white/80 font-light"> By A & A</p>
          </div>
        </div>
        
        {/* Right side - form */}
        <Card className="w-full md:w-1/2 border-none bg-black/75 backdrop-blur-lg rounded-xl overflow-hidden shadow-2xl">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-black/50">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  Log In
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Username" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-6 font-medium" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Full Name" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Email" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              placeholder="Username" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Password" 
                              {...field} 
                              className="bg-black/40 border-none h-12 placeholder:text-gray-500"
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 mt-6 font-medium" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="pb-6 pt-0 px-6">
            <p className="text-xs text-center w-full text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}