import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import SalonCard from "@/components/salon-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Star, Search, Filter, Heart, DollarSign, History, CalendarCheck } from "lucide-react";
import { AuthService } from "@/lib/auth";
import type { Salon } from "@shared/schema";

export default function Home() {
  const user = AuthService.getUser();

  const { data: salons, isLoading } = useQuery<Salon[]>({
    queryKey: ["/api/salons"],
  });

  return (
    <div className="bg-background font-sans">
      <Navbar />
      
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-muted" data-testid="section-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Smart Cut?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Experience the future of salon booking with our comprehensive platform designed for both customers and professionals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 hover-lift" data-testid="card-feature-nearby">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Find Nearby Salons</h3>
              <p className="text-muted-foreground">Discover top-rated salons and barbers in your area with detailed profiles, portfolios, and real customer reviews.</p>
            </Card>
            <Card className="p-8 hover-lift" data-testid="card-feature-booking">
              <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Booking</h3>
              <p className="text-muted-foreground">Book appointments instantly with live availability. Reschedule or cancel with ease, all from your dashboard.</p>
            </Card>
            <Card className="p-8 hover-lift" data-testid="card-feature-verified">
              <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Verified Professionals</h3>
              <p className="text-muted-foreground">All barbers and salons are verified with portfolios, certifications, and genuine customer ratings for your peace of mind.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Salon Listing Section */}
      <section id="salons" className="py-20 bg-background" data-testid="section-salons">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Popular Salons & Barbers</h2>
              <p className="text-xl text-muted-foreground">Discover highly-rated professionals in your area</p>
            </div>
            <div className="flex items-center space-x-4 mt-6 md:mt-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search location..."
                  className="pl-10 w-64"
                  data-testid="input-search-location"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="outline" data-testid="button-filter">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-t-xl"></div>
                  <div className="bg-white p-6 rounded-b-xl">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : salons && salons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {salons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No salons available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="secondary" size="lg" data-testid="button-view-all-salons">
              View All Salons
            </Button>
          </div>
        </div>
      </section>

      {/* Customer Dashboard Preview (if logged in) */}
      {user && user.role === 'customer' && (
        <section className="py-20 bg-muted" data-testid="section-dashboard-preview">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your Dashboard</h2>
              <p className="text-xl text-muted-foreground">Quick overview of your recent activity</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3</p>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mr-4">
                    <History className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">24</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
                    <Heart className="h-6 w-6 text-red-500" />
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
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">₹840</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12" data-testid="section-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Smart Cut
              </h3>
              <p className="text-muted-foreground mb-4">
                Your premier destination for professional salon booking. Connect with top-rated barbers and salons effortlessly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Customers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Find Salons</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Book Appointment</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">My Bookings</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Professionals</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Join as Barber</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Manage Profile</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Business Tools</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground">&copy; 2024 Smart Cut. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
