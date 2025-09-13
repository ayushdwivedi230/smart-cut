import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CalendarDays, Clock, Star, DollarSign, UserCog, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AuthService, apiRequestWithAuth } from "@/lib/auth";
import type { Appointment, Service, User } from "@shared/schema";

interface AppointmentWithCustomer extends Appointment {
  customer: User;
  service: Service;
}

export default function BarberDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = AuthService.getUser();

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithCustomer[]>({
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

  const todayAppointments = appointments.filter(app => {
    const today = new Date().toDateString();
    const appointmentDate = new Date(app.appointmentDate).toDateString();
    return appointmentDate === today;
  });

  const pendingAppointments = appointments.filter(app => app.status === "pending");
  const completedAppointments = appointments.filter(app => app.status === "completed");

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const monthlyEarnings = completedAppointments
    .filter(app => {
      const appointmentMonth = new Date(app.appointmentDate).getMonth();
      const currentMonth = new Date().getMonth();
      return appointmentMonth === currentMonth;
    })
    .reduce((sum, app) => sum + parseFloat(app.totalPrice), 0);

  return (
    <section className="py-20 bg-background" data-testid="section-barber-dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Barber Dashboard - {user?.name}</h2>
            <p className="text-muted-foreground">Manage your appointments, profile, and business</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" data-testid="button-edit-profile">
              <UserCog className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button data-testid="button-set-availability">
              <Calendar className="mr-2 h-4 w-4" />
              Set Availability
            </Button>
          </div>
        </div>

        {/* Barber Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <CalendarDays className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-today-bookings">
                  {todayAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">Today's Bookings</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                <Clock className="text-secondary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-bookings">
                  {pendingAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Star className="text-yellow-500 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.9</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-monthly-earnings">
                  ₹{monthlyEarnings.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">This Month</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Today's Schedule</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ))}
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-muted rounded-lg" data-testid={`appointment-${appointment.id}`}>
                      <div className="w-2 h-12 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{appointment.service.name}</h4>
                          <span className="text-lg font-semibold text-primary">₹{appointment.totalPrice}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatTime(appointment.appointmentDate)}</span>
                          <span>{appointment.customer.name}</span>
                          <span>{appointment.customer.phone}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-100 text-green-700 hover:bg-green-200"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: appointment.id, status: "completed" })}
                          data-testid={`button-complete-${appointment.id}`}
                        >
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-reschedule-${appointment.id}`}
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              )}
            </Card>

            {/* Pending Requests */}
            {pendingAppointments.length > 0 && (
              <Card className="p-6 mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Pending Booking Requests</h3>
                <div className="space-y-4">
                  {pendingAppointments.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg" data-testid={`pending-request-${request.id}`}>
                      <div>
                        <h4 className="font-medium text-foreground">{request.service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.appointmentDate).toLocaleDateString()} • {request.customer.name} • {request.customer.phone}
                        </p>
                        {request.notes && <p className="text-sm text-muted-foreground">{request.notes}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: "confirmed" })}
                          data-testid={`button-accept-${request.id}`}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600"
                          disabled={updateStatusMutation.isPending}
                          onClick={() => updateStatusMutation.mutate({ id: request.id, status: "cancelled" })}
                          data-testid={`button-decline-${request.id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Availability Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Availability Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Currently Available</span>
                  <Switch defaultChecked data-testid="switch-availability" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Next available slot: Tomorrow 9:00 AM</p>
                  <p>Today's schedule: 75% full</p>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appointments</span>
                  <span className="font-medium text-foreground">
                    {appointments.filter(app => {
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return new Date(app.appointmentDate) >= weekAgo;
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue</span>
                  <span className="font-medium text-foreground">₹{monthlyEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Customers</span>
                  <span className="font-medium text-foreground">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Rating</span>
                  <span className="font-medium text-foreground">4.9</span>
                </div>
              </div>
            </Card>

            {/* Recent Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reviews</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 text-sm mr-2">
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-sm font-medium text-foreground">David M.</span>
                  </div>
                  <p className="text-sm text-muted-foreground">"Excellent service! Marcus really knows his craft..."</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
