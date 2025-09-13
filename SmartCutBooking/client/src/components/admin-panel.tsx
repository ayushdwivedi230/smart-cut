import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Store, 
  CalendarCheck, 
  DollarSign, 
  Download, 
  Settings,
  UserPlus,
  Building,
  Activity,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequestWithAuth } from "@/lib/auth";
import type { User, Appointment, Barber, Service, Salon } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalSalons: number;
  totalAppointments: number;
  pendingSalons: number;
}

interface AppointmentWithDetails extends Appointment {
  customer: User;
  barber: Barber;
  service: Service;
  salon: Salon;
}

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/admin/appointments"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const approveSalonMutation = useMutation({
    mutationFn: async ({ id, isApproved }: { id: string; isApproved: boolean }) => {
      return apiRequestWithAuth("PATCH", `/api/admin/salons/${id}/approve`, { isApproved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Salon approval status updated successfully",
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

  const recentAppointments = appointments.slice(0, 10);
  const recentUsers = users.slice(-10);

  // Mock data for pending salon approvals since the storage doesn't track this separately
  const pendingSalonApprovals = [
    {
      id: "pending-1",
      name: "Modern Styles Studio",
      owner: "Sarah Wilson",
      location: "Downtown, NYC",
      submitted: "2 hours ago",
    },
    {
      id: "pending-2", 
      name: "Urban Cuts",
      owner: "Mike Chen",
      location: "Midtown, NYC",
      submitted: "5 hours ago",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      type: "user_registration",
      description: "New user registration: John Smith",
      timestamp: "2 minutes ago",
      icon: UserPlus,
    },
    {
      id: "2",
      type: "salon_registration",
      description: "New salon registered: Elite Cuts",
      timestamp: "15 minutes ago",
      icon: Building,
    },
    {
      id: "3",
      type: "appointment_completed",
      description: "Booking completed: Premium Cuts",
      timestamp: "1 hour ago",
      icon: CalendarCheck,
    },
  ];

  return (
    <section className="py-20 bg-muted" data-testid="section-admin-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
            <p className="text-muted-foreground">Monitor platform activity and manage users</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" data-testid="button-export-data">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button data-testid="button-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                <Users className="text-primary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-users">
                  {statsLoading ? "..." : stats?.totalUsers || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                <Store className="text-secondary text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-salons">
                  {statsLoading ? "..." : stats?.totalSalons || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active Salons</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <CalendarCheck className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-bookings">
                  {statsLoading ? "..." : stats?.totalAppointments || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">₹84,72,300</p>
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted rounded-lg" data-testid={`activity-${activity.id}`}>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground" data-testid={`activity-description-${activity.id}`}>
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`activity-timestamp-${activity.id}`}>
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* User Management */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">User Management</h3>
              <Button variant="ghost" size="sm" data-testid="button-view-all-users">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {usersLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-16"></div>
                  ))}
                </div>
              ) : (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`user-item-${user.id}`}>
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"
                        alt={`${user.name} profile`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground" data-testid={`user-name-${user.id}`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`user-email-${user.id}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={user.role === "admin" ? "default" : user.role === "barber" ? "secondary" : "outline"}
                        data-testid={`user-role-${user.id}`}
                      >
                        {user.role}
                      </Badge>
                      <Button variant="ghost" size="sm" data-testid={`button-user-menu-${user.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">Recent Appointments</h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Input
                  placeholder="Search appointments..."
                  className="pl-8 w-64"
                  data-testid="input-search-appointments"
                />
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm" data-testid="button-filter-appointments">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Salon</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {appointmentsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                      <td className="py-3 px-4"><div className="animate-pulse bg-muted h-4 rounded"></div></td>
                    </tr>
                  ))
                ) : (
                  recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-border" data-testid={`appointment-row-${appointment.id}`}>
                      <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`appointment-customer-${appointment.id}`}>
                        {appointment.customer.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`appointment-service-${appointment.id}`}>
                        {appointment.service.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`appointment-salon-${appointment.id}`}>
                        {appointment.salon.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`appointment-date-${appointment.id}`}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            appointment.status === "completed" ? "default" :
                            appointment.status === "confirmed" ? "secondary" :
                            appointment.status === "pending" ? "outline" : "destructive"
                          }
                          data-testid={`appointment-status-${appointment.id}`}
                        >
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`appointment-amount-${appointment.id}`}>
                        ${appointment.totalPrice}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Salon Approval Requests */}
        <Card className="p-6 mt-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Pending Salon Approvals</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Salon Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Owner</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSalonApprovals.map((salon) => (
                  <tr key={salon.id} className="border-b border-border" data-testid={`pending-salon-${salon.id}`}>
                    <td className="py-3 px-4 text-sm font-medium text-foreground" data-testid={`salon-name-${salon.id}`}>
                      {salon.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`salon-owner-${salon.id}`}>
                      {salon.owner}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`salon-location-${salon.id}`}>
                      {salon.location}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground" data-testid={`salon-submitted-${salon.id}`}>
                      {salon.submitted}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600"
                          disabled={approveSalonMutation.isPending}
                          onClick={() => approveSalonMutation.mutate({ id: salon.id, isApproved: true })}
                          data-testid={`button-approve-${salon.id}`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 text-white hover:bg-red-600"
                          disabled={approveSalonMutation.isPending}
                          onClick={() => approveSalonMutation.mutate({ id: salon.id, isApproved: false })}
                          data-testid={`button-reject-${salon.id}`}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-details-${salon.id}`}
                        >
                          Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
