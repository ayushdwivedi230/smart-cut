import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Salon } from "@shared/schema";

interface SalonCardProps {
  salon: Salon;
}

export default function SalonCard({ salon }: SalonCardProps) {
  return (
    <Card className="overflow-hidden hover-lift" data-testid={`card-salon-${salon.id}`}>
      <img
        src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400"
        alt={`${salon.name} interior`}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-foreground" data-testid={`text-salon-name-${salon.id}`}>
            {salon.name}
          </h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm font-medium" data-testid={`text-rating-${salon.id}`}>
              {salon.rating}
            </span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-2" />
          <span data-testid={`text-address-${salon.id}`}>{salon.address}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Clock className="w-4 h-4 mr-2" />
          <span>0.5 mi away</span>
          <span className="mx-2">•</span>
          <Badge variant="secondary" className="text-green-600 bg-green-100">
            Open now
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Starting from</span>
            <p className="text-lg font-semibold text-primary">₹250</p>
          </div>
          <Link href={`/salon/${salon.id}`}>
            <Button data-testid={`button-view-salon-${salon.id}`}>
              View Profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
