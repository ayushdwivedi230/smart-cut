import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Clock } from "lucide-react";
import { Link } from "wouter";
import type { Barber, Service, Review, User, Salon } from "@shared/schema";

interface BarberProfileProps {
  barber: Barber;
  services: Service[];
  reviews: (Review & { customer: User })[];
  salon: Salon;
}

export default function BarberProfile({ barber, services, reviews, salon }: BarberProfileProps) {
  const portfolioImages = [
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    "https://images.unsplash.com/photo-1605497788044-5a32c7078486?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
  ];

  return (
    <section className="py-20 bg-muted" data-testid="section-barber-profile">
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
                  data-testid="img-barber-avatar"
                />
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-salon-name">
                    {salon.name}
                  </h2>
                  <p className="text-muted-foreground mb-2" data-testid="text-barber-title">{barber.title}</p>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium" data-testid="text-barber-rating">{barber.rating}</span>
                    <span className="text-sm text-muted-foreground ml-2" data-testid="text-review-count">
                      ({reviews.length} reviews)
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span data-testid="text-salon-address">{salon.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Phone className="w-4 h-4 mr-1" />
                    <span data-testid="text-salon-phone">{salon.phone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-experience">
                    {barber.experience}+ years experience
                  </p>
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
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-primary/10 text-primary"
                      data-testid={`badge-specialty-${index}`}
                    >
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
                    <div key={service.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" data-testid={`service-card-${service.id}`}>
                      <div>
                        <h4 className="font-medium text-foreground" data-testid={`service-name-${service.id}`}>
                          {service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`service-description-${service.id}`}>
                          {service.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span data-testid={`service-duration-${service.id}`}>{service.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary" data-testid={`service-price-${service.id}`}>
                          ${service.price}
                        </p>
                        <Link href={`/book/${barber.id}/${service.id}`}>
                          <Button size="sm" className="mt-2" data-testid={`button-book-service-${service.id}`}>
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
                  {portfolioImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Portfolio ${index + 1}`}
                      className="rounded-lg object-cover w-full h-32 hover-lift"
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
                      <Card key={review.id} className="p-4" data-testid={`review-card-${review.id}`}>
                        <div className="flex items-start space-x-3">
                          <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=60&h=60"
                            alt={`${review.customer.name} profile`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-foreground" data-testid={`review-customer-${review.id}`}>
                                {review.customer.name}
                              </h4>
                              <div className="flex text-yellow-400 text-sm">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`review-comment-${review.id}`}>
                              {review.comment}
                            </p>
                            <span className="text-xs text-muted-foreground" data-testid={`review-date-${review.id}`}>
                              {new Date(review.createdAt!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No reviews yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
