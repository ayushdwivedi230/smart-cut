import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AuthService, apiRequestWithAuth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import AdminPanel from "@/components/admin-panel";
import { useEffect } from "react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const user = AuthService.getUser();

  useEffect(() => {
    if (!AuthService.isAuthenticated() || user?.role !== "admin") {
      setLocation("/");
    }
  }, [setLocation, user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <AdminPanel />
    </div>
  );
}
