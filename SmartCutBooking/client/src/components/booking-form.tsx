import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AuthService, apiRequestWithAuth } from "@/lib/auth";
import { Calendar, Clock, DollarSign, User, CheckCircle } from "lucide-react";
import type { Service, Barber } from "@shared/schema";

interface BookingFormProps {
  barber: Barber;
  service: Service;
  onSuccess?: () => void;
}

export default function BookingForm({ barber, service, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = AuthService.getUser();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    notes: "",
  });

  const bookingMutation = useMutation({
    mutationFn: async (appointmentData: {
      barberId: string;
      serviceId: string;
      appointmentDate: string;
      notes?: string;
    }) => {
      return apiRequestWithAuth("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/my"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  // Generate available times
  const availableTimes = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    const appointmentDateTime = new Date(`${selectedDate}T${selectedTime}`);
    
    await bookingMutation.mutateAsync({
      barberId: barber.id,
      serviceId: service.id,
      appointmentDate: appointmentDateTime.toISOString(),
      notes: customerInfo.notes,
    });
  };

  return (
    <Card className="shadow-lg" data-testid="card-booking-form">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit}>
          {/* Service Summary */}
          <div className="mb-8 p-6 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Service Details</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground" data-testid="text-service-name">
                  {service.name}
                </h4>
                <p className="text-sm text-muted-foreground" data-testid="text-service-duration">
                  {service.duration} minutes
                </p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-primary" data-testid="text-service-price">
                  ₹{service.price}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Select Date
            </h3>
            <div className="grid grid-cols-7 gap-2" data-testid="date-selection">
              {availableDates.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`text-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                    data-testid={`date-option-${dateStr}`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="text-lg font-medium">
                      {date.getDate()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {date.toLocaleDateString("en-US", { month: "short" })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Choose Time
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3" data-testid="time-selection">
              {availableTimes.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary hover:bg-primary/5"
                    }`}
                    data-testid={`time-option-${time}`}
                  >
                    <span className="text-sm font-medium">
                      {new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  data-testid="input-customer-name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                  data-testid="input-customer-phone"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                  data-testid="input-customer-email"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Any specific requests or notes for your barber..."
                  data-testid="textarea-customer-notes"
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Booking Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="font-medium text-foreground">
                  {selectedDate && selectedTime
                    ? `${new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })} at ${new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}`
                    : "Please select date and time"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium text-foreground">{service.duration} minutes</span>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <span className="text-lg font-semibold text-primary">₹{service.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto px-8 py-4"
              disabled={bookingMutation.isPending || !selectedDate || !selectedTime}
              data-testid="button-confirm-booking"
            >
              <Calendar className="mr-2 h-5 w-5" />
              {bookingMutation.isPending ? "Confirming Booking..." : "Confirm Booking"}
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              You'll receive a confirmation email and SMS shortly
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
