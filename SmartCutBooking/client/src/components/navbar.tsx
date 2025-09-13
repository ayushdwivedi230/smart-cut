import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { Scissors, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = AuthService.getUser();
  const isAuthenticated = AuthService.isAuthenticated();

  const handleLogout = async () => {
    await AuthService.logout();
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary flex items-center cursor-pointer">
                  <Scissors className="mr-2 h-6 w-6" />
                  Smart Cut
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Home
                </Link>
                <Link href="/#salons" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Find Salons
                </Link>
                <a href="#services" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Services
                </a>
                <a href="#about" className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  About
                </a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" data-testid="link-dashboard">
                      Dashboard
                    </Button>
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm" data-testid="link-admin">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" data-testid="link-signin">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="sm" data-testid="link-signup">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="button-menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-foreground hover:text-primary">
                Home
              </Link>
              <Link href="/#salons" className="block px-3 py-2 text-muted-foreground hover:text-primary">
                Find Salons
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="block px-3 py-2 text-muted-foreground hover:text-primary">
                    Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-3 py-2 text-muted-foreground hover:text-primary">
                      Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-primary">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 text-muted-foreground hover:text-primary">
                    Sign In
                  </Link>
                  <Link href="/login" className="block px-3 py-2 text-muted-foreground hover:text-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
