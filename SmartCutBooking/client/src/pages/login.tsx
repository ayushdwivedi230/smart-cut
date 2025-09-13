import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/lib/auth";
import { Scissors, X } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    role: "customer" as "customer" | "barber",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLoginMode) {
        await AuthService.login(formData.email, formData.password);
        toast({
          title: "Login successful",
          description: "Welcome back to Smart Cut!",
        });
      } else {
        await AuthService.register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
        });
        toast({
          title: "Registration successful",
          description: "Welcome to Smart Cut!",
        });
      }
      
      const user = AuthService.getUser();
      if (user?.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      <Card className="w-full max-w-md relative z-50" data-testid="card-auth">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Scissors className="mr-2 h-6 w-6 text-primary" />
              Welcome to Smart Cut
            </CardTitle>
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-close">
                <X className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} data-testid="form-auth">
            {!isLoginMode && (
              <div className="mb-4">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  data-testid="input-name"
                />
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
                data-testid="input-email"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength={6}
                data-testid="input-password"
              />
            </div>

            {!isLoginMode && (
              <>
                <div className="mb-4">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                
                <div className="mb-6">
                  <Label>I am a</Label>
                  <RadioGroup
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value as "customer" | "barber" })}
                    className="flex space-x-4 mt-2"
                    data-testid="radio-group-role"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="customer" id="customer" />
                      <Label htmlFor="customer">Customer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="barber" id="barber" />
                      <Label htmlFor="barber">Barber/Salon</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}
            
            <Button
              type="submit"
              className="w-full mb-4"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? "Processing..." : (isLoginMode ? "Sign In" : "Create Account")}
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsLoginMode(!isLoginMode)}
                data-testid="button-toggle-mode"
              >
                {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
