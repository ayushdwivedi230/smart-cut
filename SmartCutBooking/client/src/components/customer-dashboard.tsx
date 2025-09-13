import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, History, Heart, DollarSign, Plus, Search, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthService, apiRequestWithAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { Appointment, Barber, Service, Salon, User } from "@shared/schema";

interface AppointmentWithDetails extends Appointment {
  barber: Barber;
  service: Service;
  salon: Salon;
}

export default function CustomerDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const user = AuthService.getUser();

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments/my"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequestWithAuth("PATCH", `/api/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/my"] });
      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const upcomingAppointments = appointments.filter(
    app => app.status === "confirmed" || app.status === "pending"
  );
  const completedAppointments = appointments.filter(app => app.status === "completed");

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <section className="py-20 bg-muted" data-testid="section-customer-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-muted-foreground">Manage your appointments and discover new salons</p>
          </div>
          <Button data-testid="button-new-appointment">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dashboard Stats */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <CalendarCheck className="text-primary text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-upcoming">
                      {upcomingAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                    <History className="text-secondary text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-completed">
                      {completedAppointments.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="text-red-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <DollarSign className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      ₹{completedAppointments.reduce((sum, app) => sum + parseFloat(app.totalPrice), 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-6">Upcoming Appointments</h3>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg" data-testid={`appointment-${appointment.id}`}>
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"
                        alt="Barber"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{appointment.service.name}</h4>
                        <p className="text-sm text-muted-foreground">with {appointment.salon.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(appointment.appointmentDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">₹{appointment.totalPrice}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-reschedule-${appointment.id}`}
                          >
                            Reschedule
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: "cancelled" })}
                            data-testid={`button-cancel-${appointment.id}`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming appointments</p>
                  <Button 
                    className="mt-4" 
                    data-testid="button-book-first"
                    onClick={() => navigate('/')}
                  >
                    Book Your First Appointment
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  data-testid="button-quick-book"
                  onClick={() => navigate('/')}
                >
                  <Plus className="text-primary mr-3 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start" 
                  data-testid="button-quick-find"
                  onClick={() => {
                    navigate('/');
                    // Scroll to salons section after navigation
                    setTimeout(() => {
                      const salonsSection = document.getElementById('salons');
                      if (salonsSection) {
                        salonsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  <Search className="text-secondary mr-3 h-4 w-4" />
                  Find New Salons
                </Button>
                <Button variant="ghost" className="w-full justify-start" data-testid="button-quick-profile">
                  <UserIcon className="text-accent-foreground mr-3 h-4 w-4" />
                  Update Profile
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Favorite Salons</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3"
                    alt="Salon"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground">Premium Cuts</h4>
                    <p className="text-xs text-muted-foreground">4.8 ★ • 0.5 mi</p>
                  </div>
                  <Button size="sm" variant="ghost" data-testid="button-book-favorite">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
