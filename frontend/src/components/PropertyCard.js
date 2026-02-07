import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Maximize, BedDouble, Bath, Car, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { isAuthenticated, token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price, listingType) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString("en-IN")}`;
    }
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to save favorites");
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API}/favorites/${property.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await axios.post(`${API}/favorites/${property.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
      onFavoriteToggle?.();
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handleWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `Hi TM Real Estate, I am interested in this property:\n\n${property.title}\nPrice: ${formatPrice(property.price, property.listing_type)}\nLocation: ${property.sector}, ${property.city}\n\nPlease share more details.`;
    window.open(`https://wa.me/919820351929?text=${encodeURIComponent(message)}`, "_blank");
  };

  const images = property.images?.length > 0 
    ? property.images 
    : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"];

  return (
    <Link to={`/property/${property.id}`} data-testid={`property-card-${property.id}`}>
      <Card className="card-premium overflow-hidden group h-full">
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 shimmer" />
          )}
          <img
            src={images[imageIndex]}
            alt={property.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Image Navigation Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImageIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === imageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {property.is_featured && (
              <Badge className="bg-orange-500 text-white border-0">Featured</Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {property.listing_type === "pg" ? "PG" : property.listing_type}
            </Badge>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isFavorite 
                ? "bg-red-500 text-white" 
                : "bg-white/90 text-slate-600 hover:bg-white"
            }`}
            data-testid={`favorite-btn-${property.id}`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Content */}
        <CardContent className="p-4">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="price-display text-2xl text-primary">
              {formatPrice(property.price, property.listing_type)}
            </span>
            {property.listing_type === "rent" && (
              <span className="text-sm text-muted-foreground">/month</span>
            )}
            {property.listing_type === "pg" && (
              <span className="text-sm text-muted-foreground">/month</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{property.sector}, {property.city}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4" />
                <span>{property.bedrooms} BHK</span>
              </div>
            )}
            {property.area_sqft && (
              <div className="flex items-center gap-1">
                <Maximize className="w-4 h-4" />
                <span>{property.area_sqft} sqft</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-full" size="sm">
              View Details
            </Button>
            <Button 
              onClick={handleWhatsApp}
              className="rounded-full bg-green-600 hover:bg-green-700" 
              size="sm"
              data-testid={`whatsapp-btn-${property.id}`}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
