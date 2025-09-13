import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AuthService } from "@/lib/auth";
import { apiRequestWithAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import CustomerDashboard from "@/components/customer-dashboard";
import BarberDashboard from "@/components/barber-dashboard";
import { useEffect } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const user = AuthService.getUser();

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      {user.role === "customer" && <CustomerDashboard />}
      {user.role === "barber" && <BarberDashboard />}
    </div>
  );
}
