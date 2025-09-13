import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Mail, Clock } from "lucide-react";
import Navbar from "@/components/navbar";
import type { Salon, Barber, Service, Review, User } from "@shared/schema";

interface SalonData {
  salon: Salon;
  barbers: Barber[];
}

interface BarberWithServices {
  barber: Barber;
  services: Service[];
  reviews: (Review & { customer: User })[];
}

export default function SalonProfile() {
  const { id } = useParams<{ id: string }>();

  const { data: salonData, isLoading: salonLoading } = useQuery<SalonData>({
    queryKey: ["/api/salons", id],
    enabled: !!id,
  });

  const { data: barberData, isLoading: barberLoading } = useQuery<BarberWithServices>({
    queryKey: ["/api/barbers", salonData?.barbers[0]?.id],
    enabled: !!salonData?.barbers[0]?.id,
  });

  if (salonLoading || barberLoading) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-64 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div>
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!salonData || !barberData) {
    return (
      <div className="bg-background min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Salon not found</h2>
            <p className="text-muted-foreground mb-8">The salon you're looking for doesn't exist or has been removed.</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { salon } = salonData;
  const { barber, services, reviews } = barberData;

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <section className="py-20 bg-muted" data-testid="section-salon-profile">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Info */}
              <div className="p-8">
                <div className="flex items-start space-x-6 mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
                    alt={`${barber.title} profile`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-barber-name">
                      {salon.name}
                    </h2>
                    <p className="text-muted-foreground mb-2">{barber.title}</p>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium" data-testid="text-rating">{barber.rating}</span>
                      <span className="text-sm text-muted-foreground ml-2" data-testid="text-review-count">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{salon.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{salon.phone}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{barber.experience}+ years experience</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">About</h3>
                  <p className="text-muted-foreground" data-testid="text-bio">
                    {barber.bio}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {barber.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary" data-testid={`badge-specialty-${index}`}>
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Services & Pricing */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Services & Pricing</h3>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`service-${service.id}`}>
                        <div>
                          <h4 className="font-medium text-foreground">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <span className="text-xs text-muted-foreground">{service.duration} min</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary">₹{service.price}</p>
                          <Link href={`/book/${barber.id}/${service.id}`}>
                            <Button size="sm" className="mt-2" data-testid={`button-book-${service.id}`}>
                              Book Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portfolio & Reviews */}
              <div className="p-8 bg-muted">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Portfolio</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
                      "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
                      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
                      "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
                    ].map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt={`Portfolio ${index + 1}`}
                        className="rounded-lg object-cover w-full h-32"
                        data-testid={`img-portfolio-${index}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {reviews.length > 0 ? (
                      reviews.slice(0, 3).map((review) => (
                        <Card key={review.id} className="p-4" data-testid={`review-${review.id}`}>
                          <div className="flex items-start space-x-3">
                            <img
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"
                              alt={`${review.customer.name} profile`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">{review.customer.name}</h4>
                                <div className="flex text-yellow-400 text-sm">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
