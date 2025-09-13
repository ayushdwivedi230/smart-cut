import { Button } from "@/components/ui/button";
import { Search, Play } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"></div>
      <div 
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1622286346003-c4b1de35ddc1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
        className="relative min-h-screen flex items-center"
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Book Your Perfect
              <span className="text-primary"> Hair Experience</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in">
              Connect with top-rated barbers and salons in your area. Schedule appointments, browse portfolios, and get the cut you deserve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button 
                size="lg" 
                className="hover-lift" 
                data-testid="button-find-salons"
                onClick={() => {
                  const salonsSection = document.getElementById('salons');
                  if (salonsSection) {
                    salonsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Search className="mr-2 h-5 w-5" />
                Find Salons Near Me
              </Button>
              <Button variant="outline" size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-foreground hover-lift" data-testid="button-watch-demo">
                <Play className="mr-2 h-5 w-5" />
                Watch How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
